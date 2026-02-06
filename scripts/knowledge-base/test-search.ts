/**
 * Search Quality Test Script
 * Tests the knowledge base search functionality
 *
 * Usage:
 *   npx tsx scripts/knowledge-base/test-search.ts [query]
 */

import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"

// Test cases with expected results
const TEST_CASES = [
  {
    query: "O que e o IBS?",
    expectedCategory: "ibs",
    expectedKeywords: ["Imposto sobre Bens e Servicos", "estados", "municipios"],
    minResults: 1,
  },
  {
    query: "Como funciona a CBS?",
    expectedCategory: "cbs",
    expectedKeywords: ["Contribuicao", "federal", "PIS", "Cofins"],
    minResults: 1,
  },
  {
    query: "Imposto Seletivo bebidas",
    expectedCategory: "is",
    expectedKeywords: ["alcoolicas", "refrigerantes", "acucaradas"],
    minResults: 1,
  },
  {
    query: "Quando comeca a reforma tributaria?",
    expectedCategory: "transicao",
    expectedKeywords: ["2026", "cronograma", "transicao"],
    minResults: 1,
  },
  {
    query: "O que e nao cumulatividade?",
    expectedCategory: "glossario",
    expectedKeywords: ["credito", "cascata"],
    minResults: 1,
  },
  {
    query: "Split payment reforma",
    expectedCategory: null, // Could match multiple
    expectedKeywords: ["pagamento", "transacao"],
    minResults: 1,
  },
  {
    query: "Aliquota IBS CBS",
    expectedCategory: null,
    expectedKeywords: ["17,7%", "8,8%", "26,5%"],
    minResults: 1,
  },
]

interface SearchResult {
  id: string
  source_path: string
  title: string
  category: string
  content: string
  similarity: number
}

interface TestResult {
  query: string
  passed: boolean
  results: SearchResult[]
  categoryMatch: boolean
  keywordsFound: string[]
  keywordsMissing: string[]
  notes: string[]
}

/**
 * Generate embedding for query
 */
async function generateEmbedding(
  openai: OpenAI,
  text: string
): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  })
  return response.data[0].embedding
}

/**
 * Search content chunks
 */
async function search(
  supabase: ReturnType<typeof createClient>,
  openai: OpenAI,
  query: string
): Promise<SearchResult[]> {
  const embedding = await generateEmbedding(openai, query)

  const { data, error } = await supabase.rpc("match_content_chunks", {
    query_embedding: embedding,
    match_threshold: 0.3,
    match_count: 5,
    filter_category: null,
    filter_difficulty: null,
  })

  if (error) {
    throw new Error(`Search error: ${error.message}`)
  }

  return data || []
}

/**
 * Check if content contains keywords
 */
function findKeywords(
  results: SearchResult[],
  keywords: string[]
): { found: string[]; missing: string[] } {
  const allContent = results.map((r) => r.content.toLowerCase()).join(" ")
  const allTitles = results.map((r) => r.title.toLowerCase()).join(" ")
  const combinedText = allContent + " " + allTitles

  const found: string[] = []
  const missing: string[] = []

  for (const keyword of keywords) {
    if (combinedText.includes(keyword.toLowerCase())) {
      found.push(keyword)
    } else {
      missing.push(keyword)
    }
  }

  return { found, missing }
}

/**
 * Run a single test case
 */
async function runTestCase(
  supabase: ReturnType<typeof createClient>,
  openai: OpenAI,
  testCase: (typeof TEST_CASES)[0]
): Promise<TestResult> {
  const notes: string[] = []

  const results = await search(supabase, openai, testCase.query)

  // Check minimum results
  if (results.length < testCase.minResults) {
    notes.push(
      `Expected at least ${testCase.minResults} results, got ${results.length}`
    )
  }

  // Check category match
  const categoryMatch = testCase.expectedCategory
    ? results.some((r) => r.category === testCase.expectedCategory)
    : true

  if (testCase.expectedCategory && !categoryMatch) {
    notes.push(
      `Expected category '${testCase.expectedCategory}' not in top results`
    )
  }

  // Check keywords
  const { found, missing } = findKeywords(results, testCase.expectedKeywords)

  if (missing.length > 0) {
    notes.push(`Missing keywords: ${missing.join(", ")}`)
  }

  // Determine pass/fail
  const passed =
    results.length >= testCase.minResults &&
    categoryMatch &&
    missing.length <= testCase.expectedKeywords.length / 2 // Allow 50% missing

  return {
    query: testCase.query,
    passed,
    results,
    categoryMatch,
    keywordsFound: found,
    keywordsMissing: missing,
    notes,
  }
}

