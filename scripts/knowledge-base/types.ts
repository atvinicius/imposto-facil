/**
 * Knowledge Base Types
 * Core type definitions for the content ingestion pipeline
 */

import { z } from "zod"

// Helper to parse date from either string or Date object
const dateStringSchema = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  z.date().transform((d) => d.toISOString().split("T")[0]),
])

// Source citation schema and type
export const SourceCitationSchema = z.object({
  name: z.string().min(1),
  url: z.string().url().optional(),
  dateAccessed: dateStringSchema.optional(),
  articles: z.array(z.string()).optional(),
})

export type SourceCitation = z.infer<typeof SourceCitationSchema>

// Content status
export const ContentStatusSchema = z.enum(["draft", "published", "outdated", "archived"])
export type ContentStatus = z.infer<typeof ContentStatusSchema>

// Difficulty level
export const DifficultyLevelSchema = z.enum(["basico", "intermediario", "avancado"])
export type DifficultyLevel = z.infer<typeof DifficultyLevelSchema>

// Category
export const CategorySchema = z.enum([
  "ibs",
  "cbs",
  "is",
  "transicao",
  "glossario",
  "setores",
  "regimes",
  "faq",
])
export type Category = z.infer<typeof CategorySchema>

// Enhanced frontmatter schema
export const FrontmatterSchema = z.object({
  // Required fields
  title: z.string().min(1),
  description: z.string().min(1),
  category: CategorySchema,

  // Optional basic fields
  tags: z.array(z.coerce.string()).optional(),
  publishedAt: dateStringSchema.optional(),

  // Source tracking (required for published content)
  sources: z.array(SourceCitationSchema).optional(),
  lastVerified: dateStringSchema.optional(),
  lastUpdated: dateStringSchema.optional(),
  status: ContentStatusSchema.optional().default("draft"),

  // AI optimization
  difficulty: DifficultyLevelSchema.optional().default("basico"),
  searchKeywords: z.array(z.string()).optional(),
  commonQuestions: z.array(z.string()).optional(),
  relatedArticles: z.array(z.string()).optional(),
})

export type Frontmatter = z.infer<typeof FrontmatterSchema>

// Parsed MDX file
export interface ParsedContent {
  frontmatter: Frontmatter
  content: string
  filePath: string
  contentHash: string
}

// Content chunk for database
export interface ContentChunk {
  id?: string
  sourcePath: string
  title: string
  sectionTitle: string | null
  category: string
  content: string
  chunkIndex: number
  sourceHash: string
  difficulty: DifficultyLevel
  metadata: ChunkMetadata
  embedding?: number[]
}

// Metadata stored in JSONB
export interface ChunkMetadata {
  tags?: string[]
  sources?: SourceCitation[]
  searchKeywords?: string[]
  commonQuestions?: string[]
  relatedArticles?: string[]
  lastVerified?: string
  lastUpdated?: string
  status: ContentStatus
  originalTitle: string
}

// Ingestion result
export interface IngestionResult {
  filePath: string
  status: "created" | "updated" | "unchanged" | "error"
  chunksCreated: number
  chunksUpdated: number
  chunksDeleted: number
  error?: string
}

// Validation result
export interface ValidationResult {
  filePath: string
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export interface ValidationError {
  field: string
  message: string
  value?: unknown
}

export interface ValidationWarning {
  field: string
  message: string
  suggestion?: string
}

// Search result with metadata
export interface EnhancedSearchResult {
  id: string
  sourcePath: string
  title: string
  sectionTitle: string | null
  category: string
  content: string
  similarity: number
  difficulty: DifficultyLevel
  metadata: ChunkMetadata
}

// Source registry types
export interface SourceEntry {
  id: string
  name: string
  shortName: string
  url: string
  publishDate: string
  lastChecked: string
  status: "active" | "outdated" | "unavailable"
  type: "legislation" | "regulation" | "guidance" | "official"
}

export interface SourceRegistry {
  version: string
  lastUpdated: string
  sources: SourceEntry[]
}

// Chunking options
export interface ChunkingOptions {
  maxTokens: number
  overlapTokens: number
  preserveSections: boolean
}

// Ingestion options
export interface IngestionOptions {
  dryRun: boolean
  force: boolean
  verbose: boolean
  categories?: Category[]
}
