/**
 * Adaptive Simulator Insights
 *
 * Content module for contextualizers (why we ask each question)
 * and insight screens (post-answer facts grounded in tax-data.ts).
 *
 * All text uses plain Portuguese (iniciante tier) — no jargon.
 */

import type { Setor, RegimeTributario, TipoCustoPrincipal, PerfilClientes } from "./types"
import { UF_INCENTIVOS_FISCAIS } from "./tax-data"

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface Insight {
  emoji: string
  headline: string
  detail: string
  durationMs?: number // defaults to 3500
}

// ---------------------------------------------------------------------------
// Contextualizers — "why we ask" text per step
// ---------------------------------------------------------------------------

const CONTEXTUALIZERS: Record<string, string> = {
  setor: "O setor define quanto imposto você paga — e quanto vai pagar",
  uf: "A localização influencia incentivos fiscais que podem acabar com a reforma",
  icms: "Saber se você tem incentivo ajuda a calcular o impacto da extinção deles",
  regime: "O regime tributário muda completamente como a reforma te afeta",
  faturamento: "O valor exato da receita torna o cálculo mais preciso",
  folha: "Salários não geram crédito no novo sistema — isso pesa na conta",
  custo: "Custos com materiais geram crédito; com pessoas, não",
  clientes: "Quem compra de você define se o crédito tributário funciona na cadeia",
  exporta: "Exportação de serviços tem imposto zero no novo sistema",
}

export function getContextualizer(stepId: string): string {
  return CONTEXTUALIZERS[stepId] ?? ""
}

// ---------------------------------------------------------------------------
// Setor insights
// ---------------------------------------------------------------------------

const SETOR_INSIGHTS: Record<Setor, Insight> = {
  servicos: {
    emoji: "💼",
    headline: "Serviços: o setor mais impactado",
    detail: "A alíquota pode mais que dobrar. Mas o impacto real depende do seu perfil completo.",
  },
  comercio: {
    emoji: "🛒",
    headline: "Comércio: créditos a seu favor",
    detail: "A nova base de créditos sobre mercadorias pode compensar boa parte do aumento.",
  },
  industria: {
    emoji: "🏭",
    headline: "Indústria: créditos amplos",
    detail: "Com créditos sobre todos os insumos, a indústria tende a ter transição mais suave.",
  },
  tecnologia: {
    emoji: "💻",
    headline: "Tecnologia: atenção à folha",
    detail: "Se a maior parte do custo é com pessoas, os créditos serão limitados.",
  },
  saude: {
    emoji: "🏥",
    headline: "Saúde: alíquota reduzida em 60%",
    detail: "Vamos verificar se o seu perfil se qualifica para essa redução.",
  },
  educacao: {
    emoji: "📚",
    headline: "Educação: alíquota reduzida em 60%",
    detail: "Instituições de ensino têm tratamento especial na reforma.",
  },
  agronegocio: {
    emoji: "🌾",
    headline: "Agro: regime diferenciado",
    detail: "Produtos agropecuários têm redução de 60% na alíquota. Mas há detalhes importantes.",
  },
  construcao: {
    emoji: "🏗️",
    headline: "Construção: atenção à formalização",
    detail: "Um dos setores com maior pressão. A reforma cobra automaticamente a partir de 2027.",
  },
  financeiro: {
    emoji: "🏦",
    headline: "Financeiro: regime específico",
    detail: "Bancos e seguradoras terão regras próprias. A base de cálculo muda.",
  },
  outro: {
    emoji: "📦",
    headline: "Vamos calcular seu impacto",
    detail: "Mesmo sem setor específico, conseguimos estimar o efeito da reforma.",
  },
}

export function getSetorInsight(setor: Setor): Insight {
  return SETOR_INSIGHTS[setor]
}

// ---------------------------------------------------------------------------
// UF insights
// ---------------------------------------------------------------------------

const UF_INCENTIVE_STATES = new Set(Object.keys(UF_INCENTIVOS_FISCAIS))

