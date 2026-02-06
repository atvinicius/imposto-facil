import { createAdminClient } from "@/lib/supabase/admin"
import { generateEmbedding } from "./client"
import type { Json } from "@/types/database"

export interface SearchResult {
  id: string
  sourcePath: string
  title: string
  sectionTitle: string | null
  category: string
  content: string
  similarity: number
  difficulty: string
  metadata: SearchMetadata | null
}

export interface SearchMetadata {
  tags?: string[]
  sources?: SourceCitation[]
  searchKeywords?: string[]
  commonQuestions?: string[]
  relatedArticles?: string[]
  lastVerified?: string
  lastUpdated?: string
  status: string
  originalTitle: string
}

export interface SourceCitation {
  name: string
  url?: string
  dateAccessed?: string
  articles?: string[]
}

export interface SearchOptions {
  threshold?: number
  limit?: number
  category?: string
  difficulty?: string
}

function parseMetadata(raw: Json | null): SearchMetadata | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null
  }
  return raw as unknown as SearchMetadata
}

export async function searchByEmbedding(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { threshold = 0.5, limit = 5, category, difficulty } = options

  try {
    const embedding = await generateEmbedding(query)
    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc("match_content_chunks", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
      filter_category: category || null,
      filter_difficulty: difficulty || null,
    })

    if (error) {
      console.error("Embedding search error:", error)
      return []
    }

    return (data || []).map(
      (item: {
        id: string
        source_path: string
        title: string
        section_title: string | null
        category: string
        content: string
        similarity: number
        difficulty: string
        metadata: Json | null
      }) => ({
        id: item.id,
        sourcePath: item.source_path,
        title: item.title,
        sectionTitle: item.section_title,
        category: item.category,
        content: item.content,
        similarity: item.similarity,
        difficulty: item.difficulty,
        metadata: parseMetadata(item.metadata),
      })
    )
  } catch (error) {
    console.error("Embedding search failed:", error)
    return []
  }
}

export async function searchByFullText(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const { category, difficulty } = options

  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc("search_content", {
      search_query: query,
      filter_category: category || null,
      filter_difficulty: difficulty || null,
    })

    if (error) {
      console.error("Full-text search error:", error)
      return []
    }

    return (data || []).map(
      (item: {
        id: string
        source_path: string
        title: string
        section_title: string | null
        category: string
        content: string
        rank: number
        difficulty: string
        metadata: Json | null
      }) => ({
        id: item.id,
        sourcePath: item.source_path,
        title: item.title,
        sectionTitle: item.section_title,
        category: item.category,
        content: item.content,
        similarity: item.rank,
        difficulty: item.difficulty,
        metadata: parseMetadata(item.metadata),
      })
    )
  } catch (error) {
    console.error("Full-text search failed:", error)
    return []
  }
}

export async function hybridSearch(
  query: string,
  options: SearchOptions & { embeddingWeight?: number } = {}
): Promise<SearchResult[]> {
  const { embeddingWeight = 0.7, limit = 5, ...filterOptions } = options

  const [embeddingResults, fullTextResults] = await Promise.all([
    searchByEmbedding(query, { ...filterOptions, limit: limit * 2 }),
    searchByFullText(query, filterOptions),
  ])

  // Combine and deduplicate results
  const resultMap = new Map<string, SearchResult & { combinedScore: number }>()

  for (const result of embeddingResults) {
    resultMap.set(result.id, {
      ...result,
      combinedScore: result.similarity * embeddingWeight,
    })
  }

  for (const result of fullTextResults) {
    const existing = resultMap.get(result.id)
    if (existing) {
      existing.combinedScore += result.similarity * (1 - embeddingWeight)
    } else {
      resultMap.set(result.id, {
        ...result,
        combinedScore: result.similarity * (1 - embeddingWeight),
      })
    }
  }

  return Array.from(resultMap.values())
    .sort((a, b) => b.combinedScore - a.combinedScore)
    .slice(0, limit)
    .map(({ combinedScore, ...result }) => ({
      ...result,
      similarity: combinedScore,
    }))
}

/**
 * Get sources from search results for display
 */
export function extractSources(results: SearchResult[]): SourceCitation[] {
  const sourcesMap = new Map<string, SourceCitation>()

  for (const result of results) {
    if (result.metadata?.sources) {
      for (const source of result.metadata.sources) {
        if (!sourcesMap.has(source.name)) {
          sourcesMap.set(source.name, source)
        }
      }
    }
  }

  return Array.from(sourcesMap.values())
}

/**
 * Format search results for chat context
 */
export function formatForContext(results: SearchResult[]): string {
  if (results.length === 0) {
    return ""
  }

  const sections: string[] = []

  for (const result of results) {
    const header = result.sectionTitle
      ? `## ${result.title} - ${result.sectionTitle}`
      : `## ${result.title}`

    sections.push(`${header}\n\n${result.content}`)
  }

  return sections.join("\n\n---\n\n")
}
