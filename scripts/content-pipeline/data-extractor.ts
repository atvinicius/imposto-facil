/**
 * Data Extractor — MDX articles + tax data → content atoms for LLM
 *
 * Reads src/content/ MDX files via gray-matter and produces structured
 * ContentAtom objects. Also provides curated tax data snippets hardcoded
 * from tax-data.ts (avoids path alias issues when run from scripts/).
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { ContentAtom, ContentCategory, ScriptFormat } from './types.js'

// ============================================
// MDX Article Extraction
// ============================================

const CONTENT_DIR = path.resolve(process.cwd(), '../../src/content')

const CATEGORIES: ContentCategory[] = [
  'ibs', 'cbs', 'is', 'transicao', 'glossario', 'setores', 'regimes', 'faq',
]

/** Suggest which viral formats suit a given article based on its metadata */
function suggestFormats(
  category: ContentCategory,
  tags: string[],
  commonQuestions: string[],
): ScriptFormat[] {
  const formats: ScriptFormat[] = []

  // Sector articles work great for "if-you-are" targeting
  if (category === 'setores') formats.push('if-you-are', 'stat-shock')
  // FAQ articles are natural myth-busters
  if (category === 'faq') formats.push('myth-buster', 'hot-take')
  // Transition/timeline content fits countdown format
  if (category === 'transicao') formats.push('countdown', 'stat-shock')
  // Regime comparisons invite hot takes
  if (category === 'regimes') formats.push('hot-take', 'storytelling')
  // Glossary can be myth-busting ("you think X means Y but...")
  if (category === 'glossario') formats.push('myth-buster')
  // Tax types (IBS, CBS, IS) fit educational storytelling
  if (['ibs', 'cbs', 'is'].includes(category)) formats.push('storytelling', 'myth-buster')

  // Tags can add more formats
  if (tags.some(t => /mei|simples|micro/i.test(t))) formats.push('if-you-are')
  if (tags.some(t => /split.?payment|retencao/i.test(t))) formats.push('stat-shock', 'hot-take')
  if (commonQuestions.length > 0) formats.push('myth-buster')

  // Deduplicate
  return [...new Set(formats)]
}

/** Extract first ~3 paragraphs from MDX content (strip markdown syntax) */
function extractSummaryFromContent(content: string): string {
  const lines = content
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)
    // Skip headings, imports, JSX components
    .filter(l => !l.startsWith('#') && !l.startsWith('import ') && !l.startsWith('<'))
    // Strip bold/italic/links
    .map(l => l.replace(/\*\*([^*]+)\*\*/g, '$1'))
    .map(l => l.replace(/\*([^*]+)\*/g, '$1'))
    .map(l => l.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'))

  return lines.slice(0, 5).join(' ').substring(0, 500)
}

/** Read all MDX articles and convert to ContentAtoms */
export function extractArticleAtoms(): ContentAtom[] {
  const atoms: ContentAtom[] = []

  for (const category of CATEGORIES) {
    const categoryPath = path.join(CONTENT_DIR, category)
    if (!fs.existsSync(categoryPath)) continue

    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.mdx'))

    for (const file of files) {
      const filePath = path.join(categoryPath, file)
      const raw = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(raw)
      const slug = file.replace(/\.mdx$/, '')

      const title = data.title || slug
      const description = data.description || ''
      const tags: string[] = data.tags || []
      const commonQuestions: string[] = data.commonQuestions || []
      const searchKeywords: string[] = data.searchKeywords || []

      const summary = description || extractSummaryFromContent(content)

      const keyFacts: string[] = []
      if (description) keyFacts.push(description)
      if (commonQuestions.length > 0) {
        keyFacts.push(`Perguntas comuns: ${commonQuestions.slice(0, 3).join('; ')}`)
      }

      atoms.push({
        id: `article:${category}/${slug}`,
        type: 'article',
        title,
        summary,
        keyFacts,
        category,
        tags: [...tags, ...searchKeywords],
        suggestedFormats: suggestFormats(category, tags, commonQuestions),
        commonQuestions,
      })
    }
  }

  return atoms
}

// ============================================
// Curated Tax Data Snippets
// (hardcoded to avoid TypeScript path alias issues)
// ============================================

interface TaxDataSnippet {
  topic: string
  data: string
  suggestedFormats: ScriptFormat[]
}

