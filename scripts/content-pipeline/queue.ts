/**
 * Content Queue — JSON file-based queue for script pipeline
 *
 * Manages the lifecycle of generated scripts:
 *   generated → approved → rendering → rendered → posted
 *            → rejected
 *   any → failed
 *
 * Queue file: queue-data/queue.json
 */

import fs from 'fs'
import path from 'path'
import type { GeneratedScript, QueueItem, QueueStatus } from './types.js'

const QUEUE_DIR = path.resolve(process.cwd(), 'queue-data')
const QUEUE_FILE = path.join(QUEUE_DIR, 'queue.json')

// ============================================
// Queue I/O
// ============================================

function ensureQueueDir(): void {
  if (!fs.existsSync(QUEUE_DIR)) {
    fs.mkdirSync(QUEUE_DIR, { recursive: true })
  }
}

export function loadQueue(): QueueItem[] {
  ensureQueueDir()
  if (!fs.existsSync(QUEUE_FILE)) {
    return []
  }
  const raw = fs.readFileSync(QUEUE_FILE, 'utf-8')
  return JSON.parse(raw) as QueueItem[]
}

export function saveQueue(items: QueueItem[]): void {
  ensureQueueDir()
  fs.writeFileSync(QUEUE_FILE, JSON.stringify(items, null, 2), 'utf-8')
}

// ============================================
// Queue operations
// ============================================

/** Add generated scripts to the queue */
export function enqueueScripts(scripts: GeneratedScript[]): QueueItem[] {
  const queue = loadQueue()
  const now = new Date().toISOString()

  const newItems: QueueItem[] = scripts.map(script => ({
    id: script.id,
    script,
    status: 'generated' as QueueStatus,
    createdAt: now,
    updatedAt: now,
  }))

  // Deduplicate by ID
  const existingIds = new Set(queue.map(q => q.id))
  const uniqueNew = newItems.filter(item => !existingIds.has(item.id))

  if (uniqueNew.length < newItems.length) {
    console.log(`  Skipped ${newItems.length - uniqueNew.length} duplicate scripts`)
  }

  queue.push(...uniqueNew)
  saveQueue(queue)

  return uniqueNew
}

/** Approve a script for rendering */
export function approveItem(id: string, note?: string): QueueItem | null {
  const queue = loadQueue()
  const item = queue.find(q => q.id === id)

  if (!item) return null
  if (item.status !== 'generated') {
    console.log(`Cannot approve: item is "${item.status}", not "generated"`)
    return null
  }

  item.status = 'approved'
  item.updatedAt = new Date().toISOString()
  if (note) item.reviewNote = note
  saveQueue(queue)

  return item
}

/** Reject a script */
export function rejectItem(id: string, reason?: string): QueueItem | null {
  const queue = loadQueue()
  const item = queue.find(q => q.id === id)

  if (!item) return null
  if (item.status !== 'generated') {
    console.log(`Cannot reject: item is "${item.status}", not "generated"`)
    return null
  }

  item.status = 'rejected'
  item.updatedAt = new Date().toISOString()
  if (reason) item.reviewNote = reason
  saveQueue(queue)

  return item
}

/** Get the next approved script ready for rendering */
export function getNextApproved(): QueueItem | null {
  const queue = loadQueue()
  return queue.find(q => q.status === 'approved') || null
}

/** Mark an item as rendering (HeyGen job submitted) */
export function markRendering(id: string, heygenVideoId: string): QueueItem | null {
  const queue = loadQueue()
  const item = queue.find(q => q.id === id)

  if (!item) return null

  item.status = 'rendering'
  item.heygenVideoId = heygenVideoId
  item.updatedAt = new Date().toISOString()
  saveQueue(queue)

  return item
}

/** Mark an item as rendered (video downloaded) */
export function markRendered(
  id: string,
  videoPath: string,
  captionVideoPath?: string,
): QueueItem | null {
  const queue = loadQueue()
  const item = queue.find(q => q.id === id)

  if (!item) return null

  item.status = 'rendered'
  item.videoPath = videoPath
  item.captionVideoPath = captionVideoPath
  item.updatedAt = new Date().toISOString()
  saveQueue(queue)

  return item
}

/** Mark an item as posted */
export function markPosted(
  id: string,
  postResults: QueueItem['postResults'],
): QueueItem | null {
  const queue = loadQueue()
  const item = queue.find(q => q.id === id)

  if (!item) return null

  item.status = 'posted'
  item.postResults = postResults
  item.updatedAt = new Date().toISOString()
  saveQueue(queue)

  return item
}

/** Mark an item as failed */
export function markFailed(id: string, error: string): QueueItem | null {
  const queue = loadQueue()
  const item = queue.find(q => q.id === id)

  if (!item) return null

  item.status = 'failed'
  item.error = error
  item.updatedAt = new Date().toISOString()
  saveQueue(queue)

  return item
}

/** Get the next rendered item ready for posting */
export function getNextRendered(): QueueItem | null {
  const queue = loadQueue()
  return queue.find(q => q.status === 'rendered') || null
}

/** Get all items with a given status */
export function getItemsByStatus(status: QueueStatus): QueueItem[] {
  const queue = loadQueue()
  return queue.filter(q => q.status === status)
}

/** Get a single item by ID */
export function getItem(id: string): QueueItem | null {
  const queue = loadQueue()
  return queue.find(q => q.id === id) || null
}

// ============================================
// Stats
// ============================================

export interface QueueStats {
  total: number
  generated: number
  approved: number
  rejected: number
  rendering: number
  rendered: number
  posted: number
  failed: number
}

export function getStats(): QueueStats {
  const queue = loadQueue()

  const stats: QueueStats = {
    total: queue.length,
    generated: 0,
    approved: 0,
    rejected: 0,
    rendering: 0,
    rendered: 0,
    posted: 0,
    failed: 0,
  }

  for (const item of queue) {
    stats[item.status]++
  }

  return stats
}

/** Get list of recent topics (for dedup in script generation) */
export function getRecentTopics(limit: number = 20): string[] {
  const queue = loadQueue()
  return queue
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit)
    .map(q => q.script.sourceAtoms.join(', '))
}
