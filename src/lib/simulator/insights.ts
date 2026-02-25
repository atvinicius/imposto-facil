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
  setor: "O setor define quanto imposto voce paga — e quanto vai pagar",
  uf: "A localizacao influencia incentivos fiscais que podem acabar com a reforma",
  icms: "Saber se voce tem incentivo ajuda a calcular o impacto da extincao deles",
  regime: "O regime tributario muda completamente como a reforma te afeta",
  faturamento: "O valor exato da receita torna o calculo mais preciso",
  folha: "Salarios nao geram credito no novo sistema — isso pesa na conta",
  custo: "Custos com materiais geram credito; com pessoas, nao",
  clientes: "Quem compra de voce define se o credito tributario funciona na cadeia",
  exporta: "Exportacao de servicos tem imposto zero no novo sistema",
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
    headline: "Servicos: o setor mais impactado",
    detail: "A aliquota pode mais que dobrar. Mas o impacto real depende do seu perfil completo.",
  },
  comercio: {
    emoji: "🛒",
    headline: "Comercio: creditos a seu favor",
    detail: "A nova base de creditos sobre mercadorias pode compensar boa parte do aumento.",
  },
  industria: {
    emoji: "🏭",
    headline: "Industria: creditos amplos",
    detail: "Com creditos sobre todos os insumos, a industria tende a ter transicao mais suave.",
  },
  tecnologia: {
    emoji: "💻",
    headline: "Tecnologia: atencao a folha",
    detail: "Se a maior parte do custo e com pessoas, os creditos serao limitados.",
  },
  saude: {
    emoji: "🏥",
    headline: "Saude: aliquota reduzida em 60%",
    detail: "Vamos verificar se o seu perfil se qualifica para essa reducao.",
  },
  educacao: {
    emoji: "📚",
    headline: "Educacao: aliquota reduzida em 60%",
    detail: "Instituicoes de ensino tem tratamento especial na reforma.",
  },
  agronegocio: {
    emoji: "🌾",
    headline: "Agro: regime diferenciado",
    detail: "Produtos agropecuarios tem reducao de 60% na aliquota. Mas ha detalhes importantes.",
  },
  construcao: {
    emoji: "🏗️",
    headline: "Construcao: atencao a formalizacao",
    detail: "Um dos setores com maior pressao. A reforma cobra automaticamente a partir de 2027.",
  },
  financeiro: {
    emoji: "🏦",
    headline: "Financeiro: regime especifico",
    detail: "Bancos e seguradoras terao regras proprias. A base de calculo muda.",
  },
  outro: {
    emoji: "📦",
    headline: "Vamos calcular seu impacto",
    detail: "Mesmo sem setor especifico, conseguimos estimar o efeito da reforma.",
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
    headline: "Zona Franca: protecao ate 2073",
    detail: "Empresas na Zona Franca de Manaus tem tratamento especial — vantagem unica no Brasil.",
  },
  GO: {
    emoji: "📍",
    headline: "Goias: incentivos em extincao",
    detail: "Programas como PRODUZIR serao extintos ate 2032. Isso afeta diretamente o calculo.",
  },
  BA: {
    emoji: "📍",
    headline: "Bahia: DESENVOLVE em transicao",
    detail: "Os incentivos de ICMS serao extintos gradualmente. Ha compensacao federal prevista.",
  },
  CE: {
    emoji: "📍",
    headline: "Ceara: incentivos em transicao",
    detail: "O FDI e outros incentivos de ICMS serao extintos gradualmente ate 2032.",
  },
  PE: {
    emoji: "📍",
    headline: "Pernambuco: PRODEPE em transicao",
    detail: "Os incentivos fiscais serao compensados pelo Fundo federal, mas exigem planejamento.",
  },
  SC: {
    emoji: "📍",
    headline: "Santa Catarina: TTD em transicao",
    detail: "Os programas de ICMS terao sunset com a reforma. Planeje a transicao.",
  },
  ES: {
    emoji: "📍",
    headline: "Espirito Santo: INVEST-ES em transicao",
    detail: "Incentivos de comercio exterior e industria serao extintos gradualmente.",
  },
  MG: {
    emoji: "📍",
    headline: "Minas Gerais: incentivos industriais em transicao",
    detail: "Os incentivos de ICMS de Minas serao extintos progressivamente ate 2032.",
  },
}

