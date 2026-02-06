/**
 * Knowledge Base Ingestion Script
 * Main entry point for content ingestion pipeline
 *
 * Usage:
 *   npx tsx scripts/knowledge-base/ingest.ts [options]
 *
 * Options:
 *   --dry-run    Preview changes without writing to database
 *   --force      Re-ingest all content regardless of hash
 *   --verbose    Show detailed progress
 *   --category   Filter by category (can be repeated)
 */

import "dotenv/config"
import * as fs from "fs"
import * as path from "path"
import * as crypto from "crypto"
import matter from "gray-matter"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { chunkContent, getChunkingStats } from "./chunker"
import { validateContent, formatValidationResults } from "./validator"
import type {
  ContentChunk,
  IngestionOptions,
  IngestionResult,
  Category,
  Frontmatter,
  ParsedContent,
  ChunkingOptions,
} from "./types"

// Configuration
const CONTENT_DIR = path.join(process.cwd(), "src/content")
const BATCH_SIZE = 20 // Embeddings per batch
const CHUNKING_OPTIONS: ChunkingOptions = {
  maxTokens: 500,
  overlapTokens: 50,
  preserveSections: true,
}

// Environment validation
function validateEnvironment(): void {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "OPENAI_API_KEY",
  ]

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:")
    missing.forEach((key) => console.error(`   - ${key}`))
    console.error("\nCreate a .env.local file with these variables.")
    process.exit(1)
  }
}

// Initialize clients
function createSupabaseAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function createOpenAIClient(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

/**
 * Generate content hash for change detection
 */
function generateContentHash(content: string, frontmatter: unknown): string {
  const data = JSON.stringify({ content, frontmatter })
  return crypto.createHash("sha256").update(data).digest("hex").slice(0, 16)
}

/**
 * Find all MDX files in content directory
 */
function findMDXFiles(categories?: Category[]): string[] {
  const files: string[] = []

  const scanDir = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)

      if (entry.isDirectory()) {
        // Filter by category if specified
        if (categories && categories.length > 0) {
          const category = entry.name as Category
          if (categories.includes(category)) {
            scanDir(fullPath)
          }
        } else {
          scanDir(fullPath)
        }
      } else if (entry.name.endsWith(".mdx")) {
        files.push(fullPath)
      }
    }
  }

  scanDir(CONTENT_DIR)
  return files
}

/**
 * Parse MDX file
 */
function parseMDXFile(filePath: string): ParsedContent {
  const fileContent = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(fileContent)
  const contentHash = generateContentHash(content, data)

  return {
    frontmatter: data as Frontmatter,
    content,
    filePath,
    contentHash,
  }
}

/**
 * Generate embeddings in batches
 */
async function generateEmbeddings(
  openai: OpenAI,
  texts: string[],
  verbose: boolean
): Promise<number[][]> {
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE)

    if (verbose) {
      console.log(`   Generating embeddings ${i + 1}-${Math.min(i + BATCH_SIZE, texts.length)}/${texts.length}`)
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    })

    embeddings.push(...response.data.map((d) => d.embedding))
  }

  return embeddings
}

/**
 * Get relative path for database storage
 */
function getRelativePath(filePath: string): string {
  return path.relative(CONTENT_DIR, filePath)
}

/**
 * Check if content has changed by comparing hashes
 */
async function getExistingHashes(
  supabase: SupabaseClient,
  sourcePaths: string[]
): Promise<Map<string, string>> {
  const { data, error } = await supabase
    .from("content_chunks")
    .select("source_path, source_hash")
    .in("source_path", sourcePaths)
    .order("chunk_index", { ascending: true })

  if (error) {
    console.error("Error fetching existing hashes:", error)
    return new Map()
  }

  // Get first hash for each source_path (they should all be the same)
  const hashMap = new Map<string, string>()
  for (const row of data || []) {
    if (!hashMap.has(row.source_path)) {
      hashMap.set(row.source_path, row.source_hash)
    }
  }

  return hashMap
}

/**
 * Delete existing chunks for a source path
 */
