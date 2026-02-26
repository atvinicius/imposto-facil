import type {
  SimuladorInput,
  SimuladorResult,
  SimuladorTeaser,
  RegimeTributario,
  Setor,
} from "./types"

import {
  FATURAMENTO_MEDIO,
  CARGA_ATUAL,
  CARGA_NOVA,
  AJUSTE_REGIME,
  FATOR_EFETIVIDADE,
  TRANSICAO_TIMELINE,
  UF_INCENTIVOS_FISCAIS,
  ICMS_ALIQUOTA_MODAL,
  ICMS_REFERENCIA_NACIONAL,
  MARGEM_BRUTA_ESTIMADA,
  SETORES_ICMS,
  collectSources,
  collectLimitacoes,
  determineConfidence,
} from "./tax-data"

/**
 * Resolve payroll ratio from the various places it can live on the input.
 * Priority: top-level fatorR > enhanced.fatorR > inferred from tipoCusto.
 */
function resolvePayroll(input: SimuladorInput): number | undefined {
  if (input.fatorR !== undefined) return input.fatorR
  if (input.enhanced?.fatorR !== undefined) return input.enhanced.fatorR
  const custo = input.tipoCusto ?? input.enhanced?.tipoCusto
  if (custo) {
    return custo === "folha" ? 70 : custo === "servicos" ? 40 : custo === "materiais" ? 15 : 35
  }
  return undefined
}

/**
 * Resolve B2B percentage from top-level or enhanced fields.
 */
function resolveB2B(input: SimuladorInput): number | undefined {
  if (input.pctB2B !== undefined) return input.pctB2B
  if (input.enhanced?.pctB2B !== undefined) return input.enhanced.pctB2B
  if (input.perfilClientes === "b2b") return 85
  if (input.perfilClientes === "b2c") return 15
  if (input.perfilClientes === "misto") return 50
  return undefined
}

/**
 * Compute a dynamic regime adjustment factor using profile data.
 * Falls back to the static AJUSTE_REGIME when data is unavailable.
 */
function computeAjuste(input: SimuladorInput): number {
  const base = AJUSTE_REGIME[input.regime].value
  const payroll = resolvePayroll(input)
  if (payroll === undefined) return base

  // Under IBS/CBS, credits come from everything EXCEPT payroll.
  const creditPotential = 1 - (payroll / 100)

  if (input.regime === "lucro_presumido") {
    return 0.6 + (0.5 * (1 - creditPotential))
  }
  if (input.regime === "lucro_real") {
    return 0.55 + (0.35 * (1 - creditPotential))
  }
  // Simples impact is mostly indirect (B2B competitiveness)
  return base
}

/**
 * Calculate state-specific ICMS adjustment to CARGA_ATUAL.
 * Only applies to goods-based sectors on non-Simples regimes.
 * Returns null when adjustment doesn't apply.
 */
function calcularAjusteIcmsUf(input: SimuladorInput): SimuladorResult["ajusteIcmsUf"] | null {
  // Guard: Simples DAS rates are nationally uniform
  if (input.regime === "simples") return null

  // Guard: only goods-based sectors pay ICMS
  if (!SETORES_ICMS.has(input.setor)) return null

  // Guard: need a known UF
  if (!input.uf || !ICMS_ALIQUOTA_MODAL[input.uf]) return null

  // Guard: need sector margin data
  const margemData = MARGEM_BRUTA_ESTIMADA[input.setor]
  if (!margemData) return null

  const ufRate = ICMS_ALIQUOTA_MODAL[input.uf].value
  const refRate = ICMS_REFERENCIA_NACIONAL.value
  const margin = margemData.value

  // Adjustment in percentage points of revenue
  // ICMS burden on revenue ≈ nominal_rate × gross_margin
  // Difference = (ufRate - refRate) × margin
  const ajustePp = Math.round(((ufRate - refRate) * margin) * 100) / 100

  const direcao: "favoravel" | "desfavoravel" | "neutro" =
    ajustePp > 0.1 ? "desfavoravel" :
    ajustePp < -0.1 ? "favoravel" :
    "neutro"

  return {
    ufAliquota: ufRate,
    referenciaAliquota: refRate,
    margemEstimada: margin,
    ajustePp,
    direcao,
    fonteUf: ICMS_ALIQUOTA_MODAL[input.uf].source,
  }
}

interface ImpactoResult {
  diferencaMin: number
  diferencaMax: number
  percentualMedio: number
  faturamentoBase: number
  icmsAjuste: SimuladorResult["ajusteIcmsUf"] | null
  efetividade: {
    fator: number
    cargaEfetivaPct: number        // what they likely pay today (%)
    cargaLegalPct: number          // what the law says they should pay (%)
    impactoAliquota: number        // R$/year impact from rate changes alone
    impactoFormalizacao: number    // R$/year impact from formalization pressure
    impactoTotal: number           // combined R$/year
    pressao: "baixa" | "moderada" | "alta" | "muito_alta"
  }
}

