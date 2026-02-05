/**
 * Full Content Pipeline Orchestration
 * 
 * Takes a script and produces a posted video:
 * 1. Parse script from markdown
 * 2. Generate voiceover (ElevenLabs/OpenAI)
 * 3. Generate video (Creatomate)
 * 4. Post to social media (TikTok/Instagram)
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { config } from './config.js';
import { generateVoice } from './generate-voice.js';
import { generateVideo, createTextOverlaysFromScript } from './generate-video.js';
import { postVideo } from './post-video.js';

// ============================================
// TYPES
// ============================================

interface ParsedScript {
  id: string;
  title: string;
  target: string;
  format: string;
  estimatedLength: number; // seconds
  hook: string;
  body: string;
  cta: string;
  caption: string;
  fullText: string; // For TTS
}

interface PipelineOptions {
  scriptsFile: string;
  scriptId?: string; // Specific script to process
  skipVoice?: boolean; // Use existing audio
  skipVideo?: boolean; // Use existing video
  skipPost?: boolean;  // Don't post, just generate
  dryRun?: boolean;    // Just show what would happen
}

interface PipelineResult {
  success: boolean;
  script: ParsedScript;
  audioPath?: string;
  videoPath?: string;
  postResult?: any;
  error?: string;
}

// ============================================
// SCRIPT PARSER
// ============================================

/**
 * Parse scripts from the markdown file format
 */
