import type {
  SimuladorInput,
  SimuladorResult,
  SimuladorTeaser,
  RegimeTributario,
  Setor,
  FaixaFaturamento,
} from "./types"

// Faturamento médio estimado por faixa (ponto médio)
const FATURAMENTO_MEDIO: Record<FaixaFaturamento, number> = {
  "ate_81k": 60000,
  "81k_360k": 200000,
  "360k_4.8m": 1500000,
  "4.8m_78m": 20000000,
  "acima_78m": 150000000,
}

// Carga tributária ATUAL estimada por regime (% sobre faturamento)
// Simplificado para fins de simulação
const CARGA_ATUAL: Record<RegimeTributario, Record<Setor, { min: number; max: number }>> = {
  simples: {
    comercio: { min: 4, max: 11.5 },
    industria: { min: 4.5, max: 12 },
    servicos: { min: 6, max: 17.5 },
    agronegocio: { min: 4, max: 10 },
    tecnologia: { min: 6, max: 15.5 },
    saude: { min: 6, max: 15.5 },
    educacao: { min: 6, max: 15.5 },
    construcao: { min: 4.5, max: 12 },
    financeiro: { min: 6, max: 17.5 },
    outro: { min: 5, max: 14 },
  },
  lucro_presumido: {
    comercio: { min: 5.93, max: 8.5 },
    industria: { min: 5.93, max: 8.5 },
    servicos: { min: 8.65, max: 14.5 }, // ISS + PIS/Cofins cumulativo
    agronegocio: { min: 4.5, max: 7 },
    tecnologia: { min: 8.65, max: 14.5 },
    saude: { min: 8.65, max: 14.5 },
    educacao: { min: 8.65, max: 14.5 },
    construcao: { min: 5.93, max: 10 },
    financeiro: { min: 8.65, max: 16 },
    outro: { min: 6.5, max: 12 },
  },
  lucro_real: {
    comercio: { min: 9.25, max: 12 },
    industria: { min: 9.25, max: 14 },
    servicos: { min: 9.25, max: 14.5 },
    agronegocio: { min: 6, max: 10 },
    tecnologia: { min: 9.25, max: 14 },
    saude: { min: 9.25, max: 14 },
    educacao: { min: 9.25, max: 14 },
    construcao: { min: 9.25, max: 14 },
    financeiro: { min: 9.25, max: 16 },
    outro: { min: 9.25, max: 14 },
  },
  nao_sei: {
    comercio: { min: 5, max: 12 },
    industria: { min: 5, max: 12 },
    servicos: { min: 7, max: 16 },
    agronegocio: { min: 4, max: 10 },
    tecnologia: { min: 7, max: 15 },
    saude: { min: 7, max: 15 },
    educacao: { min: 7, max: 15 },
    construcao: { min: 5, max: 12 },
    financeiro: { min: 7, max: 16 },
    outro: { min: 6, max: 14 },
  },
}

// Carga tributária NOVA estimada (IBS + CBS, estimativa ~26.5% padrão, com variações)
// Setores com regimes diferenciados têm alíquotas reduzidas
const CARGA_NOVA: Record<Setor, { min: number; max: number; reducao?: string }> = {
  comercio: { min: 24, max: 28 },
  industria: { min: 22, max: 27 }, // Créditos de insumos ajudam
  servicos: { min: 25, max: 28 }, // Sem crédito de folha = dói mais
  agronegocio: { min: 10, max: 18, reducao: "Regime diferenciado - alíquota reduzida" },
  tecnologia: { min: 25, max: 28 },
  saude: { min: 10, max: 15, reducao: "Alíquota reduzida para serviços de saúde" },
  educacao: { min: 10, max: 15, reducao: "Alíquota reduzida para educação" },
  construcao: { min: 22, max: 27 },
  financeiro: { min: 20, max: 26, reducao: "Regime específico para serviços financeiros" },
  outro: { min: 24, max: 28 },
}

// Fatores de ajuste por regime para a nova carga
// Lucro real tende a se beneficiar mais da não-cumulatividade
const AJUSTE_REGIME: Record<RegimeTributario, number> = {
  simples: 0.4, // Simples mantém regime próprio, impacto indireto
  lucro_presumido: 1.0, // Impacto total
  lucro_real: 0.75, // Benefício dos créditos
  nao_sei: 0.85, // Média conservadora
}