/** Curated tax data snippets from tax-data.ts for LLM context */
export function getTaxDataSnippets(): TaxDataSnippet[] {
  return [
    // Sector rate changes (before → after)
    {
      topic: 'Impacto por setor — mudanca de aliquota',
      data: [
        'Servicos: PIS/Cofins 3.65% cumulativo → IBS+CBS ~26.5% (maior impacto)',
        'Comercio (Simples): 4-11.5% → 24-28%',
        'Industria (Simples): 4.5-12% → 22-27%',
        'Agronegocio: reducao de 60% — aliquota ~10-18%',
        'Saude e Educacao: reducao de 60% — aliquota ~10-15%',
        'Tecnologia/SaaS: aliquota padrao ~25-28%, exportacao continua com aliquota zero',
        'Construcao: 22-27% com creditos sobre materiais',
        'Financeiro: regime especifico, 20-26%',
      ].join('\n'),
      suggestedFormats: ['stat-shock', 'if-you-are', 'hot-take'],
    },

    // Formalization pressure / hidden cost
    {
      topic: 'Custo oculto — pressao de formalizacao',
      data: [
        'Hoje empresas nao pagam 100% do imposto devido. Fator de efetividade:',
        'Comercio (Simples): paga ~65% do que deve (gap de 35%)',
        'Servicos (Simples): paga ~72% do que deve',
        'Industria (Simples): paga ~85% do que deve',
        'Construcao (LP): paga ~60% do que deve (maior gap)',
        'Com split payment (2027+), cobranca automatica = paga 100%',
        'Impacto real = mudanca de aliquota + fechamento do gap de formalizacao',
        'Para muitos, o custo oculto (formalizacao) e MAIOR que a mudanca de aliquota',
      ].join('\n'),
      suggestedFormats: ['hot-take', 'stat-shock', 'myth-buster'],
    },

    // Timeline milestones
    {
      topic: 'Cronograma da reforma — datas-chave',
      data: [
        '2026: Ano de teste — aliquotas aparecem na NF mas nao sao cobradas',
        '2027: CBS em vigor, PIS/Cofins extinto, SPLIT PAYMENT comeca',
        '2029: Inicio da extincao gradual do ICMS e ISS',
        '2033: Sistema novo 100% implementado, ICMS e ISS extintos',
        'Transicao de 8 ANOS (2026-2033)',
      ].join('\n'),
      suggestedFormats: ['countdown', 'stat-shock'],
    },

    // State ICMS extremes
    {
      topic: 'ICMS por estado — quem ganha e quem perde',
      data: [
        'Maior aliquota: Maranhao (MA) 23% — maior custo atual',
        'Rio de Janeiro (RJ) 22% — inclui 2% FECP',
        'Piaui (PI) 21%',
        'Bahia (BA) e Pernambuco (PE) 20.5%',
        'Menor aliquota: ES, MS, MT, RS, SC — 17%',
        'Sao Paulo (SP) 18%, Minas Gerais (MG) 18%',
        'Media nacional ponderada pelo PIB: 19%',
        'Com a reforma, ICMS e extinto — estados com aliquota alta se beneficiam mais',
        'Estados com incentivos fiscais (AM, BA, GO, CE, PE, SC, ES, MG) perdem beneficios',
      ].join('\n'),
      suggestedFormats: ['if-you-are', 'stat-shock', 'countdown'],
    },

    // Split payment explained
    {
      topic: 'Split payment — retencao automatica',
      data: [
        'A partir de 2027, o imposto e retido AUTOMATICAMENTE no momento do pagamento',
        'O dinheiro da venda nao cai inteiro na conta — parte vai direto pro governo',
        'Funciona no Pix, cartao, boleto, transferencia',
        'Exemplo: venda de R$100 com 26.5% de IBS+CBS = R$73.50 cai na conta',
        'Impacto no fluxo de caixa: precisa de mais capital de giro',
        'Para cada R$10 mil retido, empresa precisa de capital adicional',
        'NAO TEM COMO SONEGAR — o imposto e descontado antes de chegar na empresa',
      ].join('\n'),
      suggestedFormats: ['hot-take', 'stat-shock', 'storytelling'],
    },

    // MEI specific
    {
      topic: 'MEI e a reforma — o que muda',
      data: [
        'MEI continua no Simples Nacional — nao muda o regime',
        'Mas: limite de R$81 mil/ano pode ser revisado',
        'Risco: se faturar acima do limite, cai no regime normal com aliquota cheia',
        'MEI que mistura CPF e CNPJ corre risco com fiscalizacao digital',
        'Nanoempreendedor (novo conceito): faturamento ate R$40.5 mil — isento de IBS/CBS',
        'Pix e rastreado pela Receita Federal — movimentacoes acima de R$5 mil/mes reportadas',
      ].join('\n'),
      suggestedFormats: ['if-you-are', 'hot-take', 'myth-buster'],
    },

    // Common mistakes
    {
      topic: 'Erros comuns de empresarios na reforma',
      data: [
        'Erro 1: Achar que Simples Nacional protege de tudo — nao protege do split payment',
        'Erro 2: Nao revisar contratos — precos antigos nao consideram nova carga',
        'Erro 3: Ignorar o credito tributario — Lucro Real com creditos pode ser melhor que LP',
        'Erro 4: Nao separar CPF de CNPJ (MEI) — fiscalizacao digital vai pegar',
        'Erro 5: Esperar 2027 pra se preparar — quem comeca em 2026 sai na frente',
        'Erro 6: Confiar que o contador ja resolveu — maioria dos contadores de MEI/ME nao ta atualizado',
      ].join('\n'),
      suggestedFormats: ['countdown', 'myth-buster', 'storytelling'],
    },

    // Faturamento brackets
    {
      topic: 'Impacto por porte — quem sofre mais',
      data: [
        'MEI (ate R$81k): impacto menor em valor absoluto, maior em % da renda do dono',
        'ME (R$81k-360k): transicao de regime pode ser necessaria',
        'EPP (R$360k-4.8M): maior numero de empresas afetadas',
        'Medio (R$4.8M-78M): precisa de planejamento tributario profissional',
        'Grande (acima R$78M): ja tem equipe fiscal, adapta mais rapido',
        'Faturamento medio EPP: ~R$1.5 milhao/ano',
        'A maioria das empresas brasileiras e MEI ou ME — sao as mais vulneraveis',
      ].join('\n'),
      suggestedFormats: ['if-you-are', 'stat-shock'],
    },
  ]
}