async function parseScriptsFromMarkdown(filePath: string): Promise<ParsedScript[]> {
  const content = await fs.readFile(filePath, 'utf-8');
  const scripts: ParsedScript[] = [];
  
  // Split by script headers (## SCRIPT XX:)
  const scriptSections = content.split(/(?=## SCRIPT \d+:)/);
  
  for (const section of scriptSections) {
    if (!section.includes('## SCRIPT')) continue;
    
    const script = parseScriptSection(section);
    if (script) scripts.push(script);
  }
  
  return scripts;
}

function parseScriptSection(section: string): ParsedScript | null {
  // Extract script number and title
  const headerMatch = section.match(/## SCRIPT (\d+):\s*(.+)/);
  if (!headerMatch) return null;
  
  const id = `script-${headerMatch[1].padStart(2, '0')}`;
  const title = headerMatch[2].trim();
  
  // Extract metadata
  const targetMatch = section.match(/\*\*Target:\*\*\s*(.+)/);
  const formatMatch = section.match(/\*\*Format:\*\*\s*(.+)/);
  const lengthMatch = section.match(/\*\*Estimated Length:\*\*\s*(\d+)/);
  
  // Extract script parts
  const hookMatch = section.match(/### HOOK[^"]*"([^"]+)"/);
  const ctaMatch = section.match(/### CTA[^"]*"([^"]+)"/);
  const captionMatch = section.match(/### CAPTION\n([^\n#]+)/);
  
  // Extract body - everything between BODY header and CTA
  const bodyMatch = section.match(/### BODY[\s\S]*?"([^"]+(?:"[^"]+)*)/);
  let body = '';
  
  // More robust body extraction
  const bodySection = section.match(/### BODY[\s\S]+?(?=### CTA)/);
  if (bodySection) {
    // Extract all quoted text from body section
    const quotes = bodySection[0].match(/"[^"]+"/g);
    if (quotes) {
      body = quotes.map(q => q.replace(/"/g, '')).join('\n\n');
    }
  }
  
  if (!hookMatch || !body || !ctaMatch) {
    console.log(`   ⚠️ Skipping ${id}: missing hook, body, or CTA`);
    return null;
  }
  
  const hook = hookMatch[1];
  const cta = ctaMatch[1];
  
  // Combine for full TTS text
  const fullText = `${hook}\n\n${body}\n\n${cta}`;
  
  return {
    id,
    title,
    target: targetMatch?.[1] || 'All',
    format: formatMatch?.[1] || 'Talking head',
    estimatedLength: parseInt(lengthMatch?.[1] || '45'),
    hook,
    body,
    cta,
    caption: captionMatch?.[1]?.trim() || '',
    fullText,
  };
}

// ============================================
// PIPELINE
// ============================================

export async function runPipeline(options: PipelineOptions): Promise<PipelineResult[]> {
  console.log('🚀 Starting Content Pipeline\n');
  console.log('━'.repeat(50));
  
  // Step 1: Parse scripts
  console.log('\n📄 Parsing scripts...');
  const scripts = await parseScriptsFromMarkdown(options.scriptsFile);
  console.log(`   Found ${scripts.length} scripts`);
  
  // Filter to specific script if requested
  const scriptsToProcess = options.scriptId
    ? scripts.filter(s => s.id === options.scriptId)
    : scripts;
  
  if (scriptsToProcess.length === 0) {
    console.error(`   ❌ No scripts found${options.scriptId ? ` matching "${options.scriptId}"` : ''}`);
    return [];
  }
  
  console.log(`   Processing ${scriptsToProcess.length} script(s)`);
  
  const results: PipelineResult[] = [];
  
  for (const script of scriptsToProcess) {
    console.log('\n' + '━'.repeat(50));
    console.log(`\n📝 Processing: ${script.id} - ${script.title}`);
    console.log(`   Target: ${script.target}`);
    console.log(`   Format: ${script.format}`);
    console.log(`   Length: ~${script.estimatedLength}s`);
    
    if (options.dryRun) {
      console.log('\n   [DRY RUN] Would process this script');
      console.log(`   Hook: "${script.hook.substring(0, 50)}..."`);
      results.push({ success: true, script });
      continue;
    }
    
    const result: PipelineResult = { success: true, script };
    
    try {
      // Step 2: Generate voice
      const audioPath = path.join(config.output.audioDir, `${script.id}.mp3`);
      
      if (!options.skipVoice) {
        console.log('\n🎤 Generating voiceover...');
        const voiceResult = await generateVoice({
          text: script.fullText,
          outputPath: audioPath,
        });
        
        if (!voiceResult.success) {
          throw new Error(`Voice generation failed: ${voiceResult.error}`);
        }
        
        result.audioPath = audioPath;
      } else {
        console.log('\n🎤 Skipping voice generation (using existing)');
        result.audioPath = audioPath;
      }
      
      // Step 3: Generate video
      const videoPath = path.join(config.output.videoDir, `${script.id}.mp4`);
      
      if (!options.skipVideo) {
        console.log('\n🎬 Generating video...');
        
        const textOverlays = createTextOverlaysFromScript(
          script.hook,
          script.body,
          script.cta,
          script.estimatedLength
        );
        
        const videoResult = await generateVideo({
          audioPath: result.audioPath!,
          textOverlays,
          outputPath: videoPath,
          caption: script.caption,
        });
        
        if (!videoResult.success) {
          throw new Error(`Video generation failed: ${videoResult.error}`);
        }
        
        result.videoPath = videoPath;
      } else {
        console.log('\n🎬 Skipping video generation (using existing)');
        result.videoPath = videoPath;
      }
      
      // Step 4: Post to social media
      if (!options.skipPost) {
        console.log('\n📤 Posting to social media...');
        
        const postResult = await postVideo({
          videoPath: result.videoPath!,
          caption: script.caption,
          hashtags: extractHashtags(script.caption),
        });
        
        result.postResult = postResult;
        
        if (!postResult.success) {
          console.log('   ⚠️ Some posts may have failed (see details above)');
        }
      } else {
        console.log('\n📤 Skipping social media posting');
      }
      
      console.log(`\n✅ ${script.id} completed successfully!`);
      
    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`\n❌ ${script.id} failed: ${result.error}`);
    }
    
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '━'.repeat(50));
  console.log('\n📊 Pipeline Summary\n');
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`   ✅ Successful: ${successful}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📦 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n   Failed scripts:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`   - ${r.script.id}: ${r.error}`));
  }
  
  return results;
}

function extractHashtags(caption: string): string[] {
  const matches = caption.match(/#\w+/g);
  return matches ? matches.map(t => t.replace('#', '')) : [];
}

// ============================================
// CLI
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  // Default scripts file
  const scriptsFile = args.find(a => a.endsWith('.md')) ||
    '../../content/scripts-batch-01.md';
  
  // Parse flags
  const options: PipelineOptions = {
    scriptsFile,
    scriptId: args.find(a => a.startsWith('--script='))?.split('=')[1],
    skipVoice: args.includes('--skip-voice'),
    skipVideo: args.includes('--skip-video'),
    skipPost: args.includes('--skip-post'),
    dryRun: args.includes('--dry-run'),
  };
  
  if (args.includes('--help')) {
    console.log(`
ImpostoFacil Content Pipeline

Usage: npx tsx pipeline.ts [scripts.md] [options]

Options:
  --script=ID      Process only this script (e.g., --script=script-01)
  --skip-voice     Skip voice generation (use existing audio)
  --skip-video     Skip video generation (use existing video)
  --skip-post      Skip social media posting
  --dry-run        Show what would happen without doing it
  --help           Show this help

Examples:
  npx tsx pipeline.ts                           # Process all scripts
  npx tsx pipeline.ts --script=script-03        # Process only script 03
  npx tsx pipeline.ts --skip-post --dry-run     # Test without posting
`);
    process.exit(0);
  }
  
  await runPipeline(options);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
