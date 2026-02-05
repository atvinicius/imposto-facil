/**
 * OpenAI TTS Test Script
 * Tests Portuguese (Brazil) voice generation with OpenAI API
 * 
 * Run: OPENAI_API_KEY=xxx npx tsx test-openai-tts.ts
 */

import fs from 'fs/promises';
import path from 'path';

const TEST_SCRIPT = `
A maior mudança tributária dos últimos 50 anos começou semana passada.
E você nem ficou sabendo.

Em janeiro de 2026, o Brasil começou a transição para um novo sistema de impostos.
O ICMS, ISS, PIS, Cofins — tudo isso vai deixar de existir.
No lugar, entram dois novos impostos: IBS e CBS.

Se você é empresário e não sabe se vai pagar mais ou menos imposto, 
link na bio pro diagnóstico gratuito.
`.trim();

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('═'.repeat(60));
  console.log('  ImpostoFacil - OpenAI TTS Test (Portuguese Brazil)');
  console.log('═'.repeat(60));
  console.log();
  
  if (!apiKey) {
    console.log('❌ OPENAI_API_KEY environment variable not set');
    console.log('   Run: OPENAI_API_KEY=your-key npx tsx test-openai-tts.ts');
    process.exit(1);
  }
  
  console.log('📝 Test script:');
  console.log('─'.repeat(60));
  console.log(TEST_SCRIPT);
  console.log('─'.repeat(60));
  console.log();
  console.log(`Text length: ${TEST_SCRIPT.length} characters`);
  console.log();
  
  // Test with different voices
  const voices = ['nova', 'onyx', 'alloy'] as const;
  
  for (const voice of voices) {
    console.log(`\n🎤 Testing voice: ${voice}`);
    
    const startTime = Date.now();
    
    try {
      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: TEST_SCRIPT,
          voice,
          response_format: 'mp3',
        }),
      });
      
      const duration = Date.now() - startTime;
      
      if (!response.ok) {
        const error = await response.text();
        console.log(`   ❌ Error: ${response.status} - ${error}`);
        continue;
      }
      
      // Save the audio
      const outputDir = './output/audio';
      await fs.mkdir(outputDir, { recursive: true });
      
      const outputPath = path.join(outputDir, `test-openai-${voice}.mp3`);
      const audioBuffer = await response.arrayBuffer();
      await fs.writeFile(outputPath, Buffer.from(audioBuffer));
      
      const fileStats = await fs.stat(outputPath);
      
      console.log(`   ✅ Generated in ${duration}ms`);
      console.log(`   📁 File: ${outputPath} (${(fileStats.size / 1024).toFixed(1)} KB)`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error}`);
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('  Test Complete!');
  console.log('  Listen to files in: ./output/audio/');
  console.log('═'.repeat(60));
}

main().catch(console.error);
