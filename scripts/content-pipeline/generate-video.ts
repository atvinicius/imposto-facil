/**
 * Video Generation Module
 * Creates vertical videos from audio + text using Creatomate API
 * 
 * Supports:
 * - Faceless videos (text on screen + voiceover)
 * - Text animation videos
 * - Background music overlay
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from './config.js';

// ============================================
// TYPES
// ============================================

interface TextOverlay {
  text: string;
  startTime: number; // seconds
  endTime: number;   // seconds
  position?: 'top' | 'center' | 'bottom';
  style?: 'default' | 'highlight' | 'big';
}

interface VideoOptions {
  audioPath: string;
  textOverlays: TextOverlay[];
  outputPath: string;
  templateId?: string;
  backgroundColor?: string;
  caption?: string; // For the final caption/CTA
}

interface VideoResult {
  success: boolean;
  outputPath?: string;
  renderId?: string;
  error?: string;
}

// ============================================
// CREATOMATE IMPLEMENTATION
// ============================================

/**
 * Create a video using Creatomate's REST API
 * 
 * The JSON structure matches Creatomate's schema:
 * https://creatomate.com/docs/api/rest-api/render
 */
async function renderWithCreatomate(options: VideoOptions): Promise<VideoResult> {
  const { apiKey, facelessTemplateId } = config.creatomate;
  const templateId = options.templateId || facelessTemplateId;
  
  console.log(`🎬 Generating video with Creatomate...`);
  console.log(`   Template: ${templateId}`);
  console.log(`   Audio: ${options.audioPath}`);
  console.log(`   Text overlays: ${options.textOverlays.length}`);
  
  // Read audio file and convert to base64 for upload
  const audioBuffer = await fs.readFile(options.audioPath);
  const audioBase64 = audioBuffer.toString('base64');
  const audioMimeType = options.audioPath.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
  
  // Build the render payload
  // This is a simplified version - actual template depends on your Creatomate setup
  const renderPayload = {
    template_id: templateId,
    modifications: {
      // Audio track
      'Audio-1': `data:${audioMimeType};base64,${audioBase64}`,
      
      // Background color
      'Background': options.backgroundColor || config.brand.primaryColor,
      
      // Text overlays - mapped to template placeholders
      ...buildTextModifications(options.textOverlays),
    },
  };
  
  // If no template, use dynamic composition
  const payload = templateId ? renderPayload : buildDynamicComposition(options, audioBase64, audioMimeType);
  
  const response = await fetch('https://api.creatomate.com/v1/renders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      error: `Creatomate API error: ${response.status} - ${error}`,
    };
  }
  
  const result = await response.json() as { id: string; url?: string; status: string }[];
  const render = result[0];
  
  console.log(`   Render ID: ${render.id}`);
  console.log(`   Status: ${render.status}`);
  
  // Poll for completion
  const videoUrl = await pollRenderStatus(render.id);
  
  if (!videoUrl) {
    return {
      success: false,
      error: 'Render failed or timed out',
      renderId: render.id,
    };
  }
  
  // Download the video
  await downloadVideo(videoUrl, options.outputPath);
  
  return {
    success: true,
    outputPath: options.outputPath,
    renderId: render.id,
  };
}

/**
 * Build text modifications for template
 */
function buildTextModifications(overlays: TextOverlay[]): Record<string, string> {
  const mods: Record<string, string> = {};
  
  overlays.forEach((overlay, index) => {
    // Creatomate templates typically use Text-1, Text-2, etc.
    mods[`Text-${index + 1}`] = overlay.text;
  });
  
  return mods;
}

/**
 * Build a dynamic composition when no template is used
 * This creates a video from scratch using Creatomate's JSON schema
 */
