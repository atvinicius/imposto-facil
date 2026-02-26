import type { SimuladorInput, SimuladorResult, Setor, RegimeTributario } from "./types"

export interface ErroComum {
  id: string
  titulo: string
  descricao: string
  severidade: "alta" | "media" | "baixa"
  artigoUrl: string | null
  perguntaSugerida: string
}

type ProfileContext = {
  setor: Setor
  regime: RegimeTributario
  faturamento: string
  uf: string
  pressao: SimuladorResult["efetividadeTributaria"]["pressaoFormalizacao"]
  pctB2B?: number
  fatorEfetividade: number
  impactoPercentual: number
  temIncentivo?: "sim" | "nao" | "nao_sei"
}

function buildContext(input: SimuladorInput, result: SimuladorResult): ProfileContext {
  return {
    setor: input.setor,
    regime: input.regime,
    faturamento: input.faturamento,
    uf: input.uf,
    pressao: result.efetividadeTributaria.pressaoFormalizacao,
    pctB2B: input.pctB2B ?? (input.perfilClientes === "b2b" ? 85 : input.perfilClientes === "b2c" ? 15 : input.perfilClientes === "misto" ? 50 : undefined),
    fatorEfetividade: result.efetividadeTributaria.fatorEfetividade,
    impactoPercentual: result.impactoAnual.percentual,
    temIncentivo: input.temIncentivoICMS ?? input.enhanced?.temIncentivoICMS,
  }
}

