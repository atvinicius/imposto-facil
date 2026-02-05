import type { 
  SimuladorInput, 
  SimuladorResult, 
  SimuladorTeaser,
  RegimeTributario,
  Setor,
  FaixaFaturamento 
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
  alertas.push("⏰ Período sem multas termina em abril de 2026 - adeque seus sistemas")
  alertas.push("💳 Split payment começa em 2027 - prepare seu fluxo de caixa")
  
  return alertas
}

function gerarDatasImportantes(input: SimuladorInput): SimuladorResult["datasImportantes"] {
  const datas: SimuladorResult["datasImportantes"] = [
    {
      data: "Abril 2026",
      descricao: "Fim do período de adaptação sem multas",
      urgencia: "danger",
    },
    {
      data: "Janeiro 2027",
      descricao: "CBS entra em vigor definitivamente + Split Payment",
      urgencia: "warning",
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
      checklistCompleto: [
        "Checklist de adequação de sistemas",
        "Cronograma personalizado de preparação",
        "Lista de documentos para revisar",
        "Guia de comunicação com contador",
        "Modelo de cláusulas contratuais",
      ],
      analiseDetalhada: "Análise completa do impacto por linha de produto/serviço",
      comparativoRegimes: input.regime !== "simples",
    },
  }
}

export function gerarTeaser(result: SimuladorResult, input: SimuladorInput): SimuladorTeaser {
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