/**
 * Format test results
 */
function formatResults(testResults: TestResult[]): string {
  const lines: string[] = []
  const passCount = testResults.filter((r) => r.passed).length

  lines.push("\n" + "═".repeat(60))
  lines.push("🧪 Search Quality Test Results")
  lines.push("═".repeat(60))
  lines.push(`   Passed: ${passCount}/${testResults.length}`)
  lines.push("")

  for (const result of testResults) {
    const icon = result.passed ? "✅" : "❌"
    lines.push(`${icon} "${result.query}"`)
    lines.push(`   Results: ${result.results.length}`)

    if (result.results.length > 0) {
      lines.push(`   Top result: ${result.results[0].title} (${result.results[0].similarity.toFixed(3)})`)
    }

    lines.push(`   Category match: ${result.categoryMatch ? "Yes" : "No"}`)
    lines.push(`   Keywords: ${result.keywordsFound.length}/${result.keywordsFound.length + result.keywordsMissing.length}`)

    for (const note of result.notes) {
      lines.push(`   ⚠️  ${note}`)
    }

    lines.push("")
  }

  return lines.join("\n")
}

/**
 * Run interactive search
 */
async function interactiveSearch(
  supabase: ReturnType<typeof createClient>,
  openai: OpenAI,
  query: string
): Promise<void> {
  console.log(`\n🔍 Searching: "${query}"`)
  console.log("─".repeat(50))

  const results = await search(supabase, openai, query)

  if (results.length === 0) {
    console.log("   No results found")
    return
  }

  for (let i = 0; i < results.length; i++) {
    const r = results[i]
    console.log(`\n${i + 1}. ${r.title}`)
    console.log(`   Category: ${r.category}`)
    console.log(`   Similarity: ${r.similarity.toFixed(4)}`)
    console.log(`   Path: ${r.source_path}`)
    console.log(`   Preview: ${r.content.slice(0, 200)}...`)
  }
}

/**
 * Main function
 */
async function main(): Promise<void> {
  // Validate environment
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY ||
    !process.env.OPENAI_API_KEY
  ) {
    console.error("❌ Missing required environment variables")
    console.error("   Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY")
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Check if content exists
  const { count, error } = await supabase
    .from("content_chunks")
    .select("*", { count: "exact", head: true })

  if (error) {
    console.error(`❌ Database error: ${error.message}`)
    process.exit(1)
  }

  if (count === 0) {
    console.log("⚠️  No content in database. Run 'npm run kb:ingest' first.")
    process.exit(0)
  }

  console.log(`\n📚 ${count} chunks in database`)

  // Check for query argument
  const query = process.argv[2]

  if (query) {
    await interactiveSearch(supabase, openai, query)
  } else {
    // Run all test cases
    console.log("\n🧪 Running test cases...")

    const testResults: TestResult[] = []

    for (const testCase of TEST_CASES) {
      process.stdout.write(`   Testing: "${testCase.query}"... `)
      const result = await runTestCase(supabase, openai, testCase)
      testResults.push(result)
      console.log(result.passed ? "✅" : "❌")
    }

    console.log(formatResults(testResults))

    // Exit with error if tests failed
    const failed = testResults.filter((r) => !r.passed).length
    if (failed > 0) {
      console.log(`\n❌ ${failed} test(s) failed`)
      process.exit(1)
    }

    console.log("✅ All tests passed")
  }
}

main().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