async function deleteExistingChunks(
  supabase: SupabaseClient,
  sourcePath: string
): Promise<number> {
  const { data, error } = await supabase
    .from("content_chunks")
    .delete()
    .eq("source_path", sourcePath)
    .select("id")

  if (error) {
    throw new Error(`Failed to delete chunks: ${error.message}`)
  }

  return data?.length || 0
}

/**
 * Insert chunks into database
 */
async function insertChunks(
  supabase: SupabaseClient,
  chunks: ContentChunk[]
): Promise<void> {
  const rows = chunks.map((chunk) => ({
    source_path: chunk.sourcePath,
    title: chunk.title,
    section_title: chunk.sectionTitle,
    category: chunk.category,
    content: chunk.content,
    chunk_index: chunk.chunkIndex,
    source_hash: chunk.sourceHash,
    difficulty: chunk.difficulty,
    metadata: chunk.metadata,
    embedding: chunk.embedding,
  }))

  const { error } = await supabase.from("content_chunks").insert(rows)

  if (error) {
    throw new Error(`Failed to insert chunks: ${error.message}`)
  }
}

/**
 * Ingest a single file
 */
async function ingestFile(
  parsed: ParsedContent,
  supabase: SupabaseClient,
  openai: OpenAI,
  existingHash: string | undefined,
  options: IngestionOptions
): Promise<IngestionResult> {
  const relativePath = getRelativePath(parsed.filePath)
  const result: IngestionResult = {
    filePath: relativePath,
    status: "unchanged",
    chunksCreated: 0,
    chunksUpdated: 0,
    chunksDeleted: 0,
  }

  try {
    // Skip if unchanged (unless force)
    if (!options.force && existingHash === parsed.contentHash) {
      if (options.verbose) {
        console.log(`   ⏭️  ${relativePath} (unchanged)`)
      }
      return result
    }

    // Chunk the content
    const chunks = chunkContent(
      parsed.content,
      parsed.frontmatter,
      relativePath,
      parsed.contentHash,
      CHUNKING_OPTIONS
    )

    if (options.verbose) {
      const stats = getChunkingStats(parsed.content, CHUNKING_OPTIONS)
      console.log(`   📄 ${relativePath}: ${stats.finalChunks} chunks, ~${stats.tokenStats.total} tokens`)
    }

    if (options.dryRun) {
      result.status = existingHash ? "updated" : "created"
      result.chunksCreated = chunks.length
      return result
    }

    // Generate embeddings
    const texts = chunks.map((c) => `${c.title}\n${c.sectionTitle || ""}\n${c.content}`)
    const embeddings = await generateEmbeddings(openai, texts, options.verbose)

    // Add embeddings to chunks
    chunks.forEach((chunk, i) => {
      chunk.embedding = embeddings[i]
    })

    // Delete existing chunks if updating
    if (existingHash) {
      result.chunksDeleted = await deleteExistingChunks(supabase, relativePath)
    }

    // Insert new chunks
    await insertChunks(supabase, chunks)

    result.status = existingHash ? "updated" : "created"
    result.chunksCreated = chunks.length

    if (options.verbose) {
      const icon = existingHash ? "🔄" : "✨"
      console.log(`   ${icon} ${relativePath}: ${chunks.length} chunks ingested`)
    }

    return result
  } catch (error) {
    result.status = "error"
    result.error = error instanceof Error ? error.message : String(error)

    console.error(`   ❌ ${relativePath}: ${result.error}`)
    return result
  }
}

/**
 * Main ingestion function
 */