function calcularImpacto(input: SimuladorInput): ImpactoResult {
  // Use exact revenue when provided, fall back to bracket midpoint
  const faturamento = input.faturamentoExato ?? FATURAMENTO_MEDIO[input.faturamento].value
  const cargaLegalBase = CARGA_ATUAL[input.regime][input.setor].value
  const cargaNova = CARGA_NOVA[input.setor].value
  const ajuste = computeAjuste(input)
  const efetividade = FATOR_EFETIVIDADE[input.regime][input.setor].value

  // State-specific ICMS adjustment
  const icmsAjuste = calcularAjusteIcmsUf(input)
  const icmsAdj = icmsAjuste?.ajustePp ?? 0

  // Adjusted current legal burden (national avg + state ICMS delta)
  const cargaLegal = {
    min: cargaLegalBase.min + icmsAdj,
    max: cargaLegalBase.max + icmsAdj,
  }

  // Effectiveness factor for this business
  const fatorEf = efetividade.medio

  // Statutory current burden (what the law requires)
  const impostoLegalMin = faturamento * (cargaLegal.min / 100)
  const impostoLegalMax = faturamento * (cargaLegal.max / 100)
  const impostoLegalMedio = (impostoLegalMin + impostoLegalMax) / 2

  // Effective current burden (what they likely pay)
  const impostoEfetivoMedio = impostoLegalMedio * fatorEf

  // New burden (reform enforces full compliance via split payment)
  const impostoNovoMin = faturamento * (cargaNova.min / 100) * ajuste
  const impostoNovoMax = faturamento * (cargaNova.max / 100) * ajuste
  const impostoNovoMedio = (impostoNovoMin + impostoNovoMax) / 2

  // Total impact: (new burden) - (effective current burden)
  // This captures both rate changes AND formalization pressure
  const diferencaMin = impostoNovoMin - (impostoLegalMax * fatorEf) // Best case
  const diferencaMax = impostoNovoMax - (impostoLegalMin * fatorEf) // Worst case

  // Percentual based on effective burden (more meaningful to the user)
  const percentualMedio = impostoEfetivoMedio > 0
    ? ((impostoNovoMedio - impostoEfetivoMedio) / impostoEfetivoMedio) * 100
    : 0

  // Decompose: rate change vs formalization
  // Rate change = what they'd pay under new rates IF they were already fully compliant
  const impactoAliquota = Math.round(impostoNovoMedio - impostoLegalMedio)
  // Formalization = the gap between what they actually pay and what the law requires
  const impactoFormalizacao = Math.round(impostoLegalMedio - impostoEfetivoMedio)
  const impactoTotal = Math.round(impostoNovoMedio - impostoEfetivoMedio)

  // Formalization pressure classification based on the gap
  const gapPct = 1 - fatorEf
  const pressao: ImpactoResult["efetividade"]["pressao"] =
    gapPct > 0.30 ? "muito_alta" :
    gapPct > 0.20 ? "alta" :
    gapPct > 0.10 ? "moderada" :
    "baixa"

  const cargaLegalMediaPct = (cargaLegal.min + cargaLegal.max) / 2

  return {
    diferencaMin: Math.round(diferencaMin),
    diferencaMax: Math.round(diferencaMax),
    percentualMedio: Math.round(percentualMedio),
    faturamentoBase: faturamento,
    icmsAjuste,
    efetividade: {
      fator: fatorEf,
      cargaEfetivaPct: Math.round(cargaLegalMediaPct * fatorEf * 10) / 10,
      cargaLegalPct: Math.round(cargaLegalMediaPct * 10) / 10,
      impactoAliquota,
      impactoFormalizacao,
      impactoTotal,
      pressao,
    },
  }
}

/**
 * Calculate the cash flow impact of automatic tax retention (split payment).
 * Today: full payment arrives → business pays tax ~40 days later.
 * After 2027: tax is retained at point of sale → business receives net amount.
 * The difference = working capital the business no longer has access to.
 */
function calcularImpactoFluxoCaixa(
  faturamento: number,
  cargaNovaPct: number,
  ajuste: number,
): SimuladorResult["impactoFluxoCaixa"] {
  // Effective new tax rate applied to revenue
  const taxRatePct = cargaNovaPct * ajuste

  // Monthly tax retained automatically at point of sale
  const retencaoMensal = Math.round((faturamento * taxRatePct / 100) / 12)

  // Per R$10,000 in sales — concrete, intuitive example
  const porCadaDezMil = Math.round(10000 * taxRatePct / 100)

  // Working capital that used to be available for ~40 days between
  // receiving payment and paying tax. Split payment eliminates this buffer.
  // Annual float = annual tax × (40 days / 365 days)
  const annualTax = faturamento * taxRatePct / 100
  const capitalGiroAdicional = Math.round(annualTax * 40 / 365)

  return { retencaoMensal, porCadaDezMil, capitalGiroAdicional }
}

