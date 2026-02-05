/**
 * Quick test script for voice generation
 * Tests the ElevenLabs/OpenAI TTS integration with Portuguese
 * 
 * Usage:
 *   npx tsx test-voice.ts
 *   npx tsx test-voice.ts openai   # to test OpenAI instead
 */

import fs from 'fs/promises';
import path from 'path';

// Test configuration - replace with your actual keys or import from config.ts
const TEST_CONFIG = {
  elevenlabs: {
    apiKey: process.env.ELEVENLABS_API_KEY || 'YOUR_ELEVENLABS_API_KEY',
    voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel
    modelId: 'eleven_multilingual_v2',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY',
    voice: 'onyx',
    model: 'tts-1',
  },
};

// Sample script text in Portuguese (Brazil)
const TEST_SCRIPT = `
A maior mudança tributária dos últimos 50 anos começou semana passada.
E você nem ficou sabendo.

Em janeiro de 2026, o Brasil começou a transição para um novo sistema de impostos.

Se você é empresário e não sabe se vai pagar mais ou menos imposto, 
link na bio pro diagnóstico gratuito.
`.trim();

async function testElevenLabs(): Promise<void> {
  console.log('🎤 Testing ElevenLabs...\n');
  
  const { apiKey, voiceId, modelId } = TEST_CONFIG.elevenlabs;
  
  if (apiKey === 'YOUR_ELEVENLABS_API_KEY') {
    console.log('❌ Please set ELEVENLABS_API_KEY environment variable or edit TEST_CONFIG');
    console.log('   Example: ELEVENLABS_API_KEY=xxx npx tsx test-voice.ts');
    return;
  }
  
  console.log(`Voice ID: ${voiceId}`);
  console.log(`Model: ${modelId}`);
  console.log(`Text length: ${TEST_SCRIPT.length} characters\n`);
  
  const startTime = Date.now();
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: TEST_SCRIPT,
        model_id: modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.5,
          use_speaker_boost: true,
        },
      }),
    }
  );
  
  const duration = Date.now() - startTime;
  
  if (!response.ok) {
    const error = await response.text();
    console.log(`❌ Error: ${response.status} - ${error}`);
    return;
  }
  
  // Save the audio
  const outputDir = './output/audio';
  await fs.mkdir(outputDir, { recursive: true });
  
  const outputPath = path.join(outputDir, 'test-elevenlabs.mp3');
  const audioBuffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(audioBuffer));
  
  const fileStats = await fs.stat(outputPath);
  
  console.log(`✅ Success!`);
  console.log(`   Time: ${duration}ms`);
  console.log(`   File size: ${(fileStats.size / 1024).toFixed(1)} KB`);
  console.log(`   Saved to: ${outputPath}`);
  console.log(`\n🎧 Play with: afplay ${outputPath} (Mac) or mpv ${outputPath}`);
}

async function testOpenAI(): Promise<void> {
  console.log('🎤 Testing OpenAI TTS...\n');
  
  const { apiKey, voice, model } = TEST_CONFIG.openai;
  
  if (apiKey === 'YOUR_OPENAI_API_KEY') {
    console.log('❌ Please set OPENAI_API_KEY environment variable or edit TEST_CONFIG');
    console.log('   Example: OPENAI_API_KEY=xxx npx tsx test-voice.ts openai');
    return;
  }
  
  console.log(`Voice: ${voice}`);
  console.log(`Model: ${model}`);
  console.log(`Text length: ${TEST_SCRIPT.length} characters\n`);
  
  const startTime = Date.now();
  
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: TEST_SCRIPT,
      voice,
      response_format: 'mp3',
    }),
  });
  
  const duration = Date.now() - startTime;
  
  if (!response.ok) {
    const error = await response.text();
    console.log(`❌ Error: ${response.status} - ${error}`);
    return;
  }
  
  // Save the audio
  const outputDir = './output/audio';
  await fs.mkdir(outputDir, { recursive: true });
  
  const outputPath = path.join(outputDir, 'test-openai.mp3');
  const audioBuffer = await response.arrayBuffer();
  await fs.writeFile(outputPath, Buffer.from(audioBuffer));
  
  const fileStats = await fs.stat(outputPath);
  
  console.log(`✅ Success!`);
  console.log(`   Time: ${duration}ms`);
  console.log(`   File size: ${(fileStats.size / 1024).toFixed(1)} KB`);
  console.log(`   Saved to: ${outputPath}`);
  console.log(`\n🎧 Play with: afplay ${outputPath} (Mac) or mpv ${outputPath}`);
}

async function main() {
  const provider = process.argv[2] || 'elevenlabs';
  
  console.log('═'.repeat(50));
  console.log(' ImpostoFacil Voice Generation Test');
  console.log('═'.repeat(50));
  console.log();
  console.log('Test text (Portuguese - Brazil):');
  console.log('─'.repeat(50));
  console.log(TEST_SCRIPT);
  console.log('─'.repeat(50));
  console.log();
  
  if (provider === 'openai') {
    await testOpenAI();
  } else {
    await testElevenLabs();
  }
}

main().catch(console.error);
