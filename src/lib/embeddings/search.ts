import { createAdminClient } from "@/lib/supabase/admin"
import { generateEmbedding } from "./client"

export interface SearchResult {
  id: string
  sourcePath: string
  title: string
  category: string
  content: string
  similarity: number
}

export async function searchByEmbedding(
  query: string,
  options: { threshold?: number; limit?: number } = {}
): Promise<SearchResult[]> {
  const { threshold = 0.5, limit = 5 } = options

  try {
    const embedding = await generateEmbedding(query)
    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc("match_content_chunks", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit,
    })

    if (error) {
      console.error("Embedding search error:", error)
      return []
    }

    return (data || []).map((item: { id: string; source_path: string; title: string; category: string; content: string; similarity: number }) => ({
      id: item.id,
      sourcePath: item.source_path,
      title: item.title,
      category: item.category,
      content: item.content,
      similarity: item.similarity,
    }))
  } catch (error) {
    console.error("Embedding search failed:", error)
    return []
  }
}

export async function searchByFullText(query: string): Promise<SearchResult[]> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.rpc("search_content", {
      search_query: query,
    })

    if (error) {
      console.error("Full-text search error:", error)
      return []
    }

    return (data || []).map((item: { id: string; source_path: string; title: string; category: string; content: string; rank: number }) => ({
      id: item.id,
      sourcePath: item.source_path,
      title: item.title,
      category: item.category,
      content: item.content,
      similarity: item.rank,
    }))
  } catch (error) {
    console.error("Full-text search failed:", error)
    return []
  }
}

export async function hybridSearch(
  query: string,
  options: { embeddingWeight?: number; limit?: number } = {}
): Promise<SearchResult[]> {
  const { embeddingWeight = 0.7, limit = 5 } = options

  const [embeddingResults, fullTextResults] = await Promise.all([
    searchByEmbedding(query, { limit: limit * 2 }),
    searchByFullText(query),
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
