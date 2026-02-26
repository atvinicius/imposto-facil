/**
 * Script Generator — LLM-powered viral script creation
 *
 * Uses OpenRouter to generate personality-driven, hook-first scripts
 * for AI avatar videos about Brazilian tax reform.
 *
 * Usage:
 *   npx tsx generate-scripts.ts --count=5
 *   npx tsx generate-scripts.ts --format=hot-take --category=setores --count=3
 *   npx tsx generate-scripts.ts --dry-run
 */

import { z } from 'zod'
import { config } from './config.js'
import { extractAllAtoms, filterAtomsByFormat, filterAtomsByCategory, pickAtoms } from './data-extractor.js'
import type { ContentAtom, GeneratedScript, ScriptFormat } from './types.js'
import { SCRIPT_FORMATS } from './types.js'

// ============================================
// System prompt — personality + rules
// ============================================

const SYSTEM_PROMPT = `Voce escreve roteiros de video curto (TikTok/Reels) sobre a reforma tributaria brasileira.
Os videos serao gravados por um avatar IA falando direto pra camera — entao o texto precisa soar como fala natural, nao como texto escrito.

== COMO FALAR ==
- Portugues brasileiro coloquial. "Voce", nunca "tu" formal.
- Tom de conversa entre amigos. Imagina que voce ta explicando pro dono de uma padaria no balcao.
- Frases CURTAS. Maximo 12 palavras por frase. Pausa natural entre cada uma.
- Sem palavras em CAPS LOCK (o avatar nao grita). Sem "BOMBASTICA", "CHOCANTE", "URGENTE".
- Sem emojis no texto falado (emojis so na caption).
- Ritmo: frase forte → pausa → frase forte → pausa. Nao atropele informacao.

== HOOK (primeira frase) ==
- Tem que funcionar em 1 segundo. Quem ta rolando o feed precisa parar.
- Bons hooks sao especificos, nao genericos:
  BOM: "O dinheiro da sua venda nao vai mais cair inteiro na conta."
  BOM: "Se voce tem comercio no Simples, seu imposto pode dobrar em 2027."
  BOM: "Dono de restaurante me perguntou quanto ia mudar. Fiz a conta."
  RUIM: "Opiniao bombastica sobre a reforma!" (generico, clickbait)
  RUIM: "Voce precisa saber disso!" (vazio, nao diz nada)
  RUIM: "83% dos empresarios vao quebrar!" (numero inventado)

== DADOS ==
REGRA ABSOLUTA: Use APENAS numeros e fatos que estao nos DADOS fornecidos.
- Se o dado diz "65%", use "65%". Nao arredonde pra "quase 70%".
- Se nao tem um numero especifico, nao invente. Diga "a maioria" ou "muitas empresas".
- Nunca fabrique estatisticas, historias de clientes, ou pesquisas que nao existem nos dados.
- Quando mencionar um dado, contextualize: "comercio no Simples paga so 65% do imposto que deve, segundo dados da Receita Federal."
- Cuidado com comparacoes de taxa: "4% a 11.5%" e a FAIXA do Simples comercio (varia por faturamento). Nao compare o minimo de um regime com o maximo de outro. Compare faixas completas ou use a media.

== VOCABULARIO DA MARCA (vale pro texto falado E pra caption) ==
Nosso publico sao donos de micro e pequenas empresas. Traduza TUDO, inclusive na caption:
- NUNCA escreva "split payment" — nem no video, nem na caption. Diga "retencao automatica" ou "cobranca automatica no Pix"
- NUNCA escreva "gap de compliance" → diga "diferenca entre o que deve e o que paga"
- NUNCA escreva "EC 132/2023" → diga "a reforma" ou "a nova lei"
- NUNCA escreva "IBS e CBS" sem explicar → diga "os novos impostos que vao substituir ICMS e ISS"
- NUNCA escreva "fator de efetividade" → diga "quanto a empresa realmente paga hoje"
- "aliquota" sozinha e jargao → diga "taxa de imposto" ou "percentual" (pode usar "aliquota" se ja explicou o que e)
- "sonegar/sonegacao" → NUNCA use. Diga "pagar menos do que deve" ou "diferenca entre o legal e o real"
- Pode citar: Simples Nacional, Lucro Presumido, Lucro Real, MEI, ICMS, ISS, Pix, Receita Federal
- Nao use "aqui" ou "la" referindo a estados — o avatar nao tem localizacao

== CORPO DO VIDEO ==
- 3-5 frases que constroem uma narrativa. Nao e uma lista de bullet points.
- Cada frase deve conectar com a anterior. Use transicoes naturais: "So que...", "O problema e que...", "E sabe o que acontece?", "Resultado:".
- Sempre inclua pelo menos 1 dado concreto dos DADOS fornecidos.
- Termine o corpo com uma frase que cria tensao ou insight antes do CTA.

== CTA (chamada pra acao) ==
- Deve soar natural, como se fosse parte da conversa.
- Direcione pro link na bio (simulador do ImpostoFacil).
- Exemplos bons: "Fiz uma calculadora que mostra o impacto exato pro seu tipo de empresa. Link na bio."
- Exemplos ruins: "CORRE pro link!" / "Link na bio!!!" (desespero)

== CAPTION (texto do post) ==
A caption aparece abaixo do video. Estrutura:
1. Frase de contexto (1-2 linhas) que complementa o video, nao repete
2. Pergunta de engajamento: "Qual seu setor? Comenta ai" / "Ja fez as contas?" / "Marca teu contador"
3. Hashtags (5-7): mistura de nicho + alcance. Sempre incluir:
   #reformatributaria #impostos2027 + 2-3 do tema (#mei #simples #comercio etc) + 1-2 de alcance (#empreendedorismo #pequenosnegocios)

== FORMATOS ==
- hot-take: Uma opiniao que surpreende. Nao precisa ser controversa — pode ser um insight que ninguem ta falando. "Todo mundo ta preocupado com a taxa, mas o problema real e outro."
- storytelling: Comeca com uma situacao concreta. "Dono de comercio me perguntou..." / "Imagina: voce vende R$10 mil e so caem R$7.350 na conta." Pode ser hipotetica, mas deve ser realista e baseada nos dados.
- myth-buster: Pega uma crenca comum e mostra com dados que ta errada. "Muita gente acha que o Simples protege de tudo. Deixa eu te mostrar por que nao."
- countdown: Lista com urgencia real. "3 coisas que mudam em 2027 — e a terceira e a que ninguem fala."
- if-you-are: Fala direto pra um perfil. "Se voce tem comercio no Simples em Sao Paulo, esse video e pra voce." Quanto mais especifico, melhor.
- stat-shock: Abre com um numero real dos dados. "R$47 mil por ano. Esse e o impacto medio pra comercio no Simples." Depois explica o que significa.

== FORMATO DE RESPOSTA ==
Retorne APENAS JSON valido. Sem markdown, sem comentarios, sem texto fora do JSON.
{
  "hook": "primeira frase do video — deve funcionar sozinha em 1 segundo",
  "body": ["frase 2", "frase 3", "frase 4", "frase 5 (opcional)"],
  "cta": "chamada pra acao natural",
  "caption": "texto do post com pergunta de engajamento e hashtags",
  "persona": "descricao curta do tom usado nesse video",
  "estimatedSeconds": 35
}`

