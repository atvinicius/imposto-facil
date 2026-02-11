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
  TRANSICAO_TIMELINE,
  UF_INCENTIVOS_FISCAIS,
  collectSources,
  collectLimitacoes,
  determineConfidence,
} from "./tax-data"

function calcularImpacto(input: SimuladorInput): {
  diferencaMin: number
  diferencaMax: number
  percentualMedio: number
  faturamentoBase: number
} {
  const faturamento = FATURAMENTO_MEDIO[input.faturamento].value
  const cargaAtual = CARGA_ATUAL[input.regime][input.setor].value
  const cargaNova = CARGA_NOVA[input.setor].value
  const ajuste = AJUSTE_REGIME[input.regime].value

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

  // Alertas UF-aware: estados com grandes programas de incentivos fiscais
  if (input.uf && UF_INCENTIVOS_FISCAIS[input.uf]) {
    const ufInfo = UF_INCENTIVOS_FISCAIS[input.uf]
    alertas.push(`📍 ${input.uf}: ${ufInfo.value}`)
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
  const faturamento = FATURAMENTO_MEDIO[input.faturamento].value
  const cargaAtual = CARGA_ATUAL[input.regime][input.setor].value
  const cargaAtualMedia = (cargaAtual.min + cargaAtual.max) / 2
  const impostoAtual = faturamento * (cargaAtualMedia / 100)

  const ajuste = AJUSTE_REGIME[input.regime].value
  const cargaNova = CARGA_NOVA[input.setor].value
  const cargaNovaMedia = ((cargaNova.min + cargaNova.max) / 2) * ajuste

  return TRANSICAO_TIMELINE.map(({ ano, ibsPct, cbsPct, descricao }) => {
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

  const faturamento = FATURAMENTO_MEDIO[input.faturamento].value
  const cargaPresumido = CARGA_ATUAL.lucro_presumido[input.setor].value
  const cargaReal = CARGA_ATUAL.lucro_real[input.setor].value
  const cargaNova = CARGA_NOVA[input.setor].value

  const custoPresumidoNovo = faturamento * (((cargaNova.min + cargaNova.max) / 2) / 100) * AJUSTE_REGIME.lucro_presumido.value
  const custoRealNovo = faturamento * (((cargaNova.min + cargaNova.max) / 2) / 100) * AJUSTE_REGIME.lucro_real.value
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

function gerarMetodologia(input: SimuladorInput): SimuladorResult["metodologia"] {
  const fontes = collectSources(input.regime, input.setor, input.faturamento, input.uf)
  const limitacoes = collectLimitacoes(input.regime, input.setor)
  const confianca = determineConfidence(input.regime, input.setor)

  const resumoPartes: string[] = [
    "Estimativa baseada em alíquotas da legislação vigente (LC 123/2006, Lei 10.637/2002, Lei 10.833/2003)",
    "e projeções oficiais do Ministério da Fazenda para IBS+CBS (~26,5%).",
  ]

  const cargaNova = CARGA_NOVA[input.setor]
  if (cargaNova.value.reducao) {
    resumoPartes.push(`Setor com alíquota reduzida conforme LC 214/2025.`)
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
    metodologia: gerarMetodologia(input),
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