const UF_DEFAULT_INSIGHT: Insight = {
  emoji: "📍",
  headline: "Sem incentivos em risco",
  detail: "Sua transicao e mais direta — menos variaveis para calcular.",
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
        detail: "Esses beneficios serao extintos ate 2032. Vamos incluir isso no calculo.",
      }
    case "nao":
      return {
        emoji: "✅",
        headline: "Sem incentivo de ICMS",
        detail: "Menos uma variavel — seu calculo fica mais direto.",
      }
    case "nao_sei":
      return {
        emoji: "🤔",
        headline: "Tudo bem, vamos estimar",
        detail: "Usaremos a media do seu estado. Confirme com seu contador depois.",
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
        ? "Seus clientes PJ nao aproveitam creditos. A partir de set/2026, existe o Simples Hibrido."
        : "O Simples continua existindo. O impacto maior e nos precos dos fornecedores.",
    }
  }
  if (regime === "lucro_presumido") {
    const isService = setor === "servicos" || setor === "tecnologia" || setor === "educacao" || setor === "saude"
    return {
      emoji: "⚠️",
      headline: "Lucro Presumido: maior impacto",
      detail: isService
        ? "Voce sai de PIS/Cofins de 3,65% para aliquota cheia. E folha nao gera credito."
        : "A mudanca de cumulativo para nao-cumulativo e grande. Mas creditos sobre compras ajudam.",
    }
  }
  if (regime === "lucro_real") {
    return {
      emoji: "✅",
      headline: "Boa noticia para Lucro Real",
      detail: "Voce ja usa nao-cumulativo. A reforma amplia seus creditos — transicao mais suave.",
    }
  }
  // nao_sei
  return {
    emoji: "🤔",
    headline: "Sem regime definido",
    detail: "Vamos estimar com uma media. Descubra seu regime com seu contador para resultado exato.",
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
      detail: "O custo contabil adicional (R$50-150/mes) pode pesar mais que a mudanca de aliquota.",
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
      detail: "Faixa com mais opcoes de regime. Vale comparar Simples vs Lucro Presumido vs Real.",
    }
  }
  if (valor <= 78_000_000) {
    return {
      emoji: "📊",
      headline: "Media empresa",
      detail: "Nesse porte, a estrutura de creditos faz toda a diferenca no resultado final.",
    }
  }
  return {
    emoji: "📊",
    headline: "Grande empresa",
    detail: "O impacto em valor absoluto e significativo. Cada ponto percentual conta.",
  }
}

// ---------------------------------------------------------------------------
// Folha (payroll ratio) insights
// ---------------------------------------------------------------------------

export function getFolhaInsight(fatorR: number): Insight {
  if (fatorR > 50) {
    return {
      emoji: "💰",
      headline: "Folha alta = menos creditos",
      detail: "A maior parte dos seus custos nao gera credito no novo sistema. Isso aumenta a carga.",
    }
  }
  if (fatorR > 25) {
    return {
      emoji: "💰",
      headline: "Folha moderada",
      detail: "Parte dos custos gera credito, parte nao. O impacto depende dos outros fatores.",
    }
  }
  return {
    emoji: "💰",
    headline: "Folha baixa = mais creditos",
    detail: "Com menos gastos em pessoal, voce aproveita mais creditos sobre outros custos.",
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
        headline: "Materiais geram credito total",
        detail: "Cada compra de insumo vira credito de IBS/CBS. Boa noticia para sua empresa.",
      }
    case "servicos":
      return {
        emoji: "🔧",
        headline: "Servicos terceirizados: credito parcial",
        detail: "Servicos geram credito, mas depende de como o fornecedor emite a nota.",
      }
    case "folha":
      return {
        emoji: "👥",
        headline: "Folha nao gera credito",
        detail: "Salarios e encargos ficam fora do sistema de creditos. Isso pesa na conta final.",
      }
    case "misto":
      return {
        emoji: "⚖️",
        headline: "Custos equilibrados",
        detail: "A parte de materiais gera credito; a de pessoal, nao. Resultado intermediario.",
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
      headline: "Atencao: creditos B2B",
      detail: "No Simples, seus clientes PJ nao aproveitam creditos. Avalie o Simples Hibrido.",
    }
  }
  if (perfil === "b2b") {
    return {
      emoji: "🏢",
      headline: "Vendas B2B: cadeia de creditos",
      detail: "Seus clientes vao querer credito. Estar fora do Simples e vantagem aqui.",
    }
  }
  if (perfil === "b2c") {
    return {
      emoji: "👤",
      headline: "Vendas ao consumidor final",
      detail: "O consumidor nao usa credito. Seu impacto depende mais da aliquota do que da cadeia.",
    }
  }
  // misto
  return {
    emoji: "🔄",
    headline: "Publico misto",
    detail: "A parte B2B exige atencao aos creditos. A parte B2C depende mais da aliquota.",
  }
}

// ---------------------------------------------------------------------------
// Export de servicos insights (conditional step)
// ---------------------------------------------------------------------------

export function getExportInsight(exporta: boolean): Insight {
  if (exporta) {
    return {
      emoji: "🌍",
      headline: "Exportacao = imposto zero",
      detail: "Servicos exportados tem aliquota zero de IBS/CBS. Oportunidade de expansao.",
    }
  }
  return {
    emoji: "🏠",
    headline: "Mercado interno",
    detail: "Sem exportacao, a aliquota padrao se aplica integralmente.",
  }
}