function determinarNivelRisco(
  percentualMudanca: number,
  setor: Setor,
  regime: RegimeTributario
): SimuladorResult["nivelRisco"] {
  // Serviços em lucro presumido = crítico
  if (setor === "servicos" && regime === "lucro_presumido" && percentualMudanca > 50) {
    return "critico"
  }

  if (percentualMudanca > 100) return "critico"
  if (percentualMudanca > 50) return "alto"
  if (percentualMudanca > 20) return "medio"
  return "baixo"
}

/**
 * Calculates a 0–100 confidence score based on how many profile fields are filled.
 * More data → more accurate simulation → higher confidence shown to user.
 */
function calcularConfiancaPerfil(input: SimuladorInput): number {
  let score = 0

  // Base fields (always collected)
  if (input.regime !== "nao_sei") score += 20
  if (input.setor !== "outro") score += 15
  score += 15 // faturamento bracket is always present
  if (input.uf) score += 10

  // Exact revenue is more precise than bracket
  if (input.faturamentoExato) score += 5

  // Top-level fields (collected in expanded simulator)
  if (resolvePayroll(input) !== undefined) score += 15
  if (resolveB2B(input) !== undefined) score += 10
  if (input.tipoCusto ?? input.enhanced?.tipoCusto) score += 10

  // ICMS incentive and export fields (top-level or legacy enhanced)
  const temICMS = input.temIncentivoICMS ?? input.enhanced?.temIncentivoICMS
  if (temICMS && temICMS !== "nao_sei") score += 3

  const exporta = input.exportaServicos ?? input.enhanced?.exportaServicos
  if (exporta !== undefined) score += 2

  // Extra enhanced fields
  const e = input.enhanced
  if (e) {
    if (e.pctInterestadual !== undefined) score += 5
    if (e.numFuncionarios) score += 2
  }

  // Bonus when UF data enables state-specific ICMS adjustment
  if (input.uf && ICMS_ALIQUOTA_MODAL[input.uf] && SETORES_ICMS.has(input.setor) && input.regime !== "simples") {
    score += 3
  }

  return Math.min(score, 100)
}