// ============================================
// Zod schema for LLM output validation
// ============================================

const ScriptSchema = z.object({
  hook: z.string().min(5).max(200),
  body: z.array(z.string().min(3).max(200)).min(3).max(6),
  cta: z.string().min(5).max(200),
  caption: z.string().min(30).max(600),
  persona: z.string().min(3).max(100),
  estimatedSeconds: z.number().min(15).max(75),
})

type ScriptLLMOutput = z.infer<typeof ScriptSchema>

// ============================================
// LLM call via OpenRouter
// ============================================

async function callLLM(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openrouter.apiKey}`,
      'HTTP-Referer': 'https://impostofacil.com.br',
      'X-Title': 'ImpostoFacil Content Pipeline',
    },
    body: JSON.stringify({
      model: config.openrouter.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 1024,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${error}`)
  }

  const result = await response.json() as {
    choices: { message: { content: string } }[]
    model: string
  }

  return result.choices[0].message.content
}

// ============================================
// Script generation
// ============================================

function buildUserPrompt(
  format: ScriptFormat,
  atom: ContentAtom,
  recentTopics: string[],
  extraData?: ContentAtom,
): string {
  let prompt = `FORMATO: ${format}\n`
  prompt += `TOPICO: ${atom.title}\n`
  prompt += `CONTEXTO: ${atom.summary}\n`

  if (atom.keyFacts.length > 0) {
    prompt += `\nDADOS (use APENAS estes numeros — nao invente outros):\n${atom.keyFacts.map(f => `- ${f}`).join('\n')}\n`
  }

  if (extraData && extraData.keyFacts.length > 0) {
    prompt += `\nDADOS COMPLEMENTARES (${extraData.title}):\n${extraData.keyFacts.map(f => `- ${f}`).join('\n')}\n`
  }

  if (atom.commonQuestions && atom.commonQuestions.length > 0) {
    prompt += `\nPERGUNTAS QUE O PUBLICO FAZ: ${atom.commonQuestions.slice(0, 3).join('; ')}\n`
  }

  if (recentTopics.length > 0) {
    prompt += `\nTOPICOS JA COBERTOS (use um angulo diferente): ${recentTopics.slice(-10).join(', ')}\n`
  }

  prompt += `\nLembre: APENAS dados do contexto acima. Frases curtas. Tom de conversa. Sem CAPS LOCK. Retorne APENAS JSON.`

  return prompt
}

function generateScriptId(format: ScriptFormat, atom: ContentAtom): string {
  const date = new Date().toISOString().split('T')[0]
  const topicSlug = atom.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
  return `${date}-${format}-${topicSlug}`
}

/** Parse LLM response into validated script */
function parseLLMResponse(raw: string): ScriptLLMOutput {
  // Strip markdown code fences if present
  let cleaned = raw.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  const parsed = JSON.parse(cleaned)
  return ScriptSchema.parse(parsed)
}