function calcularImpacto(input: SimuladorInput): { 
  diferencaMin: number
  diferencaMax: number 
  percentualMedio: number
  faturamentoBase: number
} {
  const faturamento = FATURAMENTO_MEDIO[input.faturamento]
  const cargaAtual = CARGA_ATUAL[input.regime][input.setor]
  const cargaNova = CARGA_NOVA[input.setor]
  const ajuste = AJUSTE_REGIME[input.regime]
  
  // Carga atual em R$
  const impostoAtualMin = faturamento * (cargaAtual.min / 100)
  const impostoAtualMax = faturamento * (cargaAtual.max / 100)
  const impostoAtualMedio = (impostoAtualMin + impostoAtualMax) / 2
  
  // Carga nova em R$ (com ajuste por regime)
  const impostoNovoMin = faturamento * (cargaNova.min / 100) * ajuste
  const impostoNovoMax = faturamento * (cargaNova.max / 100) * ajuste
  const impostoNovoMedio = (impostoNovoMin + impostoNovoMax) / 2
  
  // Diferença (positivo = paga mais)
  const diferencaMin = impostoNovoMin - impostoAtualMax // Melhor cenário
  const diferencaMax = impostoNovoMax - impostoAtualMin // Pior cenário
  
  // Percentual médio de mudança
  const percentualMedio = impostoAtualMedio > 0 
    ? ((impostoNovoMedio - impostoAtualMedio) / impostoAtualMedio) * 100
    : 0
  
  return {
    diferencaMin: Math.round(diferencaMin),
    diferencaMax: Math.round(diferencaMax),
    percentualMedio: Math.round(percentualMedio),
    faturamentoBase: faturamento,
  }
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

function gerarAlertas(input: SimuladorInput, percentual: number): string[] {
  const alertas: string[] = []
  
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
  }
  
  if (input.regime === "lucro_presumido" && percentual > 30) {
    alertas.push("🔄 Considere avaliar migração para Lucro Real - pode gerar economia com a reforma")
  }
  
  // Alertas gerais de timing
  alertas.push("⏰ 2026 é o ano de teste - aproveite para adaptar seus sistemas sem penalidades severas")
  alertas.push("💳 Split payment começa em 2027 - prepare seu fluxo de caixa")
  
  return alertas
}