function gerarAlertas(
  input: SimuladorInput,
  percentual: number,
  pressao: ImpactoResult["efetividade"]["pressao"] = "baixa",
  icmsAjuste: SimuladorResult["ajusteIcmsUf"] | null = null,
): string[] {
  const alertas: string[] = []
  const payroll = resolvePayroll(input)
  const b2b = resolveB2B(input)

  // Formalization pressure alerts (shown first — most relevant new insight)
  if (pressao === "muito_alta") {
    alertas.push(
      "🔴 No seu setor, a diferença entre o que se paga e o que a lei exige é uma das maiores. " +
      "A reforma vai cobrar o valor integral automaticamente a partir de 2027 — prepare seu caixa"
    )
  } else if (pressao === "alta") {
    alertas.push(
      "⚠️ No seu setor, há uma diferença relevante entre a carga tributária cobrada e a efetivamente paga. " +
      "Com a reforma, essa diferença tende a zero"
    )
  }

  // Alertas por setor
  if (input.setor === "servicos" && input.regime === "lucro_presumido") {
    alertas.push("⚠️ Setor de serviços em Lucro Presumido: você está no grupo de maior impacto negativo")
  }

  if (input.setor === "agronegocio") {
    alertas.push("🌾 Verifique seus créditos de ICMS acumulados antes que o imposto seja extinto")
  }

  // Alertas por regime
  if (input.regime === "simples") {
    alertas.push("📋 Empresas do Simples podem perder competitividade em vendas B2B (clientes não aproveitam crédito)")
    if (b2b !== undefined && b2b > 50) {
      alertas.push(`🔴 ${b2b}% das suas vendas são B2B — seus clientes PJ não aproveitam crédito integral. Avalie o Simples Híbrido (opção semestral a partir de set/2026)`)
    }
  }

  if (input.regime === "lucro_presumido" && percentual > 30) {
    alertas.push("🔄 Considere avaliar migração para Lucro Real - pode gerar economia com a reforma")
  }

  // Payroll-heavy alert
  if (payroll !== undefined && payroll > 50) {
    alertas.push(`📊 Folha de pagamento representa ~${payroll}% da receita — folha não gera crédito de IBS/CBS, aumentando sua carga efetiva`)
  }

  // ICMS incentive confirmation (top-level or legacy enhanced)
  const temIncentivo = input.temIncentivoICMS ?? input.enhanced?.temIncentivoICMS
  if (temIncentivo === "sim" && input.uf) {
    alertas.push(`📍 Você confirmou ter incentivo de ICMS em ${input.uf} — esses benefícios serão extintos gradualmente até 2032. Planeje a transição`)
  }

  // Export services benefit (top-level or legacy enhanced)
  if (input.exportaServicos ?? input.enhanced?.exportaServicos) {
    alertas.push("🌍 Exportação de serviços mantém alíquota zero de IBS/CBS — oportunidade de expansão internacional")
  }

  // Interstate operations
  const pctInter = input.enhanced?.pctInterestadual
  if (pctInter !== undefined && pctInter > 30) {
    alertas.push(`🚚 ${pctInter}% de vendas interestaduais — a mudança para princípio do destino altera a distribuição de arrecadação entre estados`)
  }

  // State-specific ICMS quantitative alerts
  if (icmsAjuste && icmsAjuste.direcao === "desfavoravel") {
    alertas.push(
      `📍 ${input.uf} tem ICMS de ${icmsAjuste.ufAliquota}% (média nacional: ${icmsAjuste.referenciaAliquota}%). ` +
      `Isso encarece a carga atual em ~${Math.abs(icmsAjuste.ajustePp).toFixed(1)}pp sobre o faturamento`
    )
  } else if (icmsAjuste && icmsAjuste.direcao === "favoravel") {
    alertas.push(
      `📍 ${input.uf} tem ICMS de ${icmsAjuste.ufAliquota}% (abaixo da média de ${icmsAjuste.referenciaAliquota}%). ` +
      `Com a reforma, essa vantagem relativa pode desaparecer — o IBS terá alíquota uniforme por estado`
    )
  }

  // Alertas UF-aware: estados com grandes programas de incentivos fiscais
  if (input.uf && UF_INCENTIVOS_FISCAIS[input.uf]) {
    const ufInfo = UF_INCENTIVOS_FISCAIS[input.uf]
    alertas.push(`📍 ${input.uf}: ${ufInfo.value}`)
  }

  // Regularization alert for high-pressure sectors
  if (pressao === "muito_alta" || pressao === "alta") {
    alertas.push("📋 Verifique sua situação fiscal no e-CAC da Receita Federal — existem programas de regularização com condições facilitadas antes da reforma entrar em vigor")
  }

  // Pix/card monitoring — high formalization gap sectors
  if (pressao === "alta" || pressao === "muito_alta") {
    alertas.push(
      "📱 A Receita Federal já cruza dados de Pix e cartão com o faturamento declarado. " +
      "Com a reforma, o Comitê Gestor unificará dados de 27 estados e 5.570 municípios"
    )
  }

  // Contract revision — service sectors with material impact
  if ((input.setor === "servicos" || input.setor === "educacao" || input.setor === "saude") && percentual > 15) {
    alertas.push(
      "📝 Contratos de longo prazo sem cláusula de reajuste tributário podem gerar prejuízo. " +
      "Revise contratos ativos antes de 2027"
    )
  }

  // Construction sector specific
  if (input.setor === "construcao") {
    alertas.push(
      "🏗️ Construção civil: maior impacto de formalização entre todos os setores. " +
      "Mapeie a cadeia de subcontratados e formalize contratos de prestação de serviço"
    )
  }

  // Accounting cost — small businesses
  if (input.faturamento === "ate_81k" || input.faturamento === "81k_360k") {
    alertas.push(
      "📊 Espere aumento nos custos contábeis durante a transição (2026-2033). " +
      "Contadores passam de executores para consultores estratégicos"
    )
  }

  // Supplier cost pass-through — Simples/MEI
  if (input.regime === "simples") {
    alertas.push(
      "🔗 Mesmo protegido pelo Simples, seus fornecedores podem repassar aumentos de IBS/CBS nos preços. " +
      "Avalie o impacto indireto na sua estrutura de custos"
    )
  }

  // Alertas gerais de timing
  alertas.push("⏰ 2026 é o ano de teste - aproveite para adaptar seus sistemas sem penalidades severas")
  alertas.push("💳 A partir de 2027, o imposto será retido automaticamente nas transações eletrônicas — prepare seu fluxo de caixa")

  return alertas
}

function gerarDatasImportantes(
  input: SimuladorInput,
  fatorEfetividade: number = 1,
): SimuladorResult["datasImportantes"] {
  const datas: SimuladorResult["datasImportantes"] = [
    {
      data: "2026",
      descricao: "Ano de teste - CBS 0,9% e IBS 0,1% destacados em NF (sem recolhimento efetivo)",
      urgencia: "warning",
    },
    {
      data: "Janeiro 2027",
      descricao: "CBS entra em vigor + retenção automática de impostos nas transações eletrônicas + Extinção do PIS/Cofins",
      urgencia: "danger",
    },
    {
      data: "2029",
      descricao: "Início da extinção gradual do ICMS e ISS",
      urgencia: "info",
    },
    {
      data: "2033",
      descricao: "Sistema novo totalmente implementado",
      urgencia: "info",
    },
  ]

  // Formalization-specific dates for sectors with significant gap
  if (fatorEfetividade < 0.85) {
    datas.splice(1, 0, {
      data: "Até Jun 2026",
      descricao: "Última janela para regularizar pendências fiscais com condições facilitadas",
      urgencia: "warning",
    })
  }

  // Adicionar datas específicas por setor
  if (input.setor === "agronegocio") {
    datas.unshift({
      data: "2026-2027",
      descricao: "Prazo para recuperar créditos de ICMS acumulados",
      urgencia: "danger",
    })
  }

  return datas
}

