/**
 * Content Chunker
 * Section-aware chunking for MDX content with configurable token limits
 */

import type { ChunkingOptions, Frontmatter, ContentChunk, ChunkMetadata } from "./types"

// Simple token estimation (4 chars ~ 1 token for Portuguese)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

interface Section {
  title: string | null
  level: number
  content: string
  startLine: number
}

/**
 * Parse MDX content into sections based on headings
 */
function parseIntoSections(content: string): Section[] {
  const lines = content.split("\n")
  const sections: Section[] = []
  let currentSection: Section | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)

    if (headingMatch) {
      // Save previous section if exists
      if (currentSection && currentSection.content.trim()) {
        sections.push(currentSection)
      }

      // Start new section
      const level = headingMatch[1].length
      const title = headingMatch[2].trim()

      currentSection = {
        title,
        level,
        content: line + "\n",
        startLine: i,
      }
    } else if (currentSection) {
      currentSection.content += line + "\n"
    } else {
      // Content before first heading
      if (!currentSection) {
        currentSection = {
          title: null,
          level: 0,
          content: line + "\n",
          startLine: i,
        }
      }
    }
  }

  // Don't forget the last section
  if (currentSection && currentSection.content.trim()) {
    sections.push(currentSection)
  }

  return sections
}

/**
 * Merge small sections that are below the minimum token threshold
 */
function mergeSections(sections: Section[], minTokens: number = 100): Section[] {
  const merged: Section[] = []

  for (const section of sections) {
    const tokens = estimateTokens(section.content)

    if (merged.length === 0) {
      merged.push(section)
      continue
    }

    const lastMerged = merged[merged.length - 1]
    const lastTokens = estimateTokens(lastMerged.content)

    // Merge if current section is small and related (same or deeper level)
    if (tokens < minTokens && section.level >= lastMerged.level) {
      lastMerged.content += "\n" + section.content
    } else if (lastTokens < minTokens) {
      // Merge into previous if previous is small
      lastMerged.content += "\n" + section.content
      if (section.title && !lastMerged.title) {
        lastMerged.title = section.title
      }
    } else {
      merged.push(section)
    }
  }

  return merged
}

/**
 * Split a large section into smaller chunks with overlap
 */
function splitLargeSection(
  section: Section,
  maxTokens: number,
  overlapTokens: number
): Section[] {
  const tokens = estimateTokens(section.content)

  if (tokens <= maxTokens) {
    return [section]
  }

  const chunks: Section[] = []
  const paragraphs = section.content.split(/\n\n+/)
  let currentContent = ""
  let chunkIndex = 0

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i]
    const testContent = currentContent ? currentContent + "\n\n" + paragraph : paragraph
    const testTokens = estimateTokens(testContent)

    if (testTokens > maxTokens && currentContent) {
      // Save current chunk
      chunks.push({
        title: section.title ? `${section.title} (parte ${chunkIndex + 1})` : null,
        level: section.level,
        content: currentContent.trim(),
        startLine: section.startLine,
      })

      // Start new chunk with overlap
      const overlapChars = overlapTokens * 4
      const overlapStart = Math.max(0, currentContent.length - overlapChars)
      const overlapText = currentContent.slice(overlapStart)
      currentContent = overlapText + "\n\n" + paragraph
      chunkIndex++
    } else {
      currentContent = testContent
    }
  }

  // Don't forget the last chunk
  if (currentContent.trim()) {
    chunks.push({
      title: section.title
        ? chunks.length > 0
          ? `${section.title} (parte ${chunkIndex + 1})`
          : section.title
        : null,
      level: section.level,
      content: currentContent.trim(),
      startLine: section.startLine,
    })
  }

  return chunks
}

/**
 * Create chunk metadata from frontmatter
 */
function createChunkMetadata(frontmatter: Frontmatter): ChunkMetadata {
  return {
    tags: frontmatter.tags,
    sources: frontmatter.sources,
    searchKeywords: frontmatter.searchKeywords,
    commonQuestions: frontmatter.commonQuestions,
    relatedArticles: frontmatter.relatedArticles,
    lastVerified: frontmatter.lastVerified,
    lastUpdated: frontmatter.lastUpdated,
    status: frontmatter.status || "draft",
    originalTitle: frontmatter.title,
  }
}

/**
 * Main chunking function
 * Converts MDX content into database-ready chunks
 */
export function chunkContent(
  content: string,
  frontmatter: Frontmatter,
  filePath: string,
  contentHash: string,
  options: ChunkingOptions = {
    maxTokens: 500,
    overlapTokens: 50,
    preserveSections: true,
  }
): ContentChunk[] {
  const { maxTokens, overlapTokens, preserveSections } = options

  // Parse into sections
  let sections = parseIntoSections(content)

  // Merge small sections if preserving section structure
  if (preserveSections) {
    sections = mergeSections(sections, 100)
  }

  // Split large sections
  const processedSections: Section[] = []
  for (const section of sections) {
    const split = splitLargeSection(section, maxTokens, overlapTokens)
    processedSections.push(...split)
  }

  // Convert to ContentChunks
  const metadata = createChunkMetadata(frontmatter)
  const chunks: ContentChunk[] = processedSections.map((section, index) => ({
    sourcePath: filePath,
    title: frontmatter.title,
    sectionTitle: section.title,
    category: frontmatter.category,
    content: section.content.trim(),
    chunkIndex: index,
    sourceHash: contentHash,
    difficulty: frontmatter.difficulty || "basico",
    metadata,
  }))

  return chunks
}

/**
 * Get chunking statistics for a piece of content
 */
export function getChunkingStats(content: string, options: ChunkingOptions) {
  const sections = parseIntoSections(content)
  const merged = mergeSections(sections, 100)

  let totalChunks = 0
  let minTokens = Infinity
  let maxTokensFound = 0
  let totalTokens = 0

  for (const section of merged) {
    const split = splitLargeSection(section, options.maxTokens, options.overlapTokens)
    totalChunks += split.length

    for (const chunk of split) {
      const tokens = estimateTokens(chunk.content)
      minTokens = Math.min(minTokens, tokens)
      maxTokensFound = Math.max(maxTokensFound, tokens)
      totalTokens += tokens
    }
  }

  return {
    originalSections: sections.length,
    mergedSections: merged.length,
    finalChunks: totalChunks,
    tokenStats: {
      min: minTokens === Infinity ? 0 : minTokens,
      max: maxTokensFound,
      average: totalChunks > 0 ? Math.round(totalTokens / totalChunks) : 0,
      total: totalTokens,
    },
  }
}
