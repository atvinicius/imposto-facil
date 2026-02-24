/**
 * Tax Data Registry — Cited Sources
 *
 * Every data point wraps its value in a CitedValue<T> with:
 *  - source: legislative reference or official document
 *  - confidence: "legislada" (enacted law), "estimativa_oficial" (Min. Fazenda projection), "derivada" (calculated from other values)
 *  - notes: optional explanation of how the value was derived
 *
 * Main references:
 *  - EC 132/2023 (Emenda Constitucional da Reforma Tributária)
 *  - LC 214/2025 (Lei Complementar de regulamentação)
 *  - LC 123/2006 (Simples Nacional)
 *  - Lei 10.637/2002 e Lei 10.833/2003 (PIS/Cofins não-cumulativo)
 *  - Lei 9.718/1998 (PIS/Cofins cumulativo)
 *  - Nota Técnica do Ministério da Fazenda (alíquota de referência)
 */

import type { FaixaFaturamento, RegimeTributario, Setor } from "./types"

// ---------------------------------------------------------------------------
// Core wrapper
// ---------------------------------------------------------------------------

export interface CitedValue<T> {
  value: T
  source: string
  confidence: "legislada" | "estimativa_oficial" | "derivada"
  notes?: string
}

// ---------------------------------------------------------------------------
// Faturamento médio por faixa
// ---------------------------------------------------------------------------

export const FATURAMENTO_MEDIO: Record<FaixaFaturamento, CitedValue<number>> = {
  ate_81k: {
    value: 60_000,
    source: "LC 123/2006, art. 18-A (limite MEI R$81.000/ano)",
    confidence: "derivada",
    notes: "Ponto médio estimado da faixa de faturamento MEI (R$0 – R$81.000)",
  },
  "81k_360k": {
    value: 200_000,
    source: "LC 123/2006, art. 3º, I (limite ME R$360.000/ano)",
    confidence: "derivada",
    notes: "Ponto médio estimado da faixa ME (R$81.000 – R$360.000)",
  },
  "360k_4.8m": {
    value: 1_500_000,
    source: "LC 123/2006, art. 3º, II (limite EPP R$4.800.000/ano)",
    confidence: "derivada",
    notes: "Ponto médio estimado da faixa EPP (R$360.000 – R$4.800.000)",
  },
  "4.8m_78m": {
    value: 20_000_000,
    source: "Lei 11.638/2007 e critérios BNDES para porte médio",
    confidence: "derivada",
    notes: "Ponto médio estimado para empresas de médio porte (R$4.8M – R$78M)",
  },
  acima_78m: {
    value: 150_000_000,
    source: "Estimativa baseada em dados de receita de grandes empresas",
    confidence: "derivada",
    notes: "Valor representativo para empresas acima de R$78M; impacto varia muito",
  },
}

// ---------------------------------------------------------------------------
// Carga tributária ATUAL por regime e setor (% sobre faturamento)
// ---------------------------------------------------------------------------

export const CARGA_ATUAL: Record<
  RegimeTributario,
  Record<Setor, CitedValue<{ min: number; max: number }>>