function gerarAcoesRecomendadas(
  input: SimuladorInput,
  pressao: ImpactoResult["efetividade"]["pressao"] = "baixa",
): string[] {
  const acoes: string[] = []

  // Ações gerais (sempre mostrar 2 como teaser)
  acoes.push("Atualizar sistema de emissão de notas fiscais para novos campos (IBS, CBS)")
  acoes.push("Simular fluxo de caixa considerando a retenção automática de impostos a partir de 2027")

  // Formalization-related actions
  if (pressao !== "baixa") {
    acoes.push("Verificar situação fiscal no e-CAC e regularizar eventuais pendências antes da reforma")
    acoes.push("Avaliar impacto da formalização completa no fluxo de caixa da empresa")
  }

  // Ações específicas (gated)
  acoes.push("Revisar contratos de longo prazo para cláusulas de reajuste tributário")
  acoes.push("Mapear produtos e serviços com alíquotas diferenciadas")

  if (input.regime === "lucro_presumido") {
    acoes.push("Avaliar comparativo Lucro Presumido vs Lucro Real no novo sistema")
  }

  if (input.setor === "servicos") {
    acoes.push("Revisar estrutura de custos - folha de pagamento não gerará crédito")
    acoes.push("Considerar estratégias de precificação com nova carga tributária")
  }

  if (input.regime === "simples") {
    acoes.push("Avaliar impacto em vendas B2B - clientes podem preferir fornecedores fora do Simples")
  }

  // Pix/card consistency
  if (pressao !== "baixa") {
    acoes.push("Verificar consistência entre volume de Pix/cartão e faturamento declarado")
  }

  // Accounting cost planning — small businesses
  if (input.faturamento === "ate_81k" || input.faturamento === "81k_360k") {
    acoes.push("Planejar aumento de custos contábeis e de compliance durante a transição")
  }

  // Construction specific
  if (input.setor === "construcao") {
    acoes.push("Mapear cadeia de subcontratados e avaliar impacto da formalização nos custos de obra")
  }

  // Education specific
  if (input.setor === "educacao") {
    acoes.push("Verificar enquadramento na redução de 60% da alíquota para serviços educacionais")
  }

  return acoes
}

function gerarChecklistCompleto(
  input: SimuladorInput,
  pressao: ImpactoResult["efetividade"]["pressao"] = "baixa",
): string[] {
  const checklist: string[] = [
    "Atualizar sistema de emissão de NF-e para incluir campos IBS e CBS",
    "Cadastrar empresa no portal do IBS (quando disponível)",
    "Revisar todos os contratos de longo prazo para cláusulas de reajuste tributário",
    "Mapear produtos/serviços e identificar alíquotas diferenciadas aplicáveis",
    "Simular fluxo de caixa com retenção automática de impostos nas transações eletrônicas",
    "Treinar equipe fiscal nas novas obrigações acessórias",
    "Revisar precificação de produtos/serviços com nova carga tributária",
    "Configurar sistema contábil para apuração dual (período de transição)",
    "Verificar créditos tributários acumulados e planejar compensação",
    "Atualizar cadastro fiscal em todos os municípios de atuação",
    "Revisar enquadramento no Simples Nacional vs regime normal",
    "Preparar documentação para regime de transição (créditos presumidos)",
    "Avaliar impacto em operações interestaduais (destino vs origem)",
    "Revisar benefícios fiscais estaduais/municipais que serão extintos",
    "Criar cronograma interno de adequação com marcos trimestrais",
  ]

  // Formalization-specific items for sectors with significant gap
  if (pressao !== "baixa") {
    checklist.push("Consultar situação fiscal no e-CAC da Receita Federal e regularizar pendências")
    checklist.push("Avaliar programas de parcelamento PGFN (condições facilitadas até 2026)")
    checklist.push("Calcular impacto da formalização completa no capital de giro")
  }
  if (pressao === "muito_alta" || pressao === "alta") {
    checklist.push("Revisar processos internos de emissão de nota fiscal para garantir cobertura total")
    checklist.push("Planejar transição gradual para operação 100% formalizada antes de 2027")
  }

  if (input.setor === "servicos" || input.setor === "tecnologia") {
    checklist.push("Analisar impacto da não-cumulatividade limitada em serviços (sem crédito de folha)")
    checklist.push("Avaliar reestruturação societária para otimizar créditos")
  }

  if (input.setor === "comercio") {
    checklist.push("Revisar cadeia de fornecedores quanto à emissão de documentos com IBS/CBS")
    checklist.push("Preparar sistema de PDV para nova tributação")
  }

  if (input.setor === "industria") {
    checklist.push("Mapear toda cadeia de insumos para aproveitamento de créditos")
    checklist.push("Avaliar impacto em exportações (manutenção da desoneração)")
  }

  if (input.setor === "agronegocio") {
    checklist.push("Planejar recuperação de créditos de ICMS acumulados antes da extinção")
    checklist.push("Verificar enquadramento em regime diferenciado do agronegócio")
  }

  // Construction sector
  if (input.setor === "construcao") {
    checklist.push("Mapear toda a cadeia de subcontratados e formalizar contratos de prestação de serviço")
    checklist.push("Avaliar impacto da formalização de mão de obra nos custos de obra")
    checklist.push("Revisar contratos de empreitada com cláusula de reajuste tributário")
  }

  // Education sector
  if (input.setor === "educacao") {
    checklist.push("Verificar enquadramento na redução de 60% da alíquota (art. 259 LC 214/2025)")
    checklist.push("Revisar contratos de matrícula/mensalidade com cláusula de reajuste tributário")
  }

  // Pix/card consistency for all sectors with gap
  if (pressao !== "baixa") {
    checklist.push("Conciliar volume de transações Pix/cartão com faturamento declarado mensalmente")
  }

  // IS check (general)
  checklist.push("Verificar se algum produto/serviço está sujeito ao Imposto Seletivo (IS)")

  if (input.regime === "lucro_presumido") {
    checklist.push("Realizar simulação comparativa Lucro Presumido vs Lucro Real no novo sistema")
    checklist.push("Avaliar timing ideal para eventual migração de regime")
  }

  return checklist
}

