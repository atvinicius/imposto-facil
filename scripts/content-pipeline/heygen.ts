/**
 * HeyGen API Client — Avatar video generation
 *
 * Wraps the HeyGen REST API v2 to:
 * 1. Create avatar video from script text
 * 2. Poll for completion (~5-10 min)
 * 3. Download MP4 (clean + captioned)
 *
 * Cost: ~$0.0167/sec (Engine III stock avatar) = ~$1/min
 * A 45-second daily video = ~$22.50/mo for 30 videos.
 *
 * Docs: https://docs.heygen.com/reference/create-an-avatar-video-v2
 */

import fs from 'fs'
import path from 'path'
import { config } from './config.js'
import type { HeyGenVideoResult } from './types.js'

const HEYGEN_BASE = 'https://api.heygen.com'
const OUTPUT_DIR = path.resolve(process.cwd(), 'output/video')

function ensureOutputDir(): void {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
}

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'X-Api-Key': config.heygen.apiKey,
  }
}

// ============================================
// Create avatar video
// ============================================

export interface CreateVideoOptions {
  scriptText: string
  scriptId: string              // Used for output filename
  avatarId?: string             // Override config default
  voiceId?: string              // Override config default
  voiceEmotion?: 'Friendly' | 'Excited' | 'Serious'
  voiceSpeed?: number
  caption?: boolean             // Enable burned-in captions (default: true)
}

/**
 * Create an avatar video via HeyGen API v2.
 * Returns a video_id for status polling.
 */
export async function createAvatarVideo(options: CreateVideoOptions): Promise<string> {
  const {
    scriptText,
    avatarId = config.heygen.avatarId,
    voiceId = config.heygen.voiceId,
    voiceEmotion = config.heygen.voiceEmotion || 'Friendly',
    voiceSpeed = config.heygen.voiceSpeed || 1.05,
    caption = true,
  } = options

  console.log(`  Creating HeyGen avatar video...`)
  console.log(`  Avatar: ${avatarId}`)
  console.log(`  Voice: ${voiceId} (${voiceEmotion}, speed ${voiceSpeed})`)
  console.log(`  Script length: ${scriptText.length} chars`)

  const payload = {
    video_inputs: [
      {
        character: {
          type: 'avatar',
          avatar_id: avatarId,
          avatar_style: 'normal',
        },
        voice: {
          type: 'text',
          input_text: scriptText,
          voice_id: voiceId,
          speed: voiceSpeed,
          emotion: voiceEmotion,
        },
      },
    ],
    dimension: {
      width: 1080,
      height: 1920,
    },
    caption,
    ...(caption && {
      caption_style: {
        font_color: '#FFFFFF',
        background_color: '#00000080',
        font_size: 24,
        bold: true,
      },
    }),
  }

  const response = await fetch(`${HEYGEN_BASE}/v2/video/generate`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HeyGen create video failed (${response.status}): ${error}`)
  }

  const result = await response.json() as {
    data: { video_id: string }
    error: { code: number; message: string } | null
  }

  if (result.error) {
    throw new Error(`HeyGen error: ${result.error.message}`)
  }

  const videoId = result.data.video_id
  console.log(`  Video ID: ${videoId}`)

  return videoId
}

// ============================================
// Poll video status
// ============================================

const POLL_INTERVAL_MS = 30_000  // 30 seconds
const MAX_POLL_ATTEMPTS = 40     // 40 × 30s = 20 minutes max

/**
 * Poll HeyGen API until video is completed or failed.
 * Typically takes 5-10 minutes for a 1-minute video.
 */
export async function pollVideoStatus(videoId: string): Promise<HeyGenVideoResult> {
  console.log(`  Polling video status (every ${POLL_INTERVAL_MS / 1000}s)...`)

  for (let attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
    const response = await fetch(
      `${HEYGEN_BASE}/v1/video_status.get?video_id=${videoId}`,
      { method: 'GET', headers: headers() },
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HeyGen status check failed (${response.status}): ${error}`)
    }

    const result = await response.json() as {
      data: {
        status: string
        video_url?: string
        video_url_caption?: string
        caption_url?: string
        duration?: number
        error?: string
      }
    }

    const { status, video_url, video_url_caption, caption_url, duration, error } = result.data

    if (status === 'completed') {
      console.log(`  Video completed! Duration: ${duration}s`)
      return {
        videoId,
        status: 'completed',
        videoUrl: video_url,
        captionVideoUrl: video_url_caption,
        captionUrl: caption_url,
        duration,
      }
    }

    if (status === 'failed') {
      console.error(`  Video failed: ${error}`)
      return {
        videoId,
        status: 'failed',
        error: error || 'Unknown HeyGen error',
      }
    }

    // Still processing
    const elapsed = attempt * POLL_INTERVAL_MS / 1000
    process.stdout.write(`\r  Status: ${status} (${elapsed}s elapsed)`)

    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS))
  }

  return {
    videoId,
    status: 'failed',
    error: `Timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`,
  }
}

