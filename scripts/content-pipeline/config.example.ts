/**
 * Configuration for the content pipeline
 *
 * API keys are loaded from the root .env.local file (shared with the main app).
 * Copy this file to config.ts and adjust non-secret settings as needed.
 *
 * Required env vars in ../../.env.local:
 *   OPENROUTER_API_KEY   — LLM script generation
 *   HEYGEN_API_KEY       — AI avatar video rendering
 *
 * Optional env vars (for posting / legacy voice/video):
 *   ELEVENLABS_API_KEY, OPENAI_API_KEY, CREATOMATE_API_KEY
 *   TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, TIKTOK_ACCESS_TOKEN, TIKTOK_OPEN_ID
 *   INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID
 *   AYRSHARE_API_KEY, AYRSHARE_PROFILE_KEY
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

// Walk up from cwd to find .env.local (works in worktrees and main repo)
function findEnvFile(): string | undefined {
  let dir = path.resolve(process.cwd(), '../..')
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, '.env.local')
    if (fs.existsSync(candidate)) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return undefined
}

const envPath = findEnvFile()
if (envPath) {
  dotenv.config({ path: envPath })
} else {
  console.warn('Warning: .env.local not found. API keys will be empty.')
}

function env(key: string, fallback = ''): string {
  return process.env[key] || fallback
}

export const config = {
  // ============================================
  // VOICE GENERATION (not needed for avatar pipeline)
  // ============================================
  elevenlabs: {
    apiKey: env('ELEVENLABS_API_KEY'),
    voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel (works well for PT-BR)
    modelId: 'eleven_multilingual_v2',
  },
  openai: {
    apiKey: env('OPENAI_API_KEY'),
    voice: 'onyx', // Options: alloy, echo, fable, onyx, nova, shimmer
    model: 'tts-1', // or 'tts-1-hd' for higher quality
  },
  ttsProvider: 'elevenlabs' as const,

  // ============================================
  // VIDEO GENERATION (legacy text-on-screen)
  // ============================================
  creatomate: {
    apiKey: env('CREATOMATE_API_KEY'),
    facelessTemplateId: 'your-template-id',
    textTemplateId: 'your-text-template-id',
  },

  // ============================================
  // AI AVATAR VIDEO (HeyGen)
  // Get API key: https://app.heygen.com/settings/api
  // Pricing: ~$0.0167/sec = ~$1/min (Engine III stock avatar)
  // ============================================
  heygen: {
    apiKey: env('HEYGEN_API_KEY'),
    avatarId: 'Abigail_expressive_2024', // Or your custom photo avatar ID ($4 to train)
    voiceId: 'pt-BR-voice-id',           // Find with: npx tsx cli.ts voices
    voiceEmotion: 'Friendly' as 'Friendly' | 'Excited' | 'Serious',
    voiceSpeed: 1.05,                     // Slightly faster for social media
  },

  // ============================================
  // LLM SCRIPT GENERATION (OpenRouter)
  // ~$0.003/script with Claude 3.5 Haiku
  // ============================================
  openrouter: {
    apiKey: env('OPENROUTER_API_KEY'),
    model: 'anthropic/claude-3.5-haiku',
  },

  // ============================================
  // SOCIAL MEDIA POSTING
  // ============================================
  tiktok: {
    clientKey: env('TIKTOK_CLIENT_KEY'),
    clientSecret: env('TIKTOK_CLIENT_SECRET'),
    accessToken: env('TIKTOK_ACCESS_TOKEN'),
    openId: env('TIKTOK_OPEN_ID'),
  },
  instagram: {
    accessToken: env('INSTAGRAM_ACCESS_TOKEN'),
    businessAccountId: env('INSTAGRAM_BUSINESS_ACCOUNT_ID'),
  },
  ayrshare: {
    apiKey: env('AYRSHARE_API_KEY'),
    profileKey: env('AYRSHARE_PROFILE_KEY'),
  },
  postingMethod: 'direct' as 'direct' | 'ayrshare',

  // ============================================
  // OUTPUT SETTINGS
  // ============================================
  output: {
    audioDir: './output/audio',
    videoDir: './output/video',
    tempDir: './output/temp',
  },
  video: {
    width: 1080,
    height: 1920, // 9:16 vertical
    fps: 30,
    format: 'mp4',
  },
  brand: {
    name: 'ImpostoFacil',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    textColor: '#ffffff',
    fontFamily: 'Inter',
    logo: './assets/logo.png',
    watermark: './assets/watermark.png',
  },
};

export type Config = typeof config;