function gerarProjecaoAnual(input: SimuladorInput, icmsAjustePp: number = 0): SimuladorResult["gatedContent"]["projecaoAnual"] {
  const faturamento = input.faturamentoExato ?? FATURAMENTO_MEDIO[input.faturamento].value
  const cargaLegalBase = CARGA_ATUAL[input.regime][input.setor].value
  const cargaLegalMedia = (cargaLegalBase.min + cargaLegalBase.max) / 2 + icmsAjustePp
  const efetividade = FATOR_EFETIVIDADE[input.regime][input.setor].value.medio

  // Baseline: what they effectively pay today
  const impostoEfetivoAtual = faturamento * (cargaLegalMedia / 100) * efetividade

  const ajuste = computeAjuste(input)
  const cargaNova = CARGA_NOVA[input.setor].value
  const cargaNovaMedia = ((cargaNova.min + cargaNova.max) / 2) * ajuste

  return TRANSICAO_TIMELINE.map(({ ano, ibsPct, cbsPct, descricao }) => {
    // During transition, blend old and new systems
    const proporcaoNovo = Math.min((ibsPct + cbsPct) / (17.7 + 8.8), 1)

    // Formalization ramps up with the transition:
    // 2026 (test year): effectiveness stays as-is
    // 2027+: enforcement begins, effectiveness trends toward 1.0
    const efetividadeAno = ano <= 2026
      ? efetividade
      : Math.min(1, efetividade + (1 - efetividade) * Math.min((ano - 2026) / 6, 1))

    // Current system portion uses ramping effectiveness (formalization pressure grows)
    const cargaAtualAjustada = cargaLegalMedia * efetividadeAno
    const cargaTransicao = cargaAtualAjustada * (1 - proporcaoNovo) + cargaNovaMedia * proporcaoNovo
    const impostoEstimado = faturamento * (cargaTransicao / 100)
    const diferenca = Math.round(impostoEstimado - impostoEfetivoAtual)

    return {
      ano,
      aliquotaIBS: ibsPct,
      aliquotaCBS: cbsPct,
      cargaEstimada: Math.round(impostoEstimado),
      diferencaVsAtual: diferenca,
      descricao,
    }
  })
}

