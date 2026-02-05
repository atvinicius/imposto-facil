/**
 * Dry Run Demo
 * Shows the full pipeline flow without making actual API calls
 * 
 * Run: npx tsx demo-dry-run.ts
 */

import fs from 'fs/promises';
import path from 'path';

interface Script {
  id: string;
  title: string;
  format: string;
  hook: string;
  body: string;
  cta: string;
  caption: string;
  estimatedLength: number;
}

// Sample scripts from scripts-batch-01.md
const DEMO_SCRIPTS: Script[] = [
  {
    id: 'script-03',
    title: 'Split Payment Terror (2027 Urgency)',
    format: 'Faceless com texto na tela + narração',
    estimatedLength: 40,
    hook: 'Em 2027, o dinheiro das suas vendas não vai mais cair inteiro na sua conta.',
    body: `A partir de 2027, quando alguém pagar você via Pix, cartão ou boleto, o imposto vai ser descontado AUTOMATICAMENTE.

Antes de cair na sua conta.

Isso significa: menos capital de giro. Menos dinheiro pra rodar o negócio.

Aquele imposto que você pagava no mês seguinte? Agora sai na hora.

E quase ninguém tá falando disso.`,
    cta: 'Simulador gratuito pra você ver quanto vai perder de caixa. Link na bio.',
    caption: '⚠️ Split Payment: em 2027, o imposto sai do seu dinheiro ANTES de cair na conta. Já planejou seu fluxo de caixa? #splitpayment #reformatributaria #fluxodecaixa #financas',
  },
  {
    id: 'script-11',
    title: 'The Scary Stat (Pattern Interrupt)',
    format: 'Faceless, big text on screen',
    estimatedLength: 20,
    hook: '83%.',
    body: `Esse é o número de empresários brasileiros que não entendem a reforma tributária.

72% nem começaram a se preparar.

E o período sem multas acaba em abril.`,
    cta: 'Não seja uma estatística. Link na bio.',
    caption: '83%. Esse número deveria te assustar. #reformatributaria #estatistica #empresario',
  },
];

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('═'.repeat(70));
  console.log('  ImpostoFacil Content Pipeline - DRY RUN DEMO');
  console.log('═'.repeat(70));
  console.log();
  console.log('This demo simulates the full pipeline without making actual API calls.');
  console.log('It shows exactly what would happen when you run the real pipeline.');
  console.log();
  
  for (const script of DEMO_SCRIPTS) {
    console.log('─'.repeat(70));
    console.log(`\n📝 Processing: ${script.id} - ${script.title}\n`);
    
    // Script details
    console.log('   📋 Script Details:');
    console.log(`      Format: ${script.format}`);
    console.log(`      Length: ~${script.estimatedLength} seconds`);
    console.log(`      Hook: "${script.hook.substring(0, 50)}..."`);
    console.log();
    
    // Voice generation simulation
    console.log('   🎤 Step 1: Voice Generation');
    console.log('      Provider: ElevenLabs (multilingual_v2)');
    console.log('      Voice: Daniel (onwK4e9ZLuTAKqWW03F9)');
    const fullText = `${script.hook}\n\n${script.body}\n\n${script.cta}`;
    console.log(`      Text length: ${fullText.length} characters`);
    console.log(`      Estimated cost: $${(fullText.length * 0.00003).toFixed(4)}`);
    await sleep(500);
    console.log(`      ✅ Would save to: output/audio/${script.id}.mp3`);
    console.log();
    
    // Video generation simulation
    console.log('   🎬 Step 2: Video Generation');
    console.log('      Provider: Creatomate');
    console.log('      Template: faceless-vertical');
    console.log('      Resolution: 1080x1920 (9:16 vertical)');
    console.log(`      Duration: ~${script.estimatedLength}s`);
    console.log(`      Text overlays: ${script.body.split('\n\n').length + 2} sections`);
    console.log(`      Estimated credits: ~${Math.ceil(script.estimatedLength / 60 * 14)}`);
    await sleep(500);
    console.log(`      ✅ Would save to: output/video/${script.id}.mp4`);
    console.log();
    
    // Social posting simulation
    console.log('   📤 Step 3: Social Media Posting');
    console.log('      Platforms: TikTok, Instagram Reels');
    console.log(`      Caption: "${script.caption.substring(0, 60)}..."`);
    const hashtags = script.caption.match(/#\w+/g) || [];
    console.log(`      Hashtags: ${hashtags.join(', ')}`);
    await sleep(500);
    console.log('      ✅ Would post to TikTok (Content Posting API)');
    console.log('      ✅ Would post to Instagram (Graph API → Reels)');
    console.log();
    
    console.log(`   ✅ ${script.id} would complete successfully!\n`);
  }
  
  // Summary
  console.log('═'.repeat(70));
  console.log('  SUMMARY');
  console.log('═'.repeat(70));
  console.log();
  console.log('  📊 Pipeline Statistics:');
  console.log(`      Scripts processed: ${DEMO_SCRIPTS.length}`);
  
  const totalChars = DEMO_SCRIPTS.reduce((sum, s) => 
    sum + `${s.hook}\n\n${s.body}\n\n${s.cta}`.length, 0);
  console.log(`      Total characters: ${totalChars}`);
  console.log(`      Estimated voice cost: $${(totalChars * 0.00003).toFixed(2)}`);
  
  const totalDuration = DEMO_SCRIPTS.reduce((sum, s) => sum + s.estimatedLength, 0);
  const totalCredits = Math.ceil(totalDuration / 60 * 14);
  console.log(`      Total video duration: ${totalDuration}s`);
  console.log(`      Estimated Creatomate credits: ${totalCredits}`);
  console.log();
  console.log('  💰 Estimated Costs (for this batch):');
  console.log(`      ElevenLabs: ~$${(totalChars * 0.00003).toFixed(2)}`);
  console.log(`      Creatomate: ~$${(totalCredits * 0.004).toFixed(2)}`);
  console.log('      Social APIs: $0');
  console.log(`      Total: ~$${((totalChars * 0.00003) + (totalCredits * 0.004)).toFixed(2)}`);
  console.log();
  console.log('  📁 Files that would be created:');
  DEMO_SCRIPTS.forEach(s => {
    console.log(`      - output/audio/${s.id}.mp3`);
    console.log(`      - output/video/${s.id}.mp4`);
  });
  console.log();
  console.log('═'.repeat(70));
  console.log('  To run the real pipeline:');
  console.log('  1. Add your API keys to config.ts');
  console.log('  2. Run: npx tsx pipeline.ts --script=script-03');
  console.log('═'.repeat(70));
}

main().catch(console.error);
