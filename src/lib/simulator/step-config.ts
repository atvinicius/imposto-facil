/**
 * Step Sequencing for Adaptive Simulator
 *
 * Defines the ordered list of steps, including conditional steps
 * that only appear based on prior answers.
 */

import type { Setor } from "./types"
import { UF_INCENTIVOS_FISCAIS } from "./tax-data"

export interface StepDefinition {
  id: string
  title: string
  subtitle: string
  /** If present, step only shows when condition returns true */
  condition?: (answers: StepAnswers) => boolean
}

/** Collected answers used to evaluate conditions */
export interface StepAnswers {
  setor?: Setor | null
  uf?: string
  regime?: string | null
  temIncentivoICMS?: string | null
  exportaServicos?: boolean | null
}

const INCENTIVE_UFS = new Set(Object.keys(UF_INCENTIVOS_FISCAIS))

export const STEP_DEFINITIONS: StepDefinition[] = [
  {
    id: "setor",
    title: "Qual o setor da sua empresa?",
    subtitle: "Alguns setores serão mais impactados pela reforma",
  },
  {
    id: "uf",
    title: "Em qual estado sua empresa está?",
    subtitle: "A localização influencia incentivos e alíquotas",
  },
  {
    id: "icms",
    title: "Sua empresa tem incentivo fiscal de ICMS?",
    subtitle: "Benefícios como PRODUZIR, DESENVOLVE ou similares do seu estado",
    condition: (a) => !!a.uf && INCENTIVE_UFS.has(a.uf),
  },
  {
    id: "regime",
    title: "Qual o regime tributário?",
    subtitle: "Isso determina como a reforma vai te impactar",
  },
  {
    id: "faturamento",
    title: "Qual o faturamento anual?",
    subtitle: "Use o valor aproximado — quanto mais preciso, melhor o resultado",
  },
  {
    id: "folha",
    title: "Quanto da receita vai para folha de pagamento?",
    subtitle: "Folha não gera crédito de IBS/CBS — isso impacta sua carga",
  },
  {
    id: "custo",
    title: "Qual o principal tipo de custo?",
    subtitle: "Custos com insumos geram crédito; folha não",
  },
  {
    id: "clientes",
    title: "Para quem você vende?",
    subtitle: "Clientes PJ no Simples não aproveitam crédito integral",
  },
  {
    id: "exporta",
    title: "Sua empresa exporta serviços?",
    subtitle: "Exportação de serviços para o exterior",
    condition: (a) =>
      a.setor === "tecnologia" || a.setor === "servicos" || a.setor === "educacao",
  },
]

/**
 * Returns only the steps that are active given current answers.
 */
export function getActiveSteps(answers: StepAnswers): StepDefinition[] {
  return STEP_DEFINITIONS.filter((step) => !step.condition || step.condition(answers))
}

/**
 * Returns display step numbers (1-indexed) for progress display.
 */
export function getStepProgress(activeSteps: StepDefinition[], currentIndex: number): {
  current: number
  total: number
} {
  return {
    current: currentIndex + 1,
    total: activeSteps.length,
  }
}