function gerarAnaliseRegime(input: SimuladorInput): SimuladorResult["gatedContent"]["analiseRegime"] {
  if (input.regime === "simples") {
    return {
      regimeAtual: "Simples Nacional",
      regimeSugerido: null,
      economiaEstimada: null,
      justificativa: "O Simples Nacional mantém regime próprio na reforma. A principal preocupação é a perda de competitividade em vendas B2B, já que clientes não poderão aproveitar créditos de IBS/CBS nas compras do Simples.",
      fatores: [
        "Simples mantém regime diferenciado na reforma",
        "Clientes PJ não aproveitam créditos em compras do Simples",
        "Pode perder vendas B2B para concorrentes no regime normal",
        "Avalie se o faturamento justifica migração para regime normal",
      ],
    }
  }

  const faturamento = input.faturamentoExato ?? FATURAMENTO_MEDIO[input.faturamento].value
  const cargaPresumidoBase = CARGA_ATUAL.lucro_presumido[input.setor].value
  const cargaRealBase = CARGA_ATUAL.lucro_real[input.setor].value
  const cargaNova = CARGA_NOVA[input.setor].value

  // Apply ICMS state adjustment to regime comparison
  const icmsAdj = calcularAjusteIcmsUf(input)?.ajustePp ?? 0
  const cargaPresumido = { min: cargaPresumidoBase.min + icmsAdj, max: cargaPresumidoBase.max + icmsAdj }
  const cargaReal = { min: cargaRealBase.min + icmsAdj, max: cargaRealBase.max + icmsAdj }

  // Use dynamic adjustment based on payroll/cost structure
  const inputLP = { ...input, regime: "lucro_presumido" as RegimeTributario }
  const inputLR = { ...input, regime: "lucro_real" as RegimeTributario }
  const custoPresumidoNovo = faturamento * (((cargaNova.min + cargaNova.max) / 2) / 100) * computeAjuste(inputLP)
  const custoRealNovo = faturamento * (((cargaNova.min + cargaNova.max) / 2) / 100) * computeAjuste(inputLR)
  const economia = Math.round(custoPresumidoNovo - custoRealNovo)

  if (input.regime === "lucro_presumido") {
    const deveMigrar = economia > faturamento * 0.01 // >1% do faturamento
    return {
      regimeAtual: "Lucro Presumido",
      regimeSugerido: deveMigrar ? "Lucro Real" : null,
      economiaEstimada: deveMigrar ? economia : null,
      justificativa: deveMigrar
        ? `Com a reforma, o Lucro Real permite aproveitamento pleno de créditos de IBS/CBS. Para seu perfil, a economia estimada seria de R$ ${economia.toLocaleString("pt-BR")}/ano.`
        : "Para seu perfil, a diferença entre os regimes é pequena no novo sistema. Mantenha o Lucro Presumido pela simplicidade operacional.",
      fatores: [
        "Lucro Real permite crédito pleno de IBS e CBS",
        `Carga atual estimada: ${((cargaPresumido.min + cargaPresumido.max) / 2).toFixed(1)}%`,
        `Carga no Lucro Real: ${((cargaReal.min + cargaReal.max) / 2).toFixed(1)}%`,
        deveMigrar ? "Recomendação: avalie migração com seu contador" : "Recomendação: manter regime atual",
        "Lucro Real exige escrituração contábil completa",
      ],
    }
  }

  // lucro_real or nao_sei
  return {
    regimeAtual: input.regime === "lucro_real" ? "Lucro Real" : "Não informado",
    regimeSugerido: null,
    economiaEstimada: null,
    justificativa: input.regime === "lucro_real"
      ? "O Lucro Real é o regime que mais se beneficia da reforma por permitir aproveitamento pleno de créditos. Mantenha o foco em documentar bem todos os insumos para maximizar os créditos de IBS e CBS."
      : "Sem informação do regime atual, não é possível fazer uma comparação precisa. Recomendamos que consulte seu contador para identificar seu regime e simule novamente.",
    fatores: input.regime === "lucro_real"
      ? [
          "Lucro Real já é o regime mais vantajoso para créditos",
          "Foco deve ser em maximizar documentação de insumos",
          "Split payment automatiza parte da apuração",
          "Transição tende a ser mais suave neste regime",
        ]
      : [
          "Identifique seu regime tributário atual com seu contador",
          "Refaça a simulação com o regime correto para resultados precisos",
          "Cada regime tem impacto diferente na reforma",
        ],
  }
}

function gerarMetodologia(input: SimuladorInput, icmsAjuste: SimuladorResult["ajusteIcmsUf"] | null = null): SimuladorResult["metodologia"] {
  const fontes = collectSources(input.regime, input.setor, input.faturamento, input.uf)
  let limitacoes = collectLimitacoes(input.regime, input.setor, input.uf)
  const confianca = determineConfidence(input.regime, input.setor)

  // If exact revenue was provided, remove the "uses bracket averages" limitation
  if (input.faturamentoExato) {
    limitacoes = limitacoes.filter(l => !l.includes("faixa de faturamento") && !l.includes("ponto médio"))
  }

  const resumoPartes: string[] = [
    "Estimativa baseada em alíquotas da legislação vigente (LC 123/2006, Lei 10.637/2002, Lei 10.833/2003),",
    "projeções oficiais do Ministério da Fazenda para IBS+CBS (~26,5%),",
    "e dados públicos da Receita Federal sobre a carga efetiva por setor.",
  ]

  if (input.faturamentoExato) {
    resumoPartes.push(`Cálculo com faturamento exato de R$ ${input.faturamentoExato.toLocaleString("pt-BR")}/ano.`)
  }

  const cargaNova = CARGA_NOVA[input.setor]
  if (cargaNova.value.reducao) {
    resumoPartes.push(`Setor com alíquota reduzida conforme LC 214/2025.`)
  }

  if (resolvePayroll(input) !== undefined) {
    resumoPartes.push("Ajuste dinâmico aplicado com base na estrutura de custos e folha de pagamento.")
  }

  if (icmsAjuste && icmsAjuste.direcao !== "neutro") {
    const dir = icmsAjuste.direcao === "desfavoravel" ? "acima" : "abaixo"
    resumoPartes.push(
      `Ajuste estadual de ICMS aplicado: ${input.uf} (${icmsAjuste.ufAliquota}%) ${dir} da média nacional (${icmsAjuste.referenciaAliquota}%), ` +
      `resultando em ${icmsAjuste.ajustePp > 0 ? "+" : ""}${icmsAjuste.ajustePp.toFixed(1)}pp na carga atual.`
    )
  }

  return {
    resumo: resumoPartes.join(" "),
    confianca,
    fontes,
    limitacoes,
    ultimaAtualizacao: "2025-01-20",
  }
}

