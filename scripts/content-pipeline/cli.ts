/**
 * Unified CLI for the AI Avatar Content Pipeline
 *
 * Commands:
 *   generate   Generate scripts from content atoms via LLM
 *   review     Interactive review of generated scripts
 *   approve    Approve a specific script
 *   reject     Reject a specific script
 *   render     Render next approved script via HeyGen
 *   render-all Render all approved scripts
 *   post       Post next rendered video to social media
 *   process    Full pipeline: render + post for next approved
 *   list       List queue items
 *   stats      Show queue statistics
 *   voices     List HeyGen PT-BR voices
 *   avatars    List HeyGen avatars
 */

import * as readline from 'readline'
import { generateScripts } from './generate-scripts.js'
import {
  loadQueue,
  enqueueScripts,
  approveItem,
  rejectItem,
  getNextApproved,
  getNextRendered,
  markRendering,
  markRendered,
  markPosted,
  markFailed,
  getItemsByStatus,
  getStats,
  getRecentTopics,
} from './queue.js'
import { renderScript, listVoices, listAvatars } from './heygen.js'
import { postVideo } from './post-video.js'
import type { QueueItem, QueueStatus, ScriptFormat } from './types.js'
import { SCRIPT_FORMATS } from './types.js'

// ============================================
// Helpers
// ============================================

