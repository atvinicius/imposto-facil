/**
 * Shared types for the AI avatar content pipeline
 */

// ============================================
// Script Generation
// ============================================

export type ScriptFormat =
  | 'hot-take'
  | 'storytelling'
  | 'myth-buster'
  | 'countdown'
  | 'if-you-are'
  | 'stat-shock'

export const SCRIPT_FORMATS: ScriptFormat[] = [
  'hot-take',
  'storytelling',
  'myth-buster',
  'countdown',
  'if-you-are',
  'stat-shock',
]

export interface GeneratedScript {
  id: string                     // e.g. "2026-02-26-hot-take-split-payment"
  format: ScriptFormat
  persona: string                // e.g. "Especialista direto ao ponto"
  hook: string                   // First 1-2 seconds — pattern interrupt
  body: string[]                 // 3-5 segments, conversational
  cta: string                    // e.g. "Link na bio"
  caption: string                // Social caption with hashtags + engagement bait
  fullText: string               // Concatenated for avatar speech
  estimatedSeconds: number
  sourceAtoms: string[]          // Which content atoms fed this
  metadata: {
    model: string
    generatedAt: string
  }
}

// ============================================
// Content Queue
// ============================================

export type QueueStatus =
  | 'generated'
  | 'approved'
  | 'rejected'
  | 'rendering'
  | 'rendered'
  | 'posted'
  | 'failed'

export interface QueueItem {
  id: string
  script: GeneratedScript
  status: QueueStatus
  createdAt: string
  updatedAt: string
  heygenVideoId?: string        // HeyGen job ID (for polling)
  videoPath?: string             // Downloaded MP4 (clean)
  captionVideoPath?: string     // MP4 with burned-in captions
  postResults?: {
    tiktok?: { postId?: string; error?: string }
    instagram?: { postId?: string; error?: string }
  }
  error?: string
  reviewNote?: string
}

// ============================================
// Content Atoms (data extractor output)
// ============================================

export type ContentCategory =
  | 'ibs' | 'cbs' | 'is' | 'transicao' | 'glossario'
  | 'setores' | 'regimes' | 'faq'

export interface ContentAtom {
  id: string                     // e.g. "article:setores/comercio"
  type: 'article' | 'tax-data'
  title: string
  summary: string                // 2-3 sentence summary
  keyFacts: string[]             // Bullet points of concrete data
  category: ContentCategory | 'dados'
  tags: string[]
  suggestedFormats: ScriptFormat[]
  commonQuestions?: string[]
}

// ============================================
// HeyGen
// ============================================

export interface HeyGenConfig {
  apiKey: string
  avatarId: string              // Stock avatar or custom photo avatar
  voiceId: string               // PT-BR voice
  voiceLocale: 'pt-BR'
  voiceEmotion?: 'Friendly' | 'Excited' | 'Serious'
  voiceSpeed?: number           // 0.5-1.5
}

export interface HeyGenVideoResult {
  videoId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  videoUrl?: string
  captionVideoUrl?: string
  captionUrl?: string           // .ass subtitles
  duration?: number
  error?: string
}

// ============================================
// Pipeline Config
// ============================================

export interface PipelineConfig {
  heygen: HeyGenConfig
  openrouter: {
    apiKey: string
    model: string
  }
}