// All possible mistakes with their match conditions
const ERROS_CATALOG: Array<{
  id: string
  match: (ctx: ProfileContext) => boolean
  severity: (ctx: ProfileContext) => "alta" | "media" | "baixa"
  build: (ctx: ProfileContext) => Omit<ErroComum, "id" | "severidade">
}> = [
  // --- REGIME MISTAKES ---
  {
    id: "regime_errado_lp",
    match: (ctx) => ctx.regime === "lucro_presumido" && ctx.impactoPercentual > 30,
    severity: () => "alta",
    build: () => ({
      titulo: "Ficar no Lucro Presumido sem reavaliar",
      descricao:
        "Com a reforma, o Lucro Real permite aproveitamento pleno de créditos de IBS/CBS. " +
        "Para seu perfil, a diferença pode ser significativa. " +
        "A escolha de regime é anual — errar significa pagar mais o ano inteiro.",
      artigoUrl: "/conhecimento/regimes/lucro-real",
      perguntaSugerida: "Vale a pena migrar do Lucro Presumido para o Lucro Real com a reforma?",
    }),
  },
  {
    id: "simples_hibrido_ignorado",
    match: (ctx) => ctx.regime === "simples" && (ctx.pctB2B ?? 0) > 40,
    severity: (ctx) => (ctx.pctB2B ?? 0) > 60 ? "alta" : "media",
    build: (ctx) => ({
      titulo: "Ignorar a opção do Simples Híbrido",
      descricao:
        `${ctx.pctB2B}% das suas vendas são para outras empresas (B2B). ` +
        "No Simples convencional, seus clientes PJ não aproveitam crédito integral de IBS/CBS. " +
        "A opção híbrida (disponível a partir de 2027) resolve isso — mas exige mais controle contábil.",
      artigoUrl: "/conhecimento/faq/simples-hibrido-decisao",
      perguntaSugerida: "Como funciona o Simples Híbrido e quando vale a pena para minha empresa?",
    }),
  },
  {
    id: "regime_nao_sei",
    match: (ctx) => ctx.regime === "nao_sei",
    severity: () => "alta",
    build: () => ({
      titulo: "Não saber seu regime tributário",
      descricao:
        "Cada regime é afetado de forma diferente pela reforma. " +
        "Sem saber seu regime, é impossível planejar a transição. " +
        "Consulte seu contador ou verifique no cartão CNPJ da Receita Federal.",
      artigoUrl: "/conhecimento/regimes/simples-nacional",
      perguntaSugerida: "Como descubro meu regime tributário e por que isso importa na reforma?",
    }),
  },

  // --- PRICING/CONTRACT MISTAKES ---
  {
    id: "nao_reprecificar_servicos",
    match: (ctx) =>
      ["servicos", "tecnologia", "saude", "educacao"].includes(ctx.setor) &&
      ctx.impactoPercentual > 15,
    severity: (ctx) => ctx.impactoPercentual > 50 ? "alta" : "media",
    build: (ctx) => ({
      titulo: "Não reprecificar para a nova carga tributária",
      descricao:
        `O setor de ${ctx.setor} deve ter aumento de carga de até ${ctx.impactoPercentual}%. ` +
        "Sem ajuste de preços, a margem é consumida silenciosamente. " +
        "Contratos sem cláusula de reajuste tributário são os mais vulneráveis.",
      artigoUrl: "/conhecimento/faq/precificacao-reforma",
      perguntaSugerida: "Quanto preciso ajustar meus preços para compensar a reforma tributária?",
    }),
  },
  {
    id: "contratos_sem_clausula",
    match: (ctx) =>
      ["servicos", "educacao", "saude", "construcao", "tecnologia"].includes(ctx.setor) &&
      ctx.impactoPercentual > 10,
    severity: () => "media",
    build: (ctx) => ({
      titulo: "Contratos de longo prazo sem cláusula tributária",
      descricao:
        "Contratos de serviço, aluguel e fornecimento firmados antes da reforma " +
        "podem não ter previsão de reajuste por mudança tributária. " +
        `No setor de ${ctx.setor}, isso pode significar anos absorvendo o aumento.`,
      artigoUrl: "/conhecimento/faq/contratos-precificacao",
      perguntaSugerida: "Como revisar meus contratos para incluir cláusula de reajuste tributário?",
    }),
  },

  // --- CASH FLOW MISTAKES ---
  {
    id: "nao_planejar_fluxo_caixa",
    match: () => true, // universal — applies to everyone
    severity: (ctx) => ctx.faturamento === "ate_81k" ? "baixa" : ctx.faturamento === "81k_360k" ? "media" : "alta",
    build: () => ({
      titulo: "Não planejar o fluxo de caixa para a retenção automática",
      descricao:
        "A partir de 2027, o imposto é retido na hora da venda — antes de chegar na sua conta. " +
        "Hoje, esse dinheiro fica disponível por ~40 dias. " +
        "Sem planejamento, sua empresa pode ficar sem caixa para pagar fornecedores e folha.",
      artigoUrl: "/conhecimento/faq/fluxo-caixa-split-payment",
      perguntaSugerida: "Como planejar meu fluxo de caixa para a retenção automática de impostos em 2027?",
    }),
  },

  // --- MEI-SPECIFIC ---
  {
    id: "mei_cpf_cnpj",
    match: (ctx) => ctx.faturamento === "ate_81k",
    severity: () => "alta",
    build: () => ({
      titulo: "Misturar finanças pessoais e do negócio",
      descricao:
        "A Receita Federal cruza dados de Pix e cartão com o faturamento declarado do MEI. " +
        "Receber pagamentos do negócio na conta pessoal (CPF) pode gerar alerta fiscal. " +
        "Renda pessoal também conta no limite de R$81.000/ano do MEI.",
      artigoUrl: "/conhecimento/faq/mei-reforma",
      perguntaSugerida: "Como MEI, preciso separar minhas contas pessoais das do negócio?",
    }),
  },
  {
    id: "mei_nanoempreendedor",
    match: (ctx) => ctx.faturamento === "ate_81k",
    severity: () => "baixa",
    build: () => ({
      titulo: "Não saber sobre a categoria de nanoempreendedor",
      descricao:
        "A reforma cria o nanoempreendedor: quem fatura até R$40.500/ano é isento de IBS e CBS, " +
        "sem precisar se formalizar. Motoristas de app têm limite especial de R$162.000/ano. " +
        "Se você se enquadra, pode ter menos obrigações do que imagina.",
      artigoUrl: "/conhecimento/faq/mei-reforma",
      perguntaSugerida: "O que é o nanoempreendedor e como saber se me enquadro?",
    }),
  },

  // --- FORMALIZATION PRESSURE ---
  {
    id: "formalizacao_alta_pressao",
    match: (ctx) => ctx.pressao === "alta" || ctx.pressao === "muito_alta",
    severity: (ctx) => ctx.pressao === "muito_alta" ? "alta" : "media",
    build: (ctx) => ({
      titulo: "Subestimar o custo da cobrança mais rigorosa",
      descricao:
        `No setor de ${ctx.setor}, a diferença entre o que se paga e o que a lei exige é uma das maiores. ` +
        "Com a retenção automática a partir de 2027, essa diferença vai a zero. " +
        "O impacto da cobrança mais rigorosa pode ser maior que a própria mudança de alíquotas.",
      artigoUrl: "/conhecimento/faq/carga-efetiva-vs-legal",
      perguntaSugerida: "O que significa a cobrança mais rigorosa para meu setor e como me preparar?",
    }),
  },
  {
    id: "regularizacao_pendencias",
    match: (ctx) => ctx.pressao === "alta" || ctx.pressao === "muito_alta",
    severity: () => "media",
    build: () => ({
      titulo: "Não verificar pendências fiscais antes da reforma",
      descricao:
        "Antes de 2027, existem programas de parcelamento com condições facilitadas (PGFN). " +
        "Depois que a cobrança automática começar, regularizar fica mais difícil e caro. " +
        "Verifique sua situação no e-CAC da Receita Federal.",
      artigoUrl: "/conhecimento/faq/regularizacao-debitos",
      perguntaSugerida: "Como verificar se tenho pendências fiscais e quais programas de regularização existem?",
    }),
  },

  // --- STATE INCENTIVES ---
  {
    id: "incentivos_vao_acabar",
    match: (ctx) => ctx.temIncentivo === "sim",
    severity: () => "alta",
    build: (ctx) => ({
      titulo: "Planejar com base em incentivos fiscais que vão acabar",
      descricao:
        `Você confirmou ter incentivo fiscal em ${ctx.uf}. ` +
        "Esses benefícios são mantidos até 2028, mas começam a ser reduzidos em 2029 " +
        "e chegam a zero em 2033. Se seu negócio depende deles, é hora de diversificar.",
      artigoUrl: "/conhecimento/transicao/beneficios-fiscais",
      perguntaSugerida: "Quando exatamente meus incentivos fiscais vão acabar e como me preparar?",
    }),
  },

  // --- SECTOR-SPECIFIC ---
  {
    id: "construcao_subcontratados",
    match: (ctx) => ctx.setor === "construcao",
    severity: () => "alta",
    build: () => ({
      titulo: "Não formalizar a cadeia de subcontratados",
      descricao:
        "A construção civil tem a maior pressão de formalização entre todos os setores. " +
        "Subcontratados sem contrato formal não geram créditos de IBS/CBS. " +
        "Mapeie sua cadeia e formalize antes de 2027.",
      artigoUrl: "/conhecimento/setores/construcao",
      perguntaSugerida: "Como devo formalizar meus subcontratados para aproveitar créditos na reforma?",
    }),
  },
  {
    id: "agro_creditos_icms",
    match: (ctx) => ctx.setor === "agronegocio",
    severity: () => "alta",
    build: () => ({
      titulo: "Não recuperar créditos de ICMS acumulados",
      descricao:
        "O ICMS será extinto gradualmente até 2033. Créditos acumulados hoje " +
        "precisam ser recuperados ou compensados antes disso. " +
        "O prazo para planejar a recuperação é 2026-2027.",
      artigoUrl: "/conhecimento/faq/creditos-acumulados",
      perguntaSugerida: "Como recuperar meus créditos de ICMS acumulados antes que o imposto seja extinto?",
    }),
  },
  {
    id: "educacao_reducao_60",
    match: (ctx) => ctx.setor === "educacao",
    severity: () => "media",
    build: () => ({
      titulo: "Não verificar o enquadramento na redução de 60%",
      descricao:
        "Serviços educacionais têm direito a redução de 60% na alíquota de IBS/CBS " +
        "(LC 214/2025, art. 259). Mas é preciso verificar se sua atividade se enquadra " +
        "nos critérios — nem todo serviço educacional é elegível.",
      artigoUrl: "/conhecimento/setores/educacao",
      perguntaSugerida: "Minha empresa de educação tem direito à redução de 60% na alíquota?",
    }),
  },
  {
    id: "simples_b2b_competitividade",
    match: (ctx) => ctx.regime === "simples" && (ctx.pctB2B ?? 0) <= 40 && (ctx.pctB2B ?? 0) > 0,
    severity: () => "baixa",
    build: () => ({
      titulo: "Perda de competitividade em vendas B2B no Simples",
      descricao:
        "Mesmo com percentual menor de vendas B2B, seus clientes empresariais " +
        "podem começar a preferir fornecedores fora do Simples que geram créditos completos. " +
        "Monitore se esse perfil de cliente muda com a reforma.",
      artigoUrl: "/conhecimento/regimes/simples-nacional",
      perguntaSugerida: "Meus clientes PJ podem me trocar por fornecedores fora do Simples?",
    }),
  },
  {
    id: "contabilidade_mais_cara",
    match: (ctx) => ctx.faturamento === "ate_81k" || ctx.faturamento === "81k_360k",
    severity: () => "baixa",
    build: (ctx) => ({
      titulo: "Não prever aumento de custos contábeis",
      descricao:
        "Durante a transição (2026-2033), sua empresa vai operar com dois sistemas tributários " +
        "simultâneos. Isso aumenta a complexidade e o custo da contabilidade. " +
        `Para empresas do porte ${ctx.faturamento === "ate_81k" ? "MEI" : "ME"}, planejar esse custo é essencial.`,
      artigoUrl: "/conhecimento/faq/obrigacoes-acessorias-novas",
      perguntaSugerida: "Quanto meus custos contábeis devem aumentar durante a transição da reforma?",
    }),
  },
]