const UF_INSIGHT_MAP: Record<string, Insight> = {
  AM: {
    emoji: "🌳",
    headline: "Zona Franca: proteção até 2073",
    detail: "Empresas na Zona Franca de Manaus têm tratamento especial — vantagem única no Brasil.",
  },
  GO: {
    emoji: "📍",
    headline: "Goiás: incentivos em extinção",
    detail: "Programas como PRODUZIR serão extintos até 2032. Isso afeta diretamente o cálculo.",
  },
  BA: {
    emoji: "📍",
    headline: "Bahia: DESENVOLVE em transição",
    detail: "Os incentivos de ICMS serão extintos gradualmente. Há compensação federal prevista.",
  },
  CE: {
    emoji: "📍",
    headline: "Ceará: incentivos em transição",
    detail: "O FDI e outros incentivos de ICMS serão extintos gradualmente até 2032.",
  },
  PE: {
    emoji: "📍",
    headline: "Pernambuco: PRODEPE em transição",
    detail: "Os incentivos fiscais serão compensados pelo Fundo federal, mas exigem planejamento.",
  },
  SC: {
    emoji: "📍",
    headline: "Santa Catarina: TTD em transição",
    detail: "Os programas de ICMS terão sunset com a reforma. Planeje a transição.",
  },
  ES: {
    emoji: "📍",
    headline: "Espírito Santo: INVEST-ES em transição",
    detail: "Incentivos de comércio exterior e indústria serão extintos gradualmente.",
  },
  MG: {
    emoji: "📍",
    headline: "Minas Gerais: incentivos industriais em transição",
    detail: "Os incentivos de ICMS de Minas serão extintos progressivamente até 2032.",
  },
}

const UF_DEFAULT_INSIGHT: Insight = {
  emoji: "📍",
  headline: "Sem incentivos em risco",
  detail: "Sua transição é mais direta — menos variáveis para calcular.",
}

export function getUfInsight(uf: string): Insight {
  return UF_INSIGHT_MAP[uf] ?? UF_DEFAULT_INSIGHT
}

export function ufHasIncentiveProgram(uf: string): boolean {
  return UF_INCENTIVE_STATES.has(uf)
}

// ---------------------------------------------------------------------------
// ICMS incentive insights (conditional step)
// ---------------------------------------------------------------------------

export function getIcmsInsight(answer: "sim" | "nao" | "nao_sei"): Insight {
  switch (answer) {
    case "sim":
      return {
        emoji: "⚠️",
        headline: "Incentivo confirmado",
        detail: "Esses benefícios serão extintos até 2032. Vamos incluir isso no cálculo.",
      }
    case "nao":
      return {
        emoji: "✅",
        headline: "Sem incentivo de ICMS",
        detail: "Menos uma variável — seu cálculo fica mais direto.",
      }
    case "nao_sei":
      return {
        emoji: "🤔",
        headline: "Tudo bem, vamos estimar",
        detail: "Usaremos a média do seu estado. Confirme com seu contador depois.",
      }
  }
}

// ---------------------------------------------------------------------------
// Regime insights (sector-aware)
// ---------------------------------------------------------------------------

export function getRegimeInsight(regime: RegimeTributario, setor: Setor): Insight {
  if (regime === "simples") {
    const isB2BHeavy = setor === "tecnologia" || setor === "industria"
    return {
      emoji: "📋",
      headline: "Simples: impacto indireto",
      detail: isB2BHeavy
        ? "Seus clientes PJ não aproveitam créditos. A partir de set/2026, existe o Simples Híbrido."
        : "O Simples continua existindo. O impacto maior é nos preços dos fornecedores.",
    }
  }
  if (regime === "lucro_presumido") {
    const isService = setor === "servicos" || setor === "tecnologia" || setor === "educacao" || setor === "saude"
    return {
      emoji: "⚠️",
      headline: "Lucro Presumido: maior impacto",
      detail: isService
        ? "Você sai de PIS/Cofins de 3,65% para alíquota cheia. E folha não gera crédito."
        : "A mudança de cumulativo para não-cumulativo é grande. Mas créditos sobre compras ajudam.",
    }
  }
  if (regime === "lucro_real") {
    return {
      emoji: "✅",
      headline: "Boa notícia para Lucro Real",
      detail: "Você já usa não-cumulativo. A reforma amplia seus créditos — transição mais suave.",
    }
  }
  // nao_sei
  return {
    emoji: "🤔",
    headline: "Sem regime definido",
    detail: "Vamos estimar com uma média. Descubra seu regime com seu contador para resultado exato.",
  }
}

// ---------------------------------------------------------------------------
// Faturamento insights
// ---------------------------------------------------------------------------