> = {
  simples: {
    comercio: {
      value: { min: 4, max: 11.5 },
      source: "LC 123/2006, Anexo I (Comércio)",
      confidence: "legislada",
      notes: "Alíquotas efetivas do Simples Nacional Anexo I, variando por faixa de faturamento",
    },
    industria: {
      value: { min: 4.5, max: 12 },
      source: "LC 123/2006, Anexo II (Indústria)",
      confidence: "legislada",
      notes: "Alíquotas efetivas do Simples Nacional Anexo II",
    },
    servicos: {
      value: { min: 6, max: 17.5 },
      source: "LC 123/2006, Anexos III, IV e V (Serviços)",
      confidence: "legislada",
      notes: "Varia conforme tipo de serviço e fator r (folha/receita). Anexo V pode chegar a 17,5%",
    },
    agronegocio: {
      value: { min: 4, max: 10 },
      source: "LC 123/2006, Anexos I e II",
      confidence: "derivada",
      notes: "Agronegócio no Simples utiliza Anexo I (comércio) ou II (indústria) conforme atividade",
    },
    tecnologia: {
      value: { min: 6, max: 15.5 },
      source: "LC 123/2006, Anexos III e V (TI/Software)",
      confidence: "legislada",
      notes: "Desenvolvimento de software: Anexo III (fator r > 28%) ou V (fator r < 28%)",
    },
    saude: {
      value: { min: 6, max: 15.5 },
      source: "LC 123/2006, Anexos III e V (Saúde)",
      confidence: "legislada",
      notes: "Serviços de saúde: Anexo III ou V dependendo do fator r",
    },
    educacao: {
      value: { min: 6, max: 15.5 },
      source: "LC 123/2006, Anexo III (Educação)",
      confidence: "legislada",
      notes: "Serviços de educação geralmente enquadrados no Anexo III",
    },
    construcao: {
      value: { min: 4.5, max: 12 },
      source: "LC 123/2006, Anexo IV (Construção Civil)",
      confidence: "legislada",
      notes: "Anexo IV não inclui CPP (INSS recolhido à parte)",
    },
    financeiro: {
      value: { min: 6, max: 17.5 },
      source: "LC 123/2006, Anexos III e V",
      confidence: "legislada",
      notes: "Serviços financeiros diversos; alíquota depende do fator r",
    },
    outro: {
      value: { min: 5, max: 14 },
      source: "LC 123/2006, média dos Anexos III-V",
      confidence: "derivada",
      notes: "Média estimada para setores não classificados",
    },
  },
  lucro_presumido: {
    comercio: {
      value: { min: 5.93, max: 8.5 },
      source: "Lei 9.718/1998 (PIS 0,65% + Cofins 3%) + ISS/ICMS variável",
      confidence: "legislada",
      notes: "PIS/Cofins cumulativo (3,65%) + ICMS médio (2-5%) sobre receita de comércio",
    },
    industria: {
      value: { min: 5.93, max: 8.5 },
      source: "Lei 9.718/1998 + regulamentação ICMS/IPI estadual",
      confidence: "legislada",
      notes: "PIS/Cofins cumulativo + ICMS + IPI variável por produto",
    },
    servicos: {
      value: { min: 8.65, max: 14.5 },
      source: "Lei 9.718/1998 (PIS/Cofins) + LC 116/2003 (ISS 2-5%)",
      confidence: "legislada",
      notes: "PIS/Cofins cumulativo 3,65% + ISS 2-5% + IRPJ/CSLL sobre presunção de 32%",
    },
    agronegocio: {
      value: { min: 4.5, max: 7 },
      source: "Lei 9.718/1998 + isenções agro específicas",
      confidence: "derivada",
      notes: "Agronegócio conta com diversas isenções de PIS/Cofins e redução de ICMS",
    },
    tecnologia: {
      value: { min: 8.65, max: 14.5 },
      source: "Lei 9.718/1998 + LC 116/2003",
      confidence: "legislada",
      notes: "Similar a serviços; software pode ter ISS de 2-5% conforme município",
    },
    saude: {
      value: { min: 8.65, max: 14.5 },
      source: "Lei 9.718/1998 + LC 116/2003",
      confidence: "legislada",
      notes: "Serviços de saúde com presunção de 32% para IRPJ (8% para receitas hospitalares)",
    },
    educacao: {
      value: { min: 8.65, max: 14.5 },
      source: "Lei 9.718/1998 + LC 116/2003",
      confidence: "legislada",
      notes: "Educação: ISS 2-5% + PIS/Cofins cumulativo + IRPJ/CSLL",
    },
    construcao: {
      value: { min: 5.93, max: 10 },
      source: "Lei 9.718/1998 + legislação ISS municipal",
      confidence: "legislada",
      notes: "Construção civil com presunção de 8% para IRPJ; ISS 2-5%",
    },
    financeiro: {
      value: { min: 8.65, max: 16 },
      source: "Lei 9.718/1998 + LC 116/2003 + regulação BACEN",
      confidence: "derivada",
      notes: "Serviços financeiros com carga mais elevada; IOF adicional em alguns casos",
    },
    outro: {
      value: { min: 6.5, max: 12 },
      source: "Média estimada do regime de Lucro Presumido",
      confidence: "derivada",
      notes: "Estimativa para setores não classificados no Lucro Presumido",
    },
  },
  lucro_real: {
    comercio: {
      value: { min: 9.25, max: 12 },
      source: "Lei 10.637/2002 (PIS 1,65%) + Lei 10.833/2003 (Cofins 7,6%) + ICMS",
      confidence: "legislada",
      notes: "PIS/Cofins não-cumulativo 9,25% + ICMS líquido de créditos",
    },
    industria: {
      value: { min: 9.25, max: 14 },
      source: "Lei 10.637/2002 + Lei 10.833/2003 + legislação IPI/ICMS",
      confidence: "legislada",
      notes: "PIS/Cofins 9,25% + ICMS + IPI; créditos sobre insumos reduzem carga efetiva",
    },
    servicos: {
      value: { min: 9.25, max: 14.5 },
      source: "Lei 10.637/2002 + Lei 10.833/2003 + LC 116/2003",
      confidence: "legislada",
      notes: "PIS/Cofins 9,25% + ISS 2-5%; poucos créditos em serviços (folha não gera crédito)",
    },
    agronegocio: {
      value: { min: 6, max: 10 },
      source: "Lei 10.637/2002 + Lei 10.833/2003 + isenções agro",
      confidence: "derivada",
      notes: "Diversos créditos presumidos e isenções para insumos agropecuários",
    },
    tecnologia: {
      value: { min: 9.25, max: 14 },
      source: "Lei 10.637/2002 + Lei 10.833/2003 + Lei do Bem (Lei 11.196/2005)",
      confidence: "legislada",
      notes: "PIS/Cofins 9,25% + ISS; possibilidade de incentivos da Lei do Bem para P&D",
    },
    saude: {
      value: { min: 9.25, max: 14 },
      source: "Lei 10.637/2002 + Lei 10.833/2003",
      confidence: "legislada",
      notes: "Saúde no Lucro Real: PIS/Cofins 9,25% + ISS, com créditos limitados",
    },
    educacao: {
      value: { min: 9.25, max: 14 },
      source: "Lei 10.637/2002 + Lei 10.833/2003",
      confidence: "legislada",
      notes: "Educação no Lucro Real: carga similar a serviços em geral",
    },
    construcao: {
      value: { min: 9.25, max: 14 },
      source: "Lei 10.637/2002 + Lei 10.833/2003 + legislação ISS",
      confidence: "legislada",
      notes: "Construção civil com possibilidade de créditos sobre materiais",
    },
    financeiro: {
      value: { min: 9.25, max: 16 },
      source: "Lei 10.637/2002 + Lei 10.833/2003 + legislação específica do setor financeiro",
      confidence: "derivada",
      notes: "Setor financeiro tem regime diferenciado com cumulatividade parcial em alguns casos",
    },
    outro: {
      value: { min: 9.25, max: 14 },
      source: "Média do regime de Lucro Real",
      confidence: "derivada",
      notes: "Estimativa para setores não classificados no Lucro Real",
    },
  },
  nao_sei: {
    comercio: {
      value: { min: 5, max: 12 },
      source: "Média ponderada entre regimes (Simples, Presumido, Real)",
      confidence: "derivada",
      notes: "Faixa conservadora cobrindo todos os regimes possíveis para comércio",
    },
    industria: {
      value: { min: 5, max: 12 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Faixa conservadora para indústria em qualquer regime",
    },
    servicos: {
      value: { min: 7, max: 16 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Serviços têm a maior variação entre regimes",
    },
    agronegocio: {
      value: { min: 4, max: 10 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Agronegócio geralmente tem carga mais baixa em todos os regimes",
    },
    tecnologia: {
      value: { min: 7, max: 15 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Tecnologia/SaaS com variação conforme regime e tipo de produto",
    },
    saude: {
      value: { min: 7, max: 15 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Saúde com variação dependendo do tipo de serviço e regime",
    },
    educacao: {
      value: { min: 7, max: 15 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Educação com faixa similar a serviços em geral",
    },
    construcao: {
      value: { min: 5, max: 12 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Construção civil com variação moderada entre regimes",
    },
    financeiro: {
      value: { min: 7, max: 16 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Setor financeiro: carga mais alta em praticamente todos os regimes",
    },
    outro: {
      value: { min: 6, max: 14 },
      source: "Média geral estimada",
      confidence: "derivada",
      notes: "Faixa genérica para setores não classificados, sem regime definido",
    },
  },
}

// ---------------------------------------------------------------------------
// Carga tributária NOVA (IBS + CBS)
// ---------------------------------------------------------------------------

export const CARGA_NOVA: Record<
  Setor,
  CitedValue<{ min: number; max: number; reducao?: string }>
> = {
  comercio: {
    value: { min: 24, max: 28 },
    source: "Nota Técnica Min. Fazenda — alíquota de referência IBS+CBS ~26,5%",
    confidence: "estimativa_oficial",
    notes: "Comércio segue alíquota padrão; crédito amplo sobre mercadorias compradas",
  },
  industria: {
    value: { min: 22, max: 27 },
    source: "Nota Técnica Min. Fazenda + LC 214/2025",
    confidence: "estimativa_oficial",
    notes: "Indústria se beneficia de créditos amplos sobre insumos. IPI será extinto (mantido apenas para Zona Franca de Manaus)",
  },
  servicos: {
    value: { min: 25, max: 28 },
    source: "Nota Técnica Min. Fazenda — alíquota padrão",
    confidence: "estimativa_oficial",
    notes: "Serviços: maior impacto negativo. Folha de pagamento não gera crédito de IBS/CBS, e a carga sobe de PIS/Cofins cumulativo para alíquota cheia",
  },
  agronegocio: {
    value: { min: 10, max: 18, reducao: "Regime diferenciado — alíquota reduzida em 60%" },
    source: "LC 214/2025, arts. 259 e 264 (regime diferenciado para produtos agropecuários)",
    confidence: "legislada",
    notes: "Produtos agropecuários in natura e insumos agrícolas têm redução de 60% da alíquota. Produtor rural PF tem regime simplificado",
  },
  tecnologia: {
    value: { min: 25, max: 28 },
    source: "Nota Técnica Min. Fazenda — alíquota padrão para TI/Software",
    confidence: "estimativa_oficial",
    notes: "Software e SaaS seguem alíquota padrão. Exportações de serviços mantêm desoneração (alíquota zero)",
  },
  saude: {
    value: { min: 10, max: 15, reducao: "Alíquota reduzida em 60% para serviços de saúde" },
    source: "LC 214/2025, art. 259 (redução de 60% para saúde)",
    confidence: "legislada",
    notes: "Serviços de saúde e dispositivos médicos com redução de 60%. Diferença entre hospital, clínica e laboratório conforme regulamentação",
  },
  educacao: {
    value: { min: 10, max: 15, reducao: "Alíquota reduzida em 60% para educação" },
    source: "LC 214/2025, art. 259 (redução de 60% para educação)",
    confidence: "legislada",
    notes: "Serviços de educação com redução de 60% da alíquota de referência",
  },
  construcao: {
    value: { min: 22, max: 27 },
    source: "Nota Técnica Min. Fazenda — alíquota padrão com créditos sobre materiais",
    confidence: "estimativa_oficial",
    notes: "Construção civil com créditos sobre materiais de construção; regime especial para incorporação imobiliária",
  },
  financeiro: {
    value: { min: 20, max: 26, reducao: "Regime específico para serviços financeiros" },
    source: "LC 214/2025, arts. 239-247 (regime específico para serviços financeiros)",
    confidence: "legislada",
    notes: "Bancos e seguradoras com regime específico; base de cálculo diferenciada. Cooperativas de crédito podem ter tratamento distinto",
  },
  outro: {
    value: { min: 24, max: 28 },
    source: "Nota Técnica Min. Fazenda — alíquota de referência padrão",
    confidence: "estimativa_oficial",
    notes: "Alíquota padrão para setores sem regime diferenciado",
  },
}

// ---------------------------------------------------------------------------
// Fator de efetividade tributária por regime e setor
// Ratio between what is actually paid vs. statutory rate.
// See docs/EFFECTIVENESS_METHODOLOGY.md for derivation details.
// ---------------------------------------------------------------------------

export const FATOR_EFETIVIDADE: Record<
  RegimeTributario,
  Record<Setor, CitedValue<{ medio: number; min: number; max: number }>>
> = {
  simples: {
    comercio: {
      value: { medio: 0.65, min: 0.50, max: 0.80 },
      source: "Receita Federal, Relatório de Arrecadação do Simples Nacional 2024 + IBGE Pesquisa Anual do Comércio",
      confidence: "derivada",
      notes: "Comércio varejista tem alta proporção de vendas em dinheiro e subnotificação de receita. Gap médio de 35%.",
    },
    industria: {
      value: { medio: 0.85, min: 0.75, max: 0.92 },
      source: "Receita Federal + IBGE PIA (Pesquisa Industrial Anual)",
      confidence: "derivada",
      notes: "Cadeia de fornecimento documentada força maior compliance. Pequenas indústrias no Simples ainda têm gaps.",
    },
    servicos: {
      value: { medio: 0.72, min: 0.55, max: 0.85 },
      source: "Receita Federal + IBGE PNAD Contínua (informalidade no setor de serviços)",
      confidence: "derivada",
      notes: "Serviços pessoais e alimentação têm gaps maiores; serviços profissionais têm gaps menores.",
    },
    agronegocio: {
      value: { medio: 0.70, min: 0.55, max: 0.82 },
      source: "Receita Federal + IBGE Censo Agropecuário",
      confidence: "derivada",
      notes: "Pequenos produtores frequentemente operam informalmente. Múltiplas isenções criam complexidade.",
    },
    tecnologia: {
      value: { medio: 0.90, min: 0.82, max: 0.95 },
      source: "Receita Federal + IBGE PNAD Contínua (setor TI)",
      confidence: "derivada",
      notes: "Setor altamente digital com quase todas transações documentadas eletronicamente.",
    },
    saude: {
      value: { medio: 0.80, min: 0.70, max: 0.90 },
      source: "Receita Federal + ANS (Agência Nacional de Saúde Suplementar)",
      confidence: "derivada",
      notes: "Setor regulado com exigências de licenciamento. Profissionais autônomos podem ter gaps maiores.",
    },
    educacao: {
      value: { medio: 0.82, min: 0.72, max: 0.90 },
      source: "Receita Federal + MEC dados de instituições",
      confidence: "derivada",
      notes: "Formalização moderada. Escolas formais vs. cursos livres/tutoria informal.",
    },
    construcao: {
      value: { medio: 0.60, min: 0.45, max: 0.75 },
      source: "Receita Federal + IBGE PNAD Contínua (construção: >50% informal)",
      confidence: "derivada",
      notes: "Maior informalidade entre todos os setores. Pagamentos em dinheiro a subempreiteiros são comuns.",
    },
    financeiro: {
      value: { medio: 0.95, min: 0.90, max: 0.98 },
      source: "Receita Federal + BACEN (supervisão bancária)",
      confidence: "estimativa_oficial",
      notes: "Setor fortemente regulado pelo Banco Central. Compliance quase total.",
    },
    outro: {
      value: { medio: 0.75, min: 0.60, max: 0.88 },
      source: "Média ponderada entre setores (Receita Federal)",
      confidence: "derivada",
      notes: "Estimativa conservadora para setores não classificados.",
    },
  },
  lucro_presumido: {
    comercio: {
      value: { medio: 0.70, min: 0.55, max: 0.82 },
      source: "Receita Federal, Relatório de Arrecadação LP 2024 + IBGE",
      confidence: "derivada",
      notes: "Exigências contábeis maiores que Simples, mas economia de caixa ainda significativa.",
    },
    industria: {
      value: { medio: 0.85, min: 0.75, max: 0.92 },
      source: "Receita Federal + IBGE PIA",
      confidence: "derivada",
      notes: "Documentação de cadeia similar ao Simples industrial.",
    },
    servicos: {
      value: { medio: 0.75, min: 0.60, max: 0.85 },
      source: "Receita Federal + IBGE PNAD Contínua",
      confidence: "derivada",
      notes: "ISS municipal com variação entre municípios cria gaps de compliance.",
    },
    agronegocio: {
      value: { medio: 0.72, min: 0.58, max: 0.84 },
      source: "Receita Federal + IBGE Censo Agropecuário",
      confidence: "derivada",
      notes: "Ligeiramente mais formal que Simples pelo porte das empresas.",
    },
    tecnologia: {
      value: { medio: 0.90, min: 0.82, max: 0.95 },
      source: "Receita Federal + IBGE PNAD Contínua (setor TI)",
      confidence: "derivada",
      notes: "Mesma vantagem digital do Simples. Transações quase totalmente rastreáveis.",
    },
    saude: {
      value: { medio: 0.82, min: 0.72, max: 0.90 },
      source: "Receita Federal + ANS",
      confidence: "derivada",
      notes: "Regulação setorial e pagamentos via convênios forçam documentação.",
    },
    educacao: {
      value: { medio: 0.82, min: 0.72, max: 0.90 },
      source: "Receita Federal + MEC",
      confidence: "derivada",
      notes: "Similar ao Simples em dinâmica de formalização.",
    },
    construcao: {
      value: { medio: 0.65, min: 0.50, max: 0.78 },
      source: "Receita Federal + IBGE PNAD Contínua",
      confidence: "derivada",
      notes: "Melhor que Simples mas informalidade ainda alta no setor.",
    },
    financeiro: {
      value: { medio: 0.95, min: 0.90, max: 0.98 },
      source: "Receita Federal + BACEN",
      confidence: "estimativa_oficial",
      notes: "Mesma regulação forte do setor financeiro.",
    },
    outro: {
      value: { medio: 0.78, min: 0.62, max: 0.88 },
      source: "Média ponderada entre setores (Receita Federal)",
      confidence: "derivada",
      notes: "Estimativa para setores não classificados no Lucro Presumido.",
    },
  },
  lucro_real: {
    comercio: {
      value: { medio: 0.85, min: 0.75, max: 0.92 },
      source: "Receita Federal + IBGE Pesquisa Anual do Comércio",
      confidence: "derivada",
      notes: "Escrituração completa exigida. Créditos requerem documentação. Compliance alto.",
    },
    industria: {
      value: { medio: 0.90, min: 0.82, max: 0.95 },
      source: "Receita Federal + IBGE PIA",
      confidence: "derivada",
      notes: "Cadeia produtiva documentada + escrituração completa = alto compliance.",
    },
    servicos: {
      value: { medio: 0.85, min: 0.75, max: 0.92 },
      source: "Receita Federal + IBGE",
      confidence: "derivada",
      notes: "Documentação plena exigida. Menos transações em dinheiro neste porte.",
    },
    agronegocio: {
      value: { medio: 0.82, min: 0.72, max: 0.90 },
      source: "Receita Federal + IBGE Censo Agropecuário",
      confidence: "derivada",
      notes: "Grandes operações agro bem documentadas. Créditos presumidos geram compliance.",
    },
    tecnologia: {
      value: { medio: 0.95, min: 0.88, max: 0.98 },
      source: "Receita Federal + IBGE PNAD Contínua (setor TI)",
      confidence: "derivada",
      notes: "Compliance máximo: digital + escrituração plena.",
    },
    saude: {
      value: { medio: 0.90, min: 0.82, max: 0.95 },
      source: "Receita Federal + ANS",
      confidence: "derivada",
      notes: "Regulação + escrituração plena + convênios documentados.",
    },
    educacao: {
      value: { medio: 0.88, min: 0.78, max: 0.93 },
      source: "Receita Federal + MEC",
      confidence: "derivada",
      notes: "Escrituração completa melhora compliance significativamente.",
    },
    construcao: {
      value: { medio: 0.80, min: 0.68, max: 0.88 },
      source: "Receita Federal + IBGE",
      confidence: "derivada",
      notes: "Grandes obras exigem documentação. Subcontratação informal ainda presente.",
    },
    financeiro: {
      value: { medio: 0.98, min: 0.95, max: 1.0 },
      source: "Receita Federal + BACEN (supervisão contínua)",
      confidence: "estimativa_oficial",
      notes: "Compliance praticamente total. Auditoria constante pelo Banco Central.",
    },
    outro: {
      value: { medio: 0.88, min: 0.78, max: 0.93 },
      source: "Média ponderada entre setores (Receita Federal)",
      confidence: "derivada",
      notes: "Estimativa para setores não classificados no Lucro Real.",
    },
  },
  nao_sei: {
    comercio: {
      value: { medio: 0.70, min: 0.55, max: 0.85 },
      source: "Média ponderada entre regimes (Receita Federal)",
      confidence: "derivada",
      notes: "Sem regime definido, usa média conservadora entre regimes para comércio.",
    },
    industria: {
      value: { medio: 0.85, min: 0.75, max: 0.92 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Indústria tem compliance relativamente alto em todos os regimes.",
    },
    servicos: {
      value: { medio: 0.75, min: 0.58, max: 0.88 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Serviços com variação grande entre regimes.",
    },
    agronegocio: {
      value: { medio: 0.72, min: 0.55, max: 0.85 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Agronegócio com gaps moderados em todos os regimes.",
    },
    tecnologia: {
      value: { medio: 0.90, min: 0.82, max: 0.95 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Tecnologia consistentemente alta em compliance.",
    },
    saude: {
      value: { medio: 0.82, min: 0.72, max: 0.92 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Saúde com compliance moderado-alto.",
    },
    educacao: {
      value: { medio: 0.82, min: 0.72, max: 0.90 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Educação com formalização moderada.",
    },
    construcao: {
      value: { medio: 0.65, min: 0.48, max: 0.80 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Construção com informalidade alta em todos os regimes.",
    },
    financeiro: {
      value: { medio: 0.95, min: 0.90, max: 0.98 },
      source: "Média ponderada entre regimes",
      confidence: "derivada",
      notes: "Setor financeiro consistentemente alto em compliance.",
    },
    outro: {
      value: { medio: 0.78, min: 0.62, max: 0.90 },
      source: "Média geral estimada (Receita Federal)",
      confidence: "derivada",
      notes: "Faixa genérica sem regime ou setor definido.",
    },
  },
}

// ---------------------------------------------------------------------------
// Fator de ajuste por regime tributário
// ---------------------------------------------------------------------------

export const AJUSTE_REGIME: Record<RegimeTributario, CitedValue<number>> = {
  simples: {
    value: 0.4,
    source: "EC 132/2023, art. 12, §1º — Simples mantém regime próprio",
    confidence: "derivada",
    notes:
      "O Simples Nacional permanece como regime diferenciado na reforma (EC 132/2023). " +
      "O fator 0,4 reflete que a nova alíquota IBS/CBS incide indiretamente (via cadeia de fornecedores) " +
      "mas a empresa do Simples não recolhe IBS/CBS diretamente. O impacto principal é na competitividade B2B, " +
      "pois compradores não aproveitam crédito integral.",
  },
  lucro_presumido: {
    value: 1.0,
    source: "LC 214/2025 — migração integral do cumulativo para não-cumulativo",
    confidence: "derivada",
    notes:
      "Lucro Presumido sofre impacto total: sai do PIS/Cofins cumulativo (3,65%) para alíquota cheia " +
      "de IBS+CBS (~26,5%). Empresas de serviços com pouca compra de insumos são as mais afetadas " +
      "pois têm poucos créditos para compensar.",
  },
  lucro_real: {
    value: 0.75,
    source: "LC 214/2025 — não-cumulatividade plena amplia créditos",
    confidence: "derivada",
    notes:
      "Lucro Real já opera com PIS/Cofins não-cumulativo; a transição para IBS/CBS amplia a base de créditos " +
      "(crédito financeiro pleno). O fator 0,75 reflete o benefício dos créditos adicionais, " +
      "especialmente para indústrias e comércio com alta aquisição de insumos.",
  },
  nao_sei: {
    value: 0.85,
    source: "Média ponderada conservadora entre regimes",
    confidence: "derivada",
    notes:
      "Sem informação do regime, adota-se média conservadora entre Lucro Presumido (1.0) e Lucro Real (0.75). " +
      "Recomenda-se que o usuário identifique seu regime para resultados mais precisos.",
  },
}

// ---------------------------------------------------------------------------
// Timeline da transição
// ---------------------------------------------------------------------------

export interface TransicaoEntry {
  ano: number
  ibsPct: number
  cbsPct: number
  descricao: string
  source: string
  confidence: "legislada" | "estimativa_oficial"
}

export const TRANSICAO_TIMELINE: TransicaoEntry[] = [
  {
    ano: 2026,
    ibsPct: 0.1,
    cbsPct: 0.9,
    descricao: "Ano de teste — alíquotas destacadas em NF, sem recolhimento efetivo",
    source: "EC 132/2023, ADCT art. 124 + LC 214/2025",
    confidence: "legislada",
  },
  {
    ano: 2027,
    ibsPct: 0.1,
    cbsPct: 8.8,
    descricao: "CBS em vigor pleno. PIS/Cofins extinto. Split payment inicia",
    source: "EC 132/2023, ADCT art. 125 + LC 214/2025",
    confidence: "legislada",
  },
  {
    ano: 2028,
    ibsPct: 0.1,
    cbsPct: 8.8,
    descricao: "CBS consolidada. IBS ainda em fase inicial",
    source: "EC 132/2023, ADCT art. 125",
    confidence: "legislada",
  },
  {
    ano: 2029,
    ibsPct: 5.0,
    cbsPct: 8.8,
    descricao: "Início da extinção gradual do ICMS e ISS",
    source: "EC 132/2023, ADCT art. 126",
    confidence: "legislada",
  },
  {
    ano: 2030,
    ibsPct: 10.0,
    cbsPct: 8.8,
    descricao: "IBS em 2ª fase. ICMS/ISS reduzidos em ~25%",
    source: "EC 132/2023, ADCT art. 127",
    confidence: "estimativa_oficial",
  },
  {
    ano: 2031,
    ibsPct: 13.0,
    cbsPct: 8.8,
    descricao: "IBS em 3ª fase. ICMS/ISS reduzidos em ~50%",
    source: "EC 132/2023, ADCT art. 128",
    confidence: "estimativa_oficial",
  },
  {
    ano: 2032,
    ibsPct: 15.0,
    cbsPct: 8.8,
    descricao: "IBS em 4ª fase. ICMS/ISS reduzidos em ~75%",
    source: "EC 132/2023, ADCT art. 129",
    confidence: "estimativa_oficial",
  },
  {
    ano: 2033,
    ibsPct: 17.7,
    cbsPct: 8.8,
    descricao: "Sistema novo 100% implementado. ICMS/ISS extintos",
    source: "EC 132/2023, ADCT art. 130-133",
    confidence: "legislada",
  },
]

// ---------------------------------------------------------------------------
// UF com programas de incentivos fiscais relevantes
// ---------------------------------------------------------------------------

export const UF_INCENTIVOS_FISCAIS: Record<string, CitedValue<string>> = {
  AM: {
    value: "Zona Franca de Manaus — incentivos especiais mantidos até 2073 (EC 132/2023, art. 92-A ADCT)",
    source: "EC 132/2023, ADCT art. 92-A e LC 214/2025, arts. 448-462",
    confidence: "legislada",
    notes: "ZFM mantém tratamento diferenciado com Contribuição de Intervenção no Domínio Econômico (CIDE)",
  },
  BA: {
    value: "DESENVOLVE e outros incentivos de ICMS — extinção progressiva até 2032",
    source: "EC 132/2023, ADCT art. 133 + Lei Estadual BA 7.980/2001",
    confidence: "legislada",
    notes: "Benefícios fiscais de ICMS serão compensados pelo Fundo de Compensação de Benefícios Fiscais",
  },
  GO: {
    value: "PRODUZIR e FOMENTAR — incentivos de ICMS com extinção até 2032",
    source: "EC 132/2023, ADCT art. 133 + Lei Estadual GO 13.591/2000",
    confidence: "legislada",
    notes: "Goiás tem forte dependência de incentivos fiscais de ICMS; transição demanda planejamento",
  },
  CE: {
    value: "FDI-CEARÁ — incentivos de ICMS com extinção gradual",
    source: "EC 132/2023, ADCT art. 133 + legislação estadual CE",
    confidence: "legislada",
    notes: "Incentivos de ICMS do Ceará serão extintos gradualmente durante a transição",
  },
  PE: {
    value: "PRODEPE — incentivos de ICMS com extinção gradual até 2032",
    source: "EC 132/2023, ADCT art. 133 + Lei Estadual PE 11.675/1999",
    confidence: "legislada",
    notes: "Benefícios do PRODEPE serão compensados pelo Fundo de Compensação federal",
  },
  SC: {
    value: "TTD e PRÓ-EMPREGO — incentivos de ICMS relevantes com sunset na reforma",
    source: "EC 132/2023, ADCT art. 133 + legislação estadual SC",
    confidence: "legislada",
    notes: "Santa Catarina tem diversos programas de ICMS que serão impactados",
  },
  ES: {
    value: "INVEST-ES e COMPETE — incentivos de ICMS em transição",
    source: "EC 132/2023, ADCT art. 133 + legislação estadual ES",
    confidence: "legislada",
    notes: "Espírito Santo com incentivos relevantes para comércio exterior e indústria",
  },
  MG: {
    value: "INDI e incentivos de ICMS — extinção progressiva",
    source: "EC 132/2023, ADCT art. 133 + legislação estadual MG",
    confidence: "legislada",
    notes: "Minas Gerais com incentivos industriais relevantes em ICMS",
  },
}

// ---------------------------------------------------------------------------
// Helper: collect all sources used in a calculation
// ---------------------------------------------------------------------------

export function collectSources(
  regime: RegimeTributario,
  setor: Setor,
  faturamento: FaixaFaturamento,
  uf?: string,
): string[] {
  const sources = new Set<string>()
  sources.add(FATURAMENTO_MEDIO[faturamento].source)
  sources.add(CARGA_ATUAL[regime][setor].source)
  sources.add(CARGA_NOVA[setor].source)
  sources.add(AJUSTE_REGIME[regime].source)
  sources.add(FATOR_EFETIVIDADE[regime][setor].source)
  TRANSICAO_TIMELINE.forEach((t) => sources.add(t.source))
  if (uf && UF_INCENTIVOS_FISCAIS[uf]) {
    sources.add(UF_INCENTIVOS_FISCAIS[uf].source)
  }
  return Array.from(sources)
}

export function collectLimitacoes(
  regime: RegimeTributario,
  setor: Setor,
): string[] {
  const limitacoes: string[] = [
    "Alíquotas finais de IBS/CBS ainda não foram definidas pelo Senado Federal",
    "A simulação usa médias por faixa de faturamento, não valores exatos",
    "Créditos tributários dependem da estrutura de custos individual de cada empresa",
    "A carga tributária 'atual' reflete a média efetiva do setor (dados públicos da Receita Federal), que pode ser menor que a alíquota legal. Empresas 100% formalizadas terão impacto menor que o estimado",
    "Esta simulação não substitui consultoria tributária profissional",
  ]

  if (regime === "nao_sei") {
    limitacoes.push("Regime tributário não informado — resultados menos precisos")
  }
  if (regime === "simples") {
    limitacoes.push("Impacto no Simples é predominantemente indireto (competitividade B2B)")
  }
  if (setor === "outro") {
    limitacoes.push("Setor genérico — alíquotas podem variar significativamente conforme atividade específica")
  }

  return limitacoes
}

export function determineConfidence(
  regime: RegimeTributario,
  setor: Setor,
): "alta" | "media" | "baixa" {
  // If regime is unknown, confidence is low
  if (regime === "nao_sei") return "baixa"

  // If sector is "outro" (generic), confidence is lower
  if (setor === "outro") return "baixa"

  // Sectors with legislated reduced rates have higher confidence
  const cargaNova = CARGA_NOVA[setor]
  if (cargaNova.confidence === "legislada") return "alta"

  // Default for official estimates
  return "media"
}