export function calcularSimulacao(input: SimuladorInput): SimuladorResult {
  const impacto = calcularImpacto(input)
  const nivelRisco = determinarNivelRisco(impacto.percentualMedio, input.setor, input.regime)
  const icmsAjustePp = impacto.icmsAjuste?.ajustePp ?? 0
  const cargaNova = CARGA_NOVA[input.setor].value
  const cargaNovaMedia = (cargaNova.min + cargaNova.max) / 2
  const ajusteVal = computeAjuste(input)

  return {
    impactoAnual: {
      min: impacto.diferencaMin,
      max: impacto.diferencaMax,
      percentual: impacto.percentualMedio,
    },
    nivelRisco,
    alertas: gerarAlertas(input, impacto.percentualMedio, impacto.efetividade.pressao, impacto.icmsAjuste),
    datasImportantes: gerarDatasImportantes(input, impacto.efetividade.fator),
    acoesRecomendadas: gerarAcoesRecomendadas(input, impacto.efetividade.pressao),
    metodologia: gerarMetodologia(input, impacto.icmsAjuste),
    confiancaPerfil: calcularConfiancaPerfil(input),
    efetividadeTributaria: {
      fatorEfetividade: impacto.efetividade.fator,
      cargaEfetivaAtualPct: impacto.efetividade.cargaEfetivaPct,
      cargaLegalAtualPct: impacto.efetividade.cargaLegalPct,
      impactoMudancaAliquota: impacto.efetividade.impactoAliquota,
      impactoFormalizacao: impacto.efetividade.impactoFormalizacao,
      impactoTotalEstimado: impacto.efetividade.impactoTotal,
      pressaoFormalizacao: impacto.efetividade.pressao,
    },
    impactoFluxoCaixa: calcularImpactoFluxoCaixa(impacto.faturamentoBase, cargaNovaMedia, ajusteVal),
    ajusteIcmsUf: impacto.icmsAjuste ?? undefined,
    gatedContent: {
      checklistCompleto: gerarChecklistCompleto(input, impacto.efetividade.pressao),
      analiseDetalhada: "Análise completa do impacto por linha de produto/serviço",
      comparativoRegimes: input.regime !== "simples",
      projecaoAnual: gerarProjecaoAnual(input, icmsAjustePp),
      analiseRegime: gerarAnaliseRegime(input),
    },
  }
}

export function gerarTeaser(result: SimuladorResult, _input: SimuladorInput): SimuladorTeaser { // eslint-disable-line @typescript-eslint/no-unused-vars
  const impactoTexto = result.impactoAnual.max > 0
    ? `Sua empresa pode pagar até R$ ${Math.abs(result.impactoAnual.max).toLocaleString("pt-BR")} a mais por ano`
    : `Sua empresa pode economizar até R$ ${Math.abs(result.impactoAnual.min).toLocaleString("pt-BR")} por ano`

  const alertaPrincipal = result.alertas[0] || "A reforma tributária vai impactar sua empresa"

  const ctaTextos: Record<SimuladorResult["nivelRisco"], string> = {
    critico: "Ver relatório de emergência →",
    alto: "Ver relatório completo →",
    medio: "Ver análise detalhada →",
    baixo: "Ver oportunidades →",
  }

  return {
    impactoResumo: impactoTexto,
    nivelRisco: result.nivelRisco,
    alertaPrincipal,
    ctaTexto: ctaTextos[result.nivelRisco],
  }
}

// Labels para exibição
export const NIVEL_RISCO_LABELS: Record<SimuladorResult["nivelRisco"], { label: string; color: string }> = {
  baixo: { label: "Baixo", color: "text-green-600 bg-green-100" },
  medio: { label: "Médio", color: "text-yellow-800 bg-yellow-100" },
  alto: { label: "Alto", color: "text-orange-600 bg-orange-100" },
  critico: { label: "Crítico", color: "text-red-600 bg-red-100" },
}