function gerarDatasImportantes(input: SimuladorInput): SimuladorResult["datasImportantes"] {
  const datas: SimuladorResult["datasImportantes"] = [
    {
      data: "2026",
      descricao: "Ano de teste - CBS 0,9% e IBS 0,1% destacados em NF (sem recolhimento efetivo)",
      urgencia: "warning",
    },
    {
      data: "Janeiro 2027",
      descricao: "CBS entra em vigor definitivamente + Split Payment + Extinção do PIS/Cofins",
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

function gerarAcoesRecomendadas(input: SimuladorInput): string[] {
  const acoes: string[] = []
  
  // Ações gerais (sempre mostrar 2 como teaser)
  acoes.push("Atualizar sistema de emissão de notas fiscais para novos campos (IBS, CBS)")
  acoes.push("Simular fluxo de caixa considerando split payment em 2027")
  
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
  
  return acoes
}

function gerarChecklistCompleto(input: SimuladorInput): string[] {
  const checklist: string[] = [
    "Atualizar sistema de emissão de NF-e para incluir campos IBS e CBS",
    "Cadastrar empresa no portal do IBS (quando disponível)",
    "Revisar todos os contratos de longo prazo para cláusulas de reajuste tributário",
    "Mapear produtos/serviços e identificar alíquotas diferenciadas aplicáveis",
    "Simular fluxo de caixa com split payment (retenção automática na liquidação)",
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

  if (input.regime === "lucro_presumido") {
    checklist.push("Realizar simulação comparativa Lucro Presumido vs Lucro Real no novo sistema")
    checklist.push("Avaliar timing ideal para eventual migração de regime")
  }

  return checklist
}

function gerarProjecaoAnual(input: SimuladorInput): SimuladorResult["gatedContent"]["projecaoAnual"] {
  const faturamento = FATURAMENTO_MEDIO[input.faturamento]
  const cargaAtual = CARGA_ATUAL[input.regime][input.setor]
  const cargaAtualMedia = (cargaAtual.min + cargaAtual.max) / 2
  const impostoAtual = faturamento * (cargaAtualMedia / 100)

  // Transition schedule: IBS and CBS phase-in
  const transicao = [
    { ano: 2026, ibsPct: 0.1, cbsPct: 0.9, descricao: "Ano de teste — alíquotas destacadas em NF, sem recolhimento efetivo" },
    { ano: 2027, ibsPct: 0.1, cbsPct: 8.8, descricao: "CBS em vigor pleno. PIS/Cofins extinto. Split payment inicia" },
    { ano: 2028, ibsPct: 0.1, cbsPct: 8.8, descricao: "CBS consolidada. IBS ainda em fase inicial" },
    { ano: 2029, ibsPct: 5.0, cbsPct: 8.8, descricao: "Início da extinção gradual do ICMS e ISS" },
    { ano: 2030, ibsPct: 10.0, cbsPct: 8.8, descricao: "IBS em 2ª fase. ICMS/ISS reduzidos em ~25%" },
    { ano: 2031, ibsPct: 13.0, cbsPct: 8.8, descricao: "IBS em 3ª fase. ICMS/ISS reduzidos em ~50%" },
    { ano: 2032, ibsPct: 15.0, cbsPct: 8.8, descricao: "IBS em 4ª fase. ICMS/ISS reduzidos em ~75%" },
    { ano: 2033, ibsPct: 17.7, cbsPct: 8.8, descricao: "Sistema novo 100% implementado. ICMS/ISS extintos" },
  ]

  const ajuste = AJUSTE_REGIME[input.regime]
  const cargaNova = CARGA_NOVA[input.setor]
  const cargaNovaMedia = ((cargaNova.min + cargaNova.max) / 2) * ajuste

  return transicao.map(({ ano, ibsPct, cbsPct, descricao }) => {
    // During transition, blend old and new systems
    const proporcaoNovo = Math.min((ibsPct + cbsPct) / (17.7 + 8.8), 1)
    const cargaTransicao = cargaAtualMedia * (1 - proporcaoNovo) + cargaNovaMedia * proporcaoNovo
    const impostoEstimado = faturamento * (cargaTransicao / 100)
    const diferenca = Math.round(impostoEstimado - impostoAtual)

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

  const faturamento = FATURAMENTO_MEDIO[input.faturamento]
  const cargaPresumido = CARGA_ATUAL.lucro_presumido[input.setor]
  const cargaReal = CARGA_ATUAL.lucro_real[input.setor]
  const cargaNova = CARGA_NOVA[input.setor]

  const custoPresumidoNovo = faturamento * (((cargaNova.min + cargaNova.max) / 2) / 100) * AJUSTE_REGIME.lucro_presumido
  const custoRealNovo = faturamento * (((cargaNova.min + cargaNova.max) / 2) / 100) * AJUSTE_REGIME.lucro_real
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

export function calcularSimulacao(input: SimuladorInput): SimuladorResult {
  const impacto = calcularImpacto(input)
  const nivelRisco = determinarNivelRisco(impacto.percentualMedio, input.setor, input.regime)

  return {
    impactoAnual: {
      min: impacto.diferencaMin,
      max: impacto.diferencaMax,
      percentual: impacto.percentualMedio,
    },
    nivelRisco,
    alertas: gerarAlertas(input, impacto.percentualMedio),
    datasImportantes: gerarDatasImportantes(input),
    acoesRecomendadas: gerarAcoesRecomendadas(input),
    gatedContent: {
      checklistCompleto: gerarChecklistCompleto(input),
      analiseDetalhada: "Análise completa do impacto por linha de produto/serviço",
      comparativoRegimes: input.regime !== "simples",
      projecaoAnual: gerarProjecaoAnual(input),
      analiseRegime: gerarAnaliseRegime(input),
    },
  }
}

export function gerarTeaser(result: SimuladorResult, _input: SimuladorInput): SimuladorTeaser {
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
  medio: { label: "Médio", color: "text-yellow-600 bg-yellow-100" },
  alto: { label: "Alto", color: "text-orange-600 bg-orange-100" },
  critico: { label: "Crítico", color: "text-red-600 bg-red-100" },
}