// ============================================
// Download video
// ============================================

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Download failed (${response.status}): ${url}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(outputPath, buffer)
  console.log(`  Downloaded: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(1)}MB)`)
}

/**
 * Download both clean and captioned video MP4s.
 * Returns paths to saved files.
 */
export async function downloadVideo(
  result: HeyGenVideoResult,
  scriptId: string,
): Promise<{ videoPath: string; captionVideoPath?: string }> {
  ensureOutputDir()

  const videoPath = path.join(OUTPUT_DIR, `${scriptId}.mp4`)
  let captionVideoPath: string | undefined

  if (result.videoUrl) {
    console.log(`  Downloading clean video...`)
    await downloadFile(result.videoUrl, videoPath)
  } else {
    throw new Error('No video URL in HeyGen result')
  }

  if (result.captionVideoUrl) {
    captionVideoPath = path.join(OUTPUT_DIR, `${scriptId}-captioned.mp4`)
    console.log(`  Downloading captioned video...`)
    await downloadFile(result.captionVideoUrl, captionVideoPath)
  }

  return { videoPath, captionVideoPath }
}

// ============================================
// Full render flow (convenience)
// ============================================

export interface RenderResult {
  videoId: string
  videoPath: string
  captionVideoPath?: string
  duration?: number
}

/**
 * Full render pipeline: create → poll → download.
 * Takes ~5-10 minutes per video.
 */
export async function renderScript(
  scriptText: string,
  scriptId: string,
): Promise<RenderResult> {
  console.log(`\nRendering: ${scriptId}`)

  // 1. Create video
  const videoId = await createAvatarVideo({ scriptText, scriptId })

  // 2. Poll until complete
  const status = await pollVideoStatus(videoId)

  if (status.status !== 'completed') {
    throw new Error(`Render failed: ${status.error}`)
  }

  // 3. Download
  const { videoPath, captionVideoPath } = await downloadVideo(status, scriptId)

  return {
    videoId,
    videoPath,
    captionVideoPath,
    duration: status.duration,
  }
}

// ============================================
// Utility: list available voices
// ============================================

export async function listVoices(locale?: string): Promise<void> {
  const response = await fetch(`${HEYGEN_BASE}/v2/voices`, {
    method: 'GET',
    headers: headers(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HeyGen list voices failed (${response.status}): ${error}`)
  }

  const result = await response.json() as {
    data: { voices: Array<{ voice_id: string; language: string; gender: string; name: string; preview_audio?: string }> }
  }

  let voices = result.data.voices
  if (locale) {
    voices = voices.filter(v => v.language.toLowerCase().includes(locale.toLowerCase()))
  }

  console.log(`\nAvailable voices${locale ? ` (${locale})` : ''}:`)
  for (const v of voices) {
    console.log(`  ${v.voice_id} — ${v.name} (${v.language}, ${v.gender})`)
  }
  console.log(`\nTotal: ${voices.length} voices`)
}

// ============================================
// Utility: list available avatars
// ============================================

export async function listAvatars(): Promise<void> {
  const response = await fetch(`${HEYGEN_BASE}/v2/avatars`, {
    method: 'GET',
    headers: headers(),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`HeyGen list avatars failed (${response.status}): ${error}`)
  }

  const result = await response.json() as {
    data: { avatars: Array<{ avatar_id: string; avatar_name: string; gender: string }> }
  }

  console.log(`\nAvailable avatars:`)
  for (const a of result.data.avatars) {
    console.log(`  ${a.avatar_id} — ${a.avatar_name} (${a.gender})`)
  }
  console.log(`\nTotal: ${result.data.avatars.length} avatars`)
}

// ============================================
// CLI
// ============================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)

  if (args.includes('--voices')) {
    await listVoices('pt')
  } else if (args.includes('--avatars')) {
    await listAvatars()
  } else if (args[0]) {
    // Render a test script
    const text = args[0]
    const id = `test-${Date.now()}`
    const result = await renderScript(text, id)
    console.log(`\nRendered: ${result.videoPath}`)
    if (result.captionVideoPath) console.log(`Captioned: ${result.captionVideoPath}`)
  } else {
    console.log('Usage:')
    console.log('  npx tsx heygen.ts --voices     List PT-BR voices')
    console.log('  npx tsx heygen.ts --avatars     List available avatars')
    console.log('  npx tsx heygen.ts "Text here"   Render a test video')
  }
}