function getArg(args: string[], name: string): string | undefined {
  const arg = args.find(a => a.startsWith(`--${name}=`))
  return arg?.split('=')[1]
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(`--${name}`)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

function statusEmoji(status: QueueStatus): string {
  const map: Record<QueueStatus, string> = {
    generated: '📝',
    approved: '✅',
    rejected: '❌',
    rendering: '🎬',
    rendered: '🎥',
    posted: '📤',
    failed: '💥',
  }
  return map[status] || '❓'
}

// ============================================
// Commands
// ============================================

async function cmdGenerate(args: string[]): Promise<void> {
  const count = parseInt(getArg(args, 'count') || '5', 10)
  const format = getArg(args, 'format') as ScriptFormat | undefined
  const category = getArg(args, 'category')
  const dryRun = hasFlag(args, 'dry-run')

  if (format && !SCRIPT_FORMATS.includes(format)) {
    console.error(`Invalid format: ${format}`)
    console.error(`Valid formats: ${SCRIPT_FORMATS.join(', ')}`)
    process.exit(1)
  }

  const recentTopics = getRecentTopics()

  const scripts = await generateScripts({
    count,
    format,
    category,
    dryRun,
    recentTopics,
  })

  if (!dryRun && scripts.length > 0) {
    const added = enqueueScripts(scripts)
    console.log(`\nAdded ${added.length} scripts to queue`)
    console.log(`Run "npx tsx cli.ts review" to approve them`)
  }
}

async function cmdReview(): Promise<void> {
  const items = getItemsByStatus('generated')

  if (items.length === 0) {
    console.log('No scripts to review. Generate some first: npx tsx cli.ts generate')
    return
  }

  console.log(`\n${items.length} scripts pending review\n`)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const question = (prompt: string): Promise<string> =>
    new Promise(resolve => rl.question(prompt, resolve))

  for (const item of items) {
    const s = item.script
    console.log(`┌─ [${s.format}] ${s.id}`)
    console.log(`│  Persona: ${s.persona}`)
    console.log(`│  Duration: ~${s.estimatedSeconds}s`)
    console.log(`│`)
    console.log(`│  HOOK: "${s.hook}"`)
    console.log(`│`)
    console.log(`│  BODY:`)
    s.body.forEach((line, i) => {
      console.log(`│  ${i + 1}. "${line}"`)
    })
    console.log(`│`)
    console.log(`│  CTA: "${s.cta}"`)
    console.log(`│`)
    console.log(`│  CAPTION: ${s.caption}`)
    console.log(`│`)
    console.log(`│  Sources: ${s.sourceAtoms.join(', ')}`)
    console.log(`│`)

    const answer = await question(`└─ [a]pprove  [r]eject  [s]kip  [q]uit?  `)

    switch (answer.toLowerCase().trim()) {
      case 'a':
      case 'approve': {
        approveItem(item.id)
        console.log(`  ✅ Approved\n`)
        break
      }
      case 'r':
      case 'reject': {
        const reason = await question('  Reason (optional): ')
        rejectItem(item.id, reason || undefined)
        console.log(`  ❌ Rejected\n`)
        break
      }
      case 'q':
      case 'quit': {
        console.log('Exiting review.')
        rl.close()
        return
      }
      default: {
        console.log('  ⏭️  Skipped\n')
      }
    }
  }

  rl.close()
  console.log('Review complete.')
}

async function cmdApprove(args: string[]): Promise<void> {
  const id = args.find(a => !a.startsWith('--'))
  if (!id) {
    console.error('Usage: npx tsx cli.ts approve <script-id>')
    process.exit(1)
  }

  const item = approveItem(id)
  if (item) {
    console.log(`✅ Approved: ${id}`)
  } else {
    console.error(`Could not approve: ${id} (not found or not in "generated" status)`)
  }
}

async function cmdReject(args: string[]): Promise<void> {
  const id = args.find(a => !a.startsWith('--'))
  if (!id) {
    console.error('Usage: npx tsx cli.ts reject <script-id> [--reason="..."]')
    process.exit(1)
  }

  const reason = getArg(args, 'reason')
  const item = rejectItem(id, reason)
  if (item) {
    console.log(`❌ Rejected: ${id}${reason ? ` (${reason})` : ''}`)
  } else {
    console.error(`Could not reject: ${id} (not found or not in "generated" status)`)
  }
}

async function cmdRender(): Promise<void> {
  const item = getNextApproved()
  if (!item) {
    console.log('No approved scripts to render. Approve some first: npx tsx cli.ts review')
    return
  }

  console.log(`\nRendering: [${item.script.format}] ${item.id}`)
  console.log(`Hook: "${item.script.hook}"`)

  try {
    const result = await renderScript(item.script.fullText, item.id)
    markRendering(item.id, result.videoId)
    markRendered(item.id, result.videoPath, result.captionVideoPath)

    console.log(`\n✅ Rendered successfully!`)
    console.log(`  Video: ${result.videoPath}`)
    if (result.captionVideoPath) {
      console.log(`  Captioned: ${result.captionVideoPath}`)
    }
    console.log(`  Duration: ${result.duration}s`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    markFailed(item.id, errorMsg)
    console.error(`\n💥 Render failed: ${errorMsg}`)
  }
}

async function cmdRenderAll(): Promise<void> {
  const items = getItemsByStatus('approved')

  if (items.length === 0) {
    console.log('No approved scripts to render.')
    return
  }

  console.log(`\nRendering ${items.length} approved scripts...\n`)

  let success = 0
  let failed = 0

  for (const item of items) {
    console.log(`\n--- ${success + failed + 1}/${items.length} ---`)
    try {
      const result = await renderScript(item.script.fullText, item.id)
      markRendering(item.id, result.videoId)
      markRendered(item.id, result.videoPath, result.captionVideoPath)
      success++
      console.log(`✅ ${item.id}`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      markFailed(item.id, errorMsg)
      failed++
      console.error(`💥 ${item.id}: ${errorMsg}`)
    }
  }

  console.log(`\nDone: ${success} rendered, ${failed} failed`)
}

async function cmdPost(args: string[]): Promise<void> {
  const item = getNextRendered()
  if (!item) {
    console.log('No rendered videos to post. Render some first: npx tsx cli.ts render')
    return
  }

  const videoPath = item.captionVideoPath || item.videoPath
  if (!videoPath) {
    console.error(`No video file for ${item.id}`)
    markFailed(item.id, 'No video file path')
    return
  }

  const skipInstagram = hasFlag(args, 'skip-instagram')
  const skipTiktok = hasFlag(args, 'skip-tiktok')

  const platforms: ('tiktok' | 'instagram')[] = []
  if (!skipTiktok) platforms.push('tiktok')
  if (!skipInstagram) platforms.push('instagram')

  console.log(`\nPosting: ${item.id}`)
  console.log(`Video: ${videoPath}`)
  console.log(`Platforms: ${platforms.join(', ')}`)

  try {
    const result = await postVideo({
      videoPath,
      caption: item.script.caption,
      platforms,
    })

    markPosted(item.id, {
      tiktok: result.tiktok,
      instagram: result.instagram,
    })

    if (result.success) {
      console.log(`\n✅ Posted successfully!`)
    } else {
      console.log(`\n⚠️ Partial success — check individual platform results`)
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    markFailed(item.id, errorMsg)
    console.error(`\n💥 Post failed: ${errorMsg}`)
  }
}

async function cmdProcess(): Promise<void> {
  // Render next approved
  const approved = getNextApproved()
  if (!approved) {
    console.log('No approved scripts to process.')
    return
  }

  console.log(`\nProcessing: ${approved.id}`)

  // Render
  try {
    const result = await renderScript(approved.script.fullText, approved.id)
    markRendering(approved.id, result.videoId)
    markRendered(approved.id, result.videoPath, result.captionVideoPath)
    console.log(`✅ Rendered: ${result.videoPath}`)

    // Post
    const videoPath = result.captionVideoPath || result.videoPath
    const postResult = await postVideo({
      videoPath,
      caption: approved.script.caption,
    })

    markPosted(approved.id, {
      tiktok: postResult.tiktok,
      instagram: postResult.instagram,
    })

    console.log(`\n✅ Full pipeline complete for: ${approved.id}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    markFailed(approved.id, errorMsg)
    console.error(`\n💥 Pipeline failed: ${errorMsg}`)
  }
}

async function cmdList(args: string[]): Promise<void> {
  const statusFilter = getArg(args, 'status') as QueueStatus | undefined
  const queue = statusFilter ? getItemsByStatus(statusFilter) : loadQueue()

  if (queue.length === 0) {
    console.log(statusFilter ? `No items with status "${statusFilter}"` : 'Queue is empty')
    return
  }

  console.log(`\n${queue.length} items${statusFilter ? ` (${statusFilter})` : ''}:\n`)

  for (const item of queue) {
    const s = item.script
    console.log(`${statusEmoji(item.status)} [${item.status.padEnd(10)}] ${item.id}`)
    console.log(`   [${s.format}] "${s.hook.substring(0, 70)}${s.hook.length > 70 ? '...' : ''}"`)
    console.log(`   ~${s.estimatedSeconds}s | Created: ${formatDate(item.createdAt)}`)
    if (item.videoPath) console.log(`   Video: ${item.videoPath}`)
    if (item.error) console.log(`   Error: ${item.error}`)
    if (item.reviewNote) console.log(`   Note: ${item.reviewNote}`)
    console.log()
  }
}

async function cmdStats(): Promise<void> {
  const stats = getStats()

  console.log(`\n📊 Content Pipeline Stats`)
  console.log(`${'─'.repeat(35)}`)
  console.log(`📝 Generated:  ${stats.generated}`)
  console.log(`✅ Approved:   ${stats.approved}`)
  console.log(`❌ Rejected:   ${stats.rejected}`)
  console.log(`🎬 Rendering:  ${stats.rendering}`)
  console.log(`🎥 Rendered:   ${stats.rendered}`)
  console.log(`📤 Posted:     ${stats.posted}`)
  console.log(`💥 Failed:     ${stats.failed}`)
  console.log(`${'─'.repeat(35)}`)
  console.log(`   Total:      ${stats.total}`)

  if (stats.approved > 0) {
    console.log(`\nNext step: npx tsx cli.ts render`)
  } else if (stats.generated > 0) {
    console.log(`\nNext step: npx tsx cli.ts review`)
  } else {
    console.log(`\nNext step: npx tsx cli.ts generate`)
  }
}

// ============================================
// Main dispatcher
// ============================================

const HELP = `
AI Avatar Content Pipeline — CLI

Commands:
  generate [--count=N] [--format=X] [--category=X] [--dry-run]
      Generate N scripts from content atoms via LLM

  review
      Interactive review of generated scripts (approve/reject)

  approve <id>
      Approve a specific script by ID

  reject <id> [--reason="..."]
      Reject a specific script by ID

  render
      Render next approved script via HeyGen (~5-10 min)

  render-all
      Render all approved scripts via HeyGen

  post [--skip-instagram] [--skip-tiktok]
      Post next rendered video to TikTok + Instagram

  process
      Full pipeline for next approved: render + post

  list [--status=X]
      List queue items, optionally filtered by status

  stats
      Show queue statistics

  voices
      List HeyGen PT-BR voices

  avatars
      List HeyGen avatars

Formats: ${SCRIPT_FORMATS.join(', ')}

Examples:
  npx tsx cli.ts generate --count=5
  npx tsx cli.ts generate --format=hot-take --category=setores --count=3
  npx tsx cli.ts generate --dry-run
  npx tsx cli.ts review
  npx tsx cli.ts render
  npx tsx cli.ts stats
`

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const command = args[0]
  const commandArgs = args.slice(1)

  switch (command) {
    case 'generate':
      await cmdGenerate(commandArgs)
      break
    case 'review':
      await cmdReview()
      break
    case 'approve':
      await cmdApprove(commandArgs)
      break
    case 'reject':
      await cmdReject(commandArgs)
      break
    case 'render':
      await cmdRender()
      break
    case 'render-all':
      await cmdRenderAll()
      break
    case 'post':
      await cmdPost(commandArgs)
      break
    case 'process':
      await cmdProcess()
      break
    case 'list':
      await cmdList(commandArgs)
      break
    case 'stats':
      await cmdStats()
      break
    case 'voices':
      await listVoices('Portuguese')
      break
    case 'avatars':
      await listAvatars()
      break
    case '--help':
    case '-h':
    case 'help':
    case undefined:
      console.log(HELP)
      break
    default:
      console.error(`Unknown command: ${command}`)
      console.log(HELP)
      process.exit(1)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