export interface GenerateOptions {
  count: number
  format?: ScriptFormat
  category?: string
  dryRun?: boolean
  recentTopics?: string[]
}

/** Generate N scripts from content atoms */
export async function generateScripts(options: GenerateOptions): Promise<GeneratedScript[]> {
  const { count, format, category, dryRun = false, recentTopics = [] } = options

  // 1. Extract all content atoms
  let atoms = extractAllAtoms()
  console.log(`\nLoaded ${atoms.length} content atoms`)

  // 2. Filter by format/category if specified
  if (format) {
    atoms = filterAtomsByFormat(atoms, format)
    console.log(`  Filtered to ${atoms.length} atoms for format: ${format}`)
  }
  if (category) {
    atoms = filterAtomsByCategory(atoms, category)
    console.log(`  Filtered to ${atoms.length} atoms for category: ${category}`)
  }

  if (atoms.length === 0) {
    console.error('No content atoms match the filters. Try broader criteria.')
    return []
  }

  // 3. Pick atoms for each script
  const usedIds = new Set<string>()
  const scripts: GeneratedScript[] = []

  // Get all tax data atoms for enrichment
  const allAtoms = extractAllAtoms()
  const taxAtoms = allAtoms.filter(a => a.type === 'tax-data')

  for (let i = 0; i < count; i++) {
    // Pick a primary atom
    const [primaryAtom] = pickAtoms(atoms, 1, usedIds)
    if (!primaryAtom) break
    usedIds.add(primaryAtom.id)

    // Pick format — use specified or rotate through formats
    const scriptFormat = format || SCRIPT_FORMATS[i % SCRIPT_FORMATS.length]

    // Pick a complementary tax data atom (if primary is an article)
    const extraData = primaryAtom.type === 'article'
      ? pickAtoms(taxAtoms, 1, usedIds)[0]
      : undefined

    const userPrompt = buildUserPrompt(scriptFormat, primaryAtom, recentTopics, extraData)

    if (dryRun) {
      console.log(`\n--- Script ${i + 1}/${count} (DRY RUN) ---`)
      console.log(`Format: ${scriptFormat}`)
      console.log(`Atom: ${primaryAtom.title}`)
      if (extraData) console.log(`Extra: ${extraData.title}`)
      console.log(`\nUser prompt:\n${userPrompt}`)
      console.log('---')
      continue
    }

    // Call LLM
    console.log(`\nGenerating script ${i + 1}/${count}: [${scriptFormat}] ${primaryAtom.title}`)

    let parsed: ScriptLLMOutput
    try {
      const raw = await callLLM(SYSTEM_PROMPT, userPrompt)
      parsed = parseLLMResponse(raw)
    } catch (err) {
      // Retry once on parse failure
      console.log(`  Parse error, retrying...`)
      try {
        const raw = await callLLM(SYSTEM_PROMPT, userPrompt)
        parsed = parseLLMResponse(raw)
      } catch (retryErr) {
        console.error(`  Failed after retry: ${retryErr}`)
        continue
      }
    }

    const scriptId = generateScriptId(scriptFormat, primaryAtom)
    const fullText = [parsed.hook, ...parsed.body, parsed.cta].join('\n\n')

    const script: GeneratedScript = {
      id: scriptId,
      format: scriptFormat,
      persona: parsed.persona,
      hook: parsed.hook,
      body: parsed.body,
      cta: parsed.cta,
      caption: parsed.caption,
      fullText,
      estimatedSeconds: parsed.estimatedSeconds,
      sourceAtoms: [primaryAtom.id, ...(extraData ? [extraData.id] : [])],
      metadata: {
        model: config.openrouter.model,
        generatedAt: new Date().toISOString(),
      },
    }

    scripts.push(script)
    console.log(`  Generated: "${parsed.hook.substring(0, 60)}..."`)
    console.log(`  Duration: ~${parsed.estimatedSeconds}s`)

    // Track topic to avoid repetition
    recentTopics.push(primaryAtom.title)
  }

  if (dryRun) {
    console.log(`\n(Dry run — no LLM calls made)`)
  }

  return scripts
}

// ============================================
// CLI
// ============================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2)

  const getArg = (name: string): string | undefined => {
    const arg = args.find(a => a.startsWith(`--${name}=`))
    return arg?.split('=')[1]
  }

  const count = parseInt(getArg('count') || '5', 10)
  const format = getArg('format') as ScriptFormat | undefined
  const category = getArg('category')
  const dryRun = args.includes('--dry-run')

  if (format && !SCRIPT_FORMATS.includes(format)) {
    console.error(`Invalid format: ${format}. Valid: ${SCRIPT_FORMATS.join(', ')}`)
    process.exit(1)
  }

  const scripts = await generateScripts({ count, format, category, dryRun })

  if (!dryRun && scripts.length > 0) {
    console.log(`\n=== Generated ${scripts.length} scripts ===\n`)
    for (const s of scripts) {
      console.log(`[${s.format}] ${s.id}`)
      console.log(`  Hook: ${s.hook}`)
      console.log(`  Duration: ~${s.estimatedSeconds}s`)
      console.log()
    }
  }
}