function buildDynamicComposition(
  options: VideoOptions,
  audioBase64: string,
  audioMimeType: string
) {
  const { width, height, fps } = config.video;
  
  // Estimate duration from audio (rough: 150 words/min, ~5 chars/word)
  // In production, you'd use audio metadata
  const estimatedDuration = 45; // seconds, adjust based on actual audio
  
  return {
    output_format: 'mp4',
    width,
    height,
    frame_rate: fps,
    elements: [
      // Background
      {
        type: 'shape',
        shape: 'rectangle',
        fill_color: options.backgroundColor || config.brand.primaryColor,
        width: '100%',
        height: '100%',
      },
      
      // Audio track
      {
        type: 'audio',
        source: `data:${audioMimeType};base64,${audioBase64}`,
        duration: estimatedDuration,
      },
      
      // Text overlays
      ...options.textOverlays.map((overlay, index) => ({
        type: 'text',
        text: overlay.text,
        font_family: config.brand.fontFamily,
        font_size: overlay.style === 'big' ? '64 px' : '48 px',
        fill_color: config.brand.textColor,
        x: '50%',
        y: getYPosition(overlay.position),
        x_alignment: '50%',
        y_alignment: '50%',
        time: overlay.startTime,
        duration: overlay.endTime - overlay.startTime,
        animations: [
          {
            type: 'fade',
            fade_in_duration: 0.3,
            fade_out_duration: 0.3,
          },
        ],
      })),
      
      // Logo/watermark
      {
        type: 'text',
        text: config.brand.name,
        font_family: config.brand.fontFamily,
        font_size: '24 px',
        fill_color: 'rgba(255, 255, 255, 0.6)',
        x: '50%',
        y: '95%',
        x_alignment: '50%',
        y_alignment: '50%',
      },
    ],
  };
}

function getYPosition(position?: 'top' | 'center' | 'bottom'): string {
  switch (position) {
    case 'top': return '20%';
    case 'bottom': return '80%';
    default: return '50%';
  }
}

/**
 * Poll Creatomate for render completion
 */
async function pollRenderStatus(renderId: string, maxAttempts = 60): Promise<string | null> {
  const { apiKey } = config.creatomate;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await sleep(2000); // Wait 2 seconds between polls
    
    const response = await fetch(`https://api.creatomate.com/v1/renders/${renderId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    
    if (!response.ok) continue;
    
    const render = await response.json() as { status: string; url?: string };
    
    console.log(`   Polling... Status: ${render.status}`);
    
    if (render.status === 'succeeded' && render.url) {
      return render.url;
    }
    
    if (render.status === 'failed') {
      return null;
    }
  }
  
  return null;
}

/**
 * Download video from URL
 */
async function downloadVideo(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, Buffer.from(buffer));
  
  console.log(`   ✅ Saved to: ${outputPath}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// MAIN EXPORT
// ============================================

export async function generateVideo(options: VideoOptions): Promise<VideoResult> {
  try {
    return await renderWithCreatomate(options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Helper to create text overlays from a script
 * Splits text into timed segments
 */
export function createTextOverlaysFromScript(
  hook: string,
  body: string,
  cta: string,
  totalDuration: number
): TextOverlay[] {
  const overlays: TextOverlay[] = [];
  
  // Hook: first 3 seconds
  overlays.push({
    text: hook,
    startTime: 0,
    endTime: 3,
    position: 'center',
    style: 'big',
  });
  
  // Body: split into chunks, middle section
  const bodySentences = body.split(/[.!?]+/).filter(s => s.trim());
  const bodyDuration = totalDuration - 8; // minus hook (3s) and CTA (5s)
  const sentenceDuration = bodyDuration / bodySentences.length;
  
  bodySentences.forEach((sentence, index) => {
    overlays.push({
      text: sentence.trim(),
      startTime: 3 + (index * sentenceDuration),
      endTime: 3 + ((index + 1) * sentenceDuration),
      position: 'center',
      style: 'default',
    });
  });
  
  // CTA: last 5 seconds
  overlays.push({
    text: cta,
    startTime: totalDuration - 5,
    endTime: totalDuration,
    position: 'bottom',
    style: 'highlight',
  });
  
  return overlays;
}

// ============================================
// CLI USAGE
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npx tsx generate-video.ts <audio.mp3> <output.mp4> [text...]');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx generate-video.ts output/audio/test.mp3 output/video/test.mp4');
    process.exit(1);
  }
  
  const [audioPath, outputPath, ...textArgs] = args;
  
  // Simple text overlays from args
  const textOverlays: TextOverlay[] = textArgs.length > 0
    ? textArgs.map((text, index) => ({
        text,
        startTime: index * 5,
        endTime: (index + 1) * 5,
        position: 'center' as const,
      }))
    : [{ text: 'ImpostoFacil', startTime: 0, endTime: 5, position: 'center' as const }];
  
  const result = await generateVideo({
    audioPath,
    outputPath,
    textOverlays,
  });
  
  if (!result.success) {
    console.error(`❌ Error: ${result.error}`);
    process.exit(1);
  }
  
  console.log(`\n✅ Video generated successfully!`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