async function ingest(options: IngestionOptions): Promise<void> {
  console.log("\n🚀 Knowledge Base Ingestion")
  console.log("═".repeat(50))

  if (options.dryRun) {
    console.log("🔍 DRY RUN MODE - No changes will be made\n")
  }

  // Find all MDX files
  const files = findMDXFiles(options.categories)
  console.log(`📁 Found ${files.length} MDX files`)

  if (files.length === 0) {
    console.log("No files to process.")
    return
  }

  // Parse all files
  console.log("\n📖 Parsing content...")
  const parsed = files.map(parseMDXFile)

  // Validate all content
  console.log("\n🔍 Validating content...")
  const allPaths = files.map((f) => getRelativePath(f))
  const validationResults = parsed.map((p) =>
    validateContent(p.filePath, p.frontmatter, p.content, allPaths)
  )

  const invalidCount = validationResults.filter((r) => !r.valid).length
  if (invalidCount > 0) {
    console.log(formatValidationResults(validationResults))

    if (!options.force) {
      console.error(`\n❌ ${invalidCount} file(s) failed validation. Use --force to ingest anyway.`)
      process.exit(1)
    }
    console.log(`\n⚠️  Continuing despite ${invalidCount} validation errors (--force)`)
  } else {
    const warningCount = validationResults.reduce((sum, r) => sum + r.warnings.length, 0)
    console.log(`   ✅ All files valid (${warningCount} warnings)`)
  }

  // Skip database operations in dry run without env vars
  if (options.dryRun && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("\n📊 Dry run statistics:")
    let totalChunks = 0
    for (const p of parsed) {
      const stats = getChunkingStats(p.content, CHUNKING_OPTIONS)
      totalChunks += stats.finalChunks
      console.log(`   ${getRelativePath(p.filePath)}: ${stats.finalChunks} chunks`)
    }
    console.log(`\n   Total chunks: ${totalChunks}`)
    return
  }

  // Initialize clients
  validateEnvironment()
  const supabase = createSupabaseAdmin()
  const openai = createOpenAIClient()

  // Get existing hashes for change detection
  console.log("\n🔄 Checking for changes...")
  const sourcePaths = parsed.map((p) => getRelativePath(p.filePath))
  const existingHashes = await getExistingHashes(supabase, sourcePaths)
  console.log(`   ${existingHashes.size} existing files in database`)

  // Ingest files
  console.log("\n📥 Ingesting content...")
  const results: IngestionResult[] = []

  for (const p of parsed) {
    const relativePath = getRelativePath(p.filePath)
    const existingHash = existingHashes.get(relativePath)
    const result = await ingestFile(p, supabase, openai, existingHash, options)
    results.push(result)
  }

  // Summary
  console.log("\n" + "═".repeat(50))
  console.log("📊 Ingestion Summary")
  console.log("═".repeat(50))

  const created = results.filter((r) => r.status === "created")
  const updated = results.filter((r) => r.status === "updated")
  const unchanged = results.filter((r) => r.status === "unchanged")
  const errors = results.filter((r) => r.status === "error")

  console.log(`   ✨ Created: ${created.length} files (${created.reduce((sum, r) => sum + r.chunksCreated, 0)} chunks)`)
  console.log(`   🔄 Updated: ${updated.length} files (${updated.reduce((sum, r) => sum + r.chunksCreated, 0)} chunks)`)
  console.log(`   ⏭️  Unchanged: ${unchanged.length} files`)

  if (errors.length > 0) {
    console.log(`   ❌ Errors: ${errors.length} files`)
    for (const err of errors) {
      console.log(`      - ${err.filePath}: ${err.error}`)
    }
  }

  console.log("")

  if (options.dryRun) {
    console.log("💡 Run without --dry-run to apply changes")
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): IngestionOptions {
  const args = process.argv.slice(2)
  const options: IngestionOptions = {
    dryRun: false,
    force: false,
    verbose: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case "--dry-run":
        options.dryRun = true
        break
      case "--force":
        options.force = true
        break
      case "--verbose":
      case "-v":
        options.verbose = true
        break
      case "--category":
      case "-c":
        if (!options.categories) options.categories = []
        const category = args[++i] as Category
        options.categories.push(category)
        break
      case "--help":
      case "-h":
        console.log(`
Knowledge Base Ingestion Script

Usage:
  npx tsx scripts/knowledge-base/ingest.ts [options]

Options:
  --dry-run      Preview changes without writing to database
  --force        Re-ingest all content regardless of hash
  --verbose, -v  Show detailed progress
  --category, -c Filter by category (can be repeated)
  --help, -h     Show this help message

Examples:
  npx tsx scripts/knowledge-base/ingest.ts --dry-run
  npx tsx scripts/knowledge-base/ingest.ts --force --verbose
  npx tsx scripts/knowledge-base/ingest.ts -c ibs -c cbs
`)
        process.exit(0)
    }
  }

  return options
}

// Main execution
const options = parseArgs()
ingest(options).catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