export function getFaturamentoInsight(valor: number): Insight {
  if (valor <= 81_000) {
    return {
      emoji: "📊",
      headline: "Na faixa MEI",
      detail: "O custo contábil adicional (R$50-150/mês) pode pesar mais que a mudança de alíquota.",
    }
  }
  if (valor <= 360_000) {
    return {
      emoji: "📊",
      headline: "Faixa Microempresa",
      detail: "Nessa faixa, o impacto depende muito do regime e do tipo de custo.",
    }
  }
  if (valor <= 4_800_000) {
    return {
      emoji: "📊",
      headline: "Pequena empresa",
      detail: "Faixa com mais opções de regime. Vale comparar Simples vs Lucro Presumido vs Real.",
    }
  }
  if (valor <= 78_000_000) {
    return {
      emoji: "📊",
      headline: "Média empresa",
      detail: "Nesse porte, a estrutura de créditos faz toda a diferença no resultado final.",
    }
  }
  return {
    emoji: "📊",
    headline: "Grande empresa",
    detail: "O impacto em valor absoluto é significativo. Cada ponto percentual conta.",
  }
}

// ---------------------------------------------------------------------------
// Folha (payroll ratio) insights
// ---------------------------------------------------------------------------

export function getFolhaInsight(fatorR: number): Insight {
  if (fatorR > 50) {
    return {
      emoji: "💰",
      headline: "Folha alta = menos créditos",
      detail: "A maior parte dos seus custos não gera crédito no novo sistema. Isso aumenta a carga.",
    }
  }
  if (fatorR > 25) {
    return {
      emoji: "💰",
      headline: "Folha moderada",
      detail: "Parte dos custos gera crédito, parte não. O impacto depende dos outros fatores.",
    }
  }
  return {
    emoji: "💰",
    headline: "Folha baixa = mais créditos",
    detail: "Com menos gastos em pessoal, você aproveita mais créditos sobre outros custos.",
  }
}

// ---------------------------------------------------------------------------
// Tipo de custo insights
// ---------------------------------------------------------------------------

export function getCustoInsight(tipo: TipoCustoPrincipal): Insight {
  switch (tipo) {
    case "materiais":
      return {
        emoji: "📦",
        headline: "Materiais geram crédito total",
        detail: "Cada compra de insumo vira crédito de IBS/CBS. Boa notícia para sua empresa.",
      }
    case "servicos":
      return {
        emoji: "🔧",
        headline: "Serviços terceirizados: crédito parcial",
        detail: "Serviços geram crédito, mas depende de como o fornecedor emite a nota.",
      }
    case "folha":
      return {
        emoji: "👥",
        headline: "Folha não gera crédito",
        detail: "Salários e encargos ficam fora do sistema de créditos. Isso pesa na conta final.",
      }
    case "misto":
      return {
        emoji: "⚖️",
        headline: "Custos equilibrados",
        detail: "A parte de materiais gera crédito; a de pessoal, não. Resultado intermediário.",
      }
  }
}

// ---------------------------------------------------------------------------
// Perfil de clientes insights (regime-aware)
// ---------------------------------------------------------------------------

export function getClientesInsight(perfil: PerfilClientes, regime: RegimeTributario): Insight {
  if (perfil === "b2b" && regime === "simples") {
    return {
      emoji: "⚠️",
      headline: "Atenção: créditos B2B",
      detail: "No Simples, seus clientes PJ não aproveitam créditos. Avalie o Simples Híbrido.",
    }
  }
  if (perfil === "b2b") {
    return {
      emoji: "🏢",
      headline: "Vendas B2B: cadeia de créditos",
      detail: "Seus clientes vão querer crédito. Estar fora do Simples é vantagem aqui.",
    }
  }
  if (perfil === "b2c") {
    return {
      emoji: "👤",
      headline: "Vendas ao consumidor final",
      detail: "O consumidor não usa crédito. Seu impacto depende mais da alíquota do que da cadeia.",
    }
  }
  // misto
  return {
    emoji: "🔄",
    headline: "Público misto",
    detail: "A parte B2B exige atenção aos créditos. A parte B2C depende mais da alíquota.",
  }
}

// ---------------------------------------------------------------------------
// Export de serviços insights (conditional step)
// ---------------------------------------------------------------------------

export function getExportInsight(exporta: boolean): Insight {
  if (exporta) {
    return {
      emoji: "🌍",
      headline: "Exportação = imposto zero",
      detail: "Serviços exportados têm alíquota zero de IBS/CBS. Oportunidade de expansão.",
    }
  }
  return {
    emoji: "🏠",
    headline: "Mercado interno",
    detail: "Sem exportação, a alíquota padrão se aplica integralmente.",
  }
}
