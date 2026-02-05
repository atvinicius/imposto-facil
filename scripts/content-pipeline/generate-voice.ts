/**
 * Voice Generation Module
 * Converts script text to natural-sounding PT-BR audio
 * 
 * Supports:
 * - ElevenLabs (recommended - best quality)
 * - OpenAI TTS (budget option)
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from './config.js';

// ============================================
// TYPES
// ============================================

interface VoiceOptions {
  text: string;
  outputPath: string;
  provider?: 'elevenlabs' | 'openai';
}

interface VoiceResult {
  success: boolean;
  outputPath?: string;
  duration?: number;
  error?: string;
}

// ============================================
// ELEVENLABS IMPLEMENTATION
// ============================================

async function generateWithElevenLabs(text: string, outputPath: string): Promise<VoiceResult> {
  const { apiKey, voiceId, modelId } = config.elevenlabs;
  
  console.log(`🎤 Generating voice with ElevenLabs...`);
  console.log(`   Voice ID: ${voiceId}`);
  console.log(`   Model: ${modelId}`);
  console.log(`   Text length: ${text.length} characters`);
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5, // More expressive
          use_speaker_boost: true,
        },
      }),
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      error: `ElevenLabs API error: ${response.status} - ${error}`,
    };
  }
  
  // Save audio file
  const audioBuffer = await response.arrayBuffer();
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, Buffer.from(audioBuffer));
  
  console.log(`   ✅ Saved to: ${outputPath}`);
  
  return {
    success: true,
    outputPath,
  };
}

// ============================================
// OPENAI TTS IMPLEMENTATION
// ============================================

async function generateWithOpenAI(text: string, outputPath: string): Promise<VoiceResult> {
  const { apiKey, voice, model } = config.openai;
  
  console.log(`🎤 Generating voice with OpenAI TTS...`);
  console.log(`   Voice: ${voice}`);
  console.log(`   Model: ${model}`);
  console.log(`   Text length: ${text.length} characters`);
  
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      response_format: 'mp3',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      error: `OpenAI API error: ${response.status} - ${error}`,
    };
  }
  
  // Save audio file
  const audioBuffer = await response.arrayBuffer();
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, Buffer.from(audioBuffer));
  
  console.log(`   ✅ Saved to: ${outputPath}`);
  
  return {
    success: true,
    outputPath,
  };
}

// ============================================
// MAIN EXPORT
// ============================================

export async function generateVoice(options: VoiceOptions): Promise<VoiceResult> {
  const provider = options.provider || config.ttsProvider;
  
  try {
    if (provider === 'elevenlabs') {
      return await generateWithElevenLabs(options.text, options.outputPath);
    } else {
      return await generateWithOpenAI(options.text, options.outputPath);
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================
// CLI USAGE
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npx tsx generate-voice.ts <text-or-file> <output.mp3>');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx generate-voice.ts "Olá, mundo!" output/test.mp3');
    console.log('  npx tsx generate-voice.ts ./scripts/script-01.txt output/script-01.mp3');
    process.exit(1);
  }
  
  const [input, outputPath] = args;
  
  // Check if input is a file path
  let text: string;
  try {
    await fs.access(input);
    text = await fs.readFile(input, 'utf-8');
  } catch {
    text = input;
  }
  
  const result = await generateVoice({ text, outputPath });
  
  if (!result.success) {
    console.error(`❌ Error: ${result.error}`);
    process.exit(1);
  }
  
  console.log(`\n✅ Voice generated successfully!`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
