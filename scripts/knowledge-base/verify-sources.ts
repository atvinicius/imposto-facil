/**
 * Source Verification Script
 * Checks accessibility and freshness of cited sources
 *
 * Usage:
 *   npx tsx scripts/knowledge-base/verify-sources.ts [options]
 *
 * Options:
 *   --check-urls    Verify URL accessibility
 *   --report        Generate detailed report
 *   --github-issue  Create GitHub issue for outdated sources
 */

import * as fs from "fs"
import * as path from "path"
import type { SourceRegistry, SourceEntry } from "./types"

const SOURCES_FILE = path.join(process.cwd(), "src/content/sources.json")

interface VerificationResult {
  source: SourceEntry
  status: "ok" | "warning" | "error"
  message: string
  httpStatus?: number
  lastModified?: string
}

/**
 * Load source registry
 */
function loadSourceRegistry(): SourceRegistry | null {
  if (!fs.existsSync(SOURCES_FILE)) {
    console.error(`❌ Source registry not found: ${SOURCES_FILE}`)
    return null
  }

  const content = fs.readFileSync(SOURCES_FILE, "utf-8")
  return JSON.parse(content) as SourceRegistry
}

/**
 * Check URL accessibility
 */
async function checkUrl(url: string): Promise<{
  accessible: boolean
  status?: number
  lastModified?: string
}> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "ImpostoFacil Source Verifier/1.0",
      },
    })

    return {
      accessible: response.ok,
      status: response.status,
      lastModified: response.headers.get("last-modified") || undefined,
    }
  } catch {
    return { accessible: false }
  }
}

/**
 * Check if source needs verification (older than 30 days)
 */
function needsVerification(source: SourceEntry): boolean {
  const lastChecked = new Date(source.lastChecked)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  return lastChecked < thirtyDaysAgo
}

/**
 * Verify all sources
 */
async function verifySources(
  registry: SourceRegistry,
  checkUrls: boolean
): Promise<VerificationResult[]> {
  const results: VerificationResult[] = []

  for (const source of registry.sources) {
    console.log(`   Checking: ${source.shortName}...`)

    // Check if needs verification
    if (needsVerification(source)) {
      const result: VerificationResult = {
        source,
        status: "warning",
        message: `Last verified ${source.lastChecked} (more than 30 days ago)`,
      }

      // Check URL if requested
      if (checkUrls && source.url) {
        const urlCheck = await checkUrl(source.url)
        result.httpStatus = urlCheck.status
        result.lastModified = urlCheck.lastModified

        if (!urlCheck.accessible) {
          result.status = "error"
          result.message = `URL not accessible (HTTP ${urlCheck.status || "failed"})`
        }
      }

      results.push(result)
    } else {
      results.push({
        source,
        status: "ok",
        message: "Recently verified",
      })
    }
  }

  return results
}

/**
 * Generate markdown report
 */
function generateReport(results: VerificationResult[]): string {
  const lines: string[] = [
    "# Source Verification Report",
    "",
    `Generated: ${new Date().toISOString().split("T")[0]}`,
    "",
    "## Summary",
    "",
    `- Total sources: ${results.length}`,
    `- OK: ${results.filter((r) => r.status === "ok").length}`,
    `- Warnings: ${results.filter((r) => r.status === "warning").length}`,
    `- Errors: ${results.filter((r) => r.status === "error").length}`,
    "",
    "## Details",
    "",
  ]

  // Group by status
  const errors = results.filter((r) => r.status === "error")
  const warnings = results.filter((r) => r.status === "warning")

  if (errors.length > 0) {
    lines.push("### Errors")
    lines.push("")
    for (const result of errors) {
      lines.push(`- **${result.source.name}**: ${result.message}`)
      lines.push(`  - URL: ${result.source.url}`)
      lines.push(`  - Last checked: ${result.source.lastChecked}`)
      lines.push("")
    }
  }

  if (warnings.length > 0) {
    lines.push("### Warnings")
    lines.push("")
    for (const result of warnings) {
      lines.push(`- **${result.source.name}**: ${result.message}`)
      lines.push(`  - URL: ${result.source.url}`)
      lines.push(`  - Last checked: ${result.source.lastChecked}`)
      lines.push("")
    }
  }

  return lines.join("\n")
}

/**
 * Generate GitHub issue body
 */
function generateGitHubIssue(results: VerificationResult[]): string {
  const issues = results.filter((r) => r.status !== "ok")

  if (issues.length === 0) {
    return ""
  }

  const lines = [
    "## Source Verification Alert",
    "",
    "The following sources need attention:",
    "",
  ]

  for (const result of issues) {
    lines.push(`### ${result.source.name}`)
    lines.push("")
    lines.push(`- **Status**: ${result.status === "error" ? "❌ Error" : "⚠️ Warning"}`)
    lines.push(`- **Issue**: ${result.message}`)
    lines.push(`- **URL**: ${result.source.url}`)
    lines.push(`- **Last Checked**: ${result.source.lastChecked}`)
    lines.push("")
  }

  lines.push("---")
  lines.push("Please review these sources and update the registry.")

  return lines.join("\n")
}

/**
 * Update source registry with new lastChecked dates
 */
function updateRegistry(
  registry: SourceRegistry,
  results: VerificationResult[]
): void {
  const today = new Date().toISOString().split("T")[0]

  for (const result of results) {
    if (result.status === "ok" || result.httpStatus === 200) {
      const source = registry.sources.find((s) => s.id === result.source.id)
      if (source) {
        source.lastChecked = today
      }
    }

    if (result.status === "error") {
      const source = registry.sources.find((s) => s.id === result.source.id)
      if (source) {
        source.status = "unavailable"
      }
    }
  }

  registry.lastUpdated = today
  fs.writeFileSync(SOURCES_FILE, JSON.stringify(registry, null, 2) + "\n")
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const checkUrls = args.includes("--check-urls")
  const report = args.includes("--report")
  const githubIssue = args.includes("--github-issue")

  console.log("\n🔍 Source Verification")
  console.log("═".repeat(50))

  const registry = loadSourceRegistry()

  if (!registry) {
    console.log("\n💡 Create src/content/sources.json to track sources")
    process.exit(0)
  }

  console.log(`\n📚 Found ${registry.sources.length} sources`)
  console.log(`   Last updated: ${registry.lastUpdated}\n`)

  const results = await verifySources(registry, checkUrls)

  // Print summary
  const errors = results.filter((r) => r.status === "error").length
  const warnings = results.filter((r) => r.status === "warning").length

  console.log("\n" + "═".repeat(50))
  console.log("📊 Results")
  console.log("═".repeat(50))
  console.log(`   ✅ OK: ${results.filter((r) => r.status === "ok").length}`)
  console.log(`   ⚠️  Warnings: ${warnings}`)
  console.log(`   ❌ Errors: ${errors}`)

  if (report) {
    const reportContent = generateReport(results)
    const reportPath = path.join(process.cwd(), "source-verification-report.md")
    fs.writeFileSync(reportPath, reportContent)
    console.log(`\n📄 Report saved to: ${reportPath}`)
  }

  if (githubIssue && (errors > 0 || warnings > 0)) {
    const issueBody = generateGitHubIssue(results)
    console.log("\n📋 GitHub Issue Body:")
    console.log("-".repeat(50))
    console.log(issueBody)
    console.log("-".repeat(50))
  }

  // Update registry with new check dates
  if (checkUrls) {
    updateRegistry(registry, results)
    console.log("\n✅ Registry updated with new check dates")
  }

  console.log("")

  // Exit with error if issues found
  if (errors > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