/**
 * Returns the top N most relevant common mistakes for the user's profile.
 * Sorted by severity (alta first), then by match specificity.
 */
export function getErrosComuns(
  input: SimuladorInput,
  result: SimuladorResult,
  maxItems: number = 5,
): ErroComum[] {
  const ctx = buildContext(input, result)

  const matched = ERROS_CATALOG
    .filter((e) => e.match(ctx))
    .map((e) => ({
      id: e.id,
      severidade: e.severity(ctx),
      ...e.build(ctx),
    }))

  // Sort: alta > media > baixa
  const severityOrder = { alta: 0, media: 1, baixa: 2 }
  matched.sort((a, b) => severityOrder[a.severidade] - severityOrder[b.severidade])

  return matched.slice(0, maxItems)
}

/**
 * Returns a short summary for the chat assistant's system prompt context.
 * Compact format for injection into the chat API.
 */
export function getErrosComunsParaChat(
  input: SimuladorInput,
  result: SimuladorResult,
): string {
  const erros = getErrosComuns(input, result, 4)
  if (erros.length === 0) return ""

  const lines = erros.map(
    (e, i) => `${i + 1}. [${e.severidade.toUpperCase()}] ${e.titulo}: ${e.descricao}`
  )

  return (
    `## Erros Comuns do Perfil deste Usuario\n` +
    `Baseado no setor (${input.setor}), regime (${input.regime}), e pressao de formalizacao (${result.efetividadeTributaria.pressaoFormalizacao}):\n` +
    lines.join("\n") +
    `\n\nQuando relevante, alerte proativamente o usuario sobre esses erros. Use linguagem nao-acusatoria ("empresas do setor costumam..." em vez de "voce esta errando").`
  )
}
