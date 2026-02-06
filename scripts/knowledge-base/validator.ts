/**
 * Content Validator
 * Validates MDX frontmatter and content quality
 */

import {
  FrontmatterSchema,
  type ValidationResult,
  type ValidationError,
  type ValidationWarning,
  type Frontmatter,
} from "./types"

const MINIMUM_WORD_COUNT_DRAFT = 200
const MINIMUM_WORD_COUNT_PUBLISHED = 500
const REQUIRED_PUBLISHED_FIELDS = ["sources", "lastVerified", "difficulty"]

/**
 * Count words in content (excluding code blocks and frontmatter)
 */
function countWords(content: string): number {
  // Remove code blocks
  const withoutCode = content.replace(/```[\s\S]*?```/g, "")
  // Remove inline code
  const withoutInlineCode = withoutCode.replace(/`[^`]+`/g, "")
  // Count Portuguese words
  const words = withoutInlineCode.match(/[\p{L}]+/gu) || []
  return words.length
}

/**
 * Check for citation patterns in content
 */
function hasCitations(content: string): boolean {
  const citationPatterns = [
    /art\.\s*\d+/i, // art. 156-A
    /EC\s*\d+\/\d+/i, // EC 132/2023
    /LC\s*\d+\/\d+/i, // LC 214/2025
    /Lei\s*Complementar/i,
    /Emenda\s*Constitucional/i,
    /\[.*?\]\(https?:\/\/.*?\)/, // Markdown links
  ]

  return citationPatterns.some((pattern) => pattern.test(content))
}

/**
 * Check for proper heading structure
 */
function validateHeadingStructure(content: string): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  const lines = content.split("\n")
  const headings: { level: number; text: string; line: number }[] = []

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      headings.push({
        level: match[1].length,
        text: match[2],
        line: index + 1,
      })
    }
  })

  if (headings.length === 0) {
    warnings.push({
      field: "content",
      message: "Content has no headings",
      suggestion: "Add H2 headings to structure the content",
    })
    return warnings
  }

  // Check if first heading is H1
  if (headings[0].level !== 1) {
    warnings.push({
      field: "content",
      message: `First heading should be H1, found H${headings[0].level}`,
      suggestion: "Start with a single H1 heading that matches the title",
    })
  }

  // Check for multiple H1s
  const h1Count = headings.filter((h) => h.level === 1).length
  if (h1Count > 1) {
    warnings.push({
      field: "content",
      message: `Multiple H1 headings found (${h1Count})`,
      suggestion: "Use only one H1 heading per document",
    })
  }

  // Check for heading level jumps
  for (let i = 1; i < headings.length; i++) {
    const current = headings[i]
    const previous = headings[i - 1]

    if (current.level > previous.level + 1) {
      warnings.push({
        field: "content",
        message: `Heading level jump at line ${current.line}: H${previous.level} to H${current.level}`,
        suggestion: "Don't skip heading levels (e.g., H2 to H4)",
      })
    }
  }

  return warnings
}

/**
 * Check for related article existence
 */
function validateRelatedArticles(
  frontmatter: Frontmatter,
  existingPaths: string[]
): ValidationWarning[] {
  const warnings: ValidationWarning[] = []

  if (frontmatter.relatedArticles) {
    for (const related of frontmatter.relatedArticles) {
      // Convert slug to expected path pattern
      const expectedPattern = related.replace("/", "/")
      const exists = existingPaths.some(
        (path) => path.includes(expectedPattern) || path.endsWith(`${related}.mdx`)
      )

      if (!exists) {
        warnings.push({
          field: "relatedArticles",
          message: `Related article not found: ${related}`,
          suggestion: "Verify the article path exists or remove the reference",
        })
      }
    }
  }

  return warnings
}

/**
 * Validate frontmatter against schema
 */
function validateFrontmatter(data: unknown): {
  valid: boolean
  parsed?: Frontmatter
  errors: ValidationError[]
} {
  const result = FrontmatterSchema.safeParse(data)

  if (result.success) {
    return {
      valid: true,
      parsed: result.data,
      errors: [],
    }
  }

  const errors: ValidationError[] = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
    value: issue.path.reduce((obj: unknown, key) => {
      if (obj && typeof obj === "object" && key in obj) {
        return (obj as Record<string, unknown>)[key as string]
      }
      return undefined
    }, data),
  }))

  return { valid: false, errors }
}

/**
 * Main validation function
 */
export function validateContent(
  filePath: string,
  frontmatter: unknown,
  content: string,
  existingPaths: string[] = []
): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // Validate frontmatter schema
  const frontmatterResult = validateFrontmatter(frontmatter)

  if (!frontmatterResult.valid) {
    return {
      filePath,
      valid: false,
      errors: frontmatterResult.errors,
      warnings: [],
    }
  }

  const fm = frontmatterResult.parsed!

  // Word count check
  const wordCount = countWords(content)
  const minWords =
    fm.status === "published" ? MINIMUM_WORD_COUNT_PUBLISHED : MINIMUM_WORD_COUNT_DRAFT

  if (wordCount < minWords) {
    if (fm.status === "published") {
      errors.push({
        field: "content",
        message: `Published content requires at least ${minWords} words, found ${wordCount}`,
        value: wordCount,
      })
    } else {
      warnings.push({
        field: "content",
        message: `Content has only ${wordCount} words (minimum ${minWords} for drafts)`,
        suggestion: "Consider adding more detailed content",
      })
    }
  }

  // Published content requirements
  if (fm.status === "published") {
    for (const field of REQUIRED_PUBLISHED_FIELDS) {
      if (!fm[field as keyof Frontmatter]) {
        errors.push({
          field,
          message: `Published content requires ${field}`,
        })
      }
    }

    // Citation check for published content
    if (!hasCitations(content) && (!fm.sources || fm.sources.length === 0)) {
      warnings.push({
        field: "sources",
        message: "Published content should have citations to official sources",
        suggestion: "Add sources in frontmatter or inline citations",
      })
    }
  }

  // Heading structure
  const headingWarnings = validateHeadingStructure(content)
  warnings.push(...headingWarnings)

  // Related articles
  const relatedWarnings = validateRelatedArticles(fm, existingPaths)
  warnings.push(...relatedWarnings)

  // Date consistency
  if (fm.lastVerified && fm.lastUpdated) {
    const verified = new Date(fm.lastVerified)
    const updated = new Date(fm.lastUpdated)

    if (verified < updated) {
      warnings.push({
        field: "lastVerified",
        message: "lastVerified is older than lastUpdated",
        suggestion: "Update lastVerified after making content changes",
      })
    }
  }

  // Check for empty tags
  if (fm.tags && fm.tags.length === 0) {
    warnings.push({
      field: "tags",
      message: "Tags array is empty",
      suggestion: "Add relevant tags or remove the field",
    })
  }

  // Check for duplicate tags
  if (fm.tags) {
    const uniqueTags = new Set(fm.tags)
    if (uniqueTags.size !== fm.tags.length) {
      warnings.push({
        field: "tags",
        message: "Duplicate tags found",
        suggestion: "Remove duplicate tags",
      })
    }
  }

  return {
    filePath,
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Format validation results for console output
 */
export function formatValidationResults(results: ValidationResult[]): string {
  const lines: string[] = []
  const validCount = results.filter((r) => r.valid).length
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0)

  lines.push(`\n📊 Validation Results: ${validCount}/${results.length} valid`)
  lines.push(`   Warnings: ${totalWarnings}`)
  lines.push("")

  for (const result of results) {
    const icon = result.valid ? "✅" : "❌"
    const shortPath = result.filePath.split("/").slice(-2).join("/")
    lines.push(`${icon} ${shortPath}`)

    for (const error of result.errors) {
      lines.push(`   ❌ ${error.field}: ${error.message}`)
    }

    for (const warning of result.warnings) {
      lines.push(`   ⚠️  ${warning.field}: ${warning.message}`)
      if (warning.suggestion) {
        lines.push(`      💡 ${warning.suggestion}`)
      }
    }

    if (result.errors.length > 0 || result.warnings.length > 0) {
      lines.push("")
    }
  }

  return lines.join("\n")
}