/** Convert tax data snippets to ContentAtom format */
export function extractTaxDataAtoms(): ContentAtom[] {
  return getTaxDataSnippets().map((snippet, i) => ({
    id: `tax-data:${i}-${snippet.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    type: 'tax-data' as const,
    title: snippet.topic,
    summary: snippet.data.split('\n').slice(0, 2).join(' '),
    keyFacts: snippet.data.split('\n').filter(l => l.trim()),
    category: 'dados' as const,
    tags: [],
    suggestedFormats: snippet.suggestedFormats,
  }))
}

// ============================================
// Combined extraction
// ============================================

/** Extract all content atoms (articles + tax data) */
export function extractAllAtoms(): ContentAtom[] {
  const articleAtoms = extractArticleAtoms()
  const taxAtoms = extractTaxDataAtoms()
  return [...articleAtoms, ...taxAtoms]
}

/** Pick atoms suitable for a specific format */
export function filterAtomsByFormat(atoms: ContentAtom[], format: ScriptFormat): ContentAtom[] {
  return atoms.filter(a => a.suggestedFormats.includes(format))
}

/** Pick atoms from a specific category */
export function filterAtomsByCategory(atoms: ContentAtom[], category: string): ContentAtom[] {
  return atoms.filter(a => a.category === category)
}

/** Pick a random subset avoiding recently used atom IDs */
export function pickAtoms(
  atoms: ContentAtom[],
  count: number,
  usedIds: Set<string> = new Set(),
): ContentAtom[] {
  // Prefer unused atoms
  const unused = atoms.filter(a => !usedIds.has(a.id))
  const pool = unused.length >= count ? unused : atoms

  // Shuffle and pick
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// ============================================
// CLI: standalone test
// ============================================

if (import.meta.url === `file://${process.argv[1]}`) {
  const atoms = extractAllAtoms()
  console.log(`\nExtracted ${atoms.length} content atoms:`)
  console.log(`  Articles: ${atoms.filter(a => a.type === 'article').length}`)
  console.log(`  Tax data: ${atoms.filter(a => a.type === 'tax-data').length}`)
  console.log()

  for (const atom of atoms.slice(0, 5)) {
    console.log(`  [${atom.type}] ${atom.title}`)
    console.log(`    Formats: ${atom.suggestedFormats.join(', ')}`)
    console.log(`    Facts: ${atom.keyFacts.length}`)
    console.log()
  }
}
