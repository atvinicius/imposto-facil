/**
 * Precomputes page data for programmatic SEO pages by reusing
 * the existing simulator calculator and tax-data registry.
 */

import { calcularSimulacao } from "@/lib/simulator/calculator"
import type { SimuladorInput, SimuladorResult, RegimeTributario, Setor } from "@/lib/simulator/types"
import {
  CARGA_ATUAL,
  CARGA_NOVA,
  FATOR_EFETIVIDADE,
  ICMS_ALIQUOTA_MODAL,
  ICMS_REFERENCIA_NACIONAL,
  MARGEM_BRUTA_ESTIMADA,
  SETORES_ICMS,
  UF_INCENTIVOS_FISCAIS,
  TRANSICAO_TIMELINE,
} from "@/lib/simulator/tax-data"
import {
  SEO_SETORES,
  SEO_REGIMES,
  ALL_UFS,
  SETOR_DISPLAY,
  REGIME_DISPLAY,
  UF_DISPLAY,
  type SeoSetor,
  type SeoRegime,
} from "./slug-maps"

// ---------------------------------------------------------------------------
// Combination generators
// ---------------------------------------------------------------------------

export function getAllSetorUfCombinations(): { setor: SeoSetor; uf: string }[] {
  return SEO_SETORES.flatMap((setor) =>
    ALL_UFS.map((uf) => ({ setor, uf }))
  )
}

export function getAllSetorRegimeCombinations(): { setor: SeoSetor; regime: SeoRegime }[] {
  return SEO_SETORES.flatMap((setor) =>
    SEO_REGIMES.map((regime) => ({ setor, regime }))
  )
}

export function getValidSetores(): SeoSetor[] {
  return [...SEO_SETORES]
}

// ---------------------------------------------------------------------------
// Representative faturamento bracket for SEO pages (EPP midpoint)
// ---------------------------------------------------------------------------

const DEFAULT_FATURAMENTO = "360k_4.8m" as const

// ---------------------------------------------------------------------------
// Sector x State page data
// ---------------------------------------------------------------------------

export interface SetorUfRegimeData {
  regime: RegimeTributario
  regimeNome: string
  result: SimuladorResult
  cargaAtualMin: number
  cargaAtualMax: number
  cargaNovaMin: number
  cargaNovaMax: number
  efetividadeFator: number
}

export interface SetorUfPageData {
  setor: SeoSetor
  uf: string
  setorDisplay: (typeof SETOR_DISPLAY)[SeoSetor]
  ufDisplay: (typeof UF_DISPLAY)[string]
  regimes: SetorUfRegimeData[]
  icmsRate: number | null
  icmsSource: string | null
  icmsReferencia: number
  margemBruta: number | null
  isGoodsSector: boolean
  hasIncentivo: boolean
  incentivoText: string | null
  incentivoSource: string | null
  cargaNovaReducao: string | undefined
}

export function computeSetorUfData(setor: SeoSetor, uf: string): SetorUfPageData {
  const regimes = SEO_REGIMES.map((regime): SetorUfRegimeData => {
    const input: SimuladorInput = {
      regime,
      setor: setor as Setor,
      faturamento: DEFAULT_FATURAMENTO,
      uf: uf.toUpperCase(),
    }
    const result = calcularSimulacao(input)
    const cargaAtual = CARGA_ATUAL[regime][setor as Setor].value
    const cargaNova = CARGA_NOVA[setor as Setor].value
    const efetividade = FATOR_EFETIVIDADE[regime][setor as Setor].value

    return {
      regime,
      regimeNome: REGIME_DISPLAY[regime].nome,
      result,
      cargaAtualMin: cargaAtual.min,
      cargaAtualMax: cargaAtual.max,
      cargaNovaMin: cargaNova.min,
      cargaNovaMax: cargaNova.max,
      efetividadeFator: efetividade.medio,
    }
  })

  const ufUpper = uf.toUpperCase()
  const icmsData = ICMS_ALIQUOTA_MODAL[ufUpper]
  const margemData = MARGEM_BRUTA_ESTIMADA[setor as Setor]
  const incentivoData = UF_INCENTIVOS_FISCAIS[ufUpper]
  const cargaNova = CARGA_NOVA[setor as Setor]

  return {
    setor,
    uf: ufUpper,
    setorDisplay: SETOR_DISPLAY[setor],
    ufDisplay: UF_DISPLAY[ufUpper],
    regimes,
    icmsRate: icmsData?.value ?? null,
    icmsSource: icmsData?.source ?? null,
    icmsReferencia: ICMS_REFERENCIA_NACIONAL.value,
    margemBruta: margemData?.value ?? null,
    isGoodsSector: SETORES_ICMS.has(setor as Setor),
    hasIncentivo: !!incentivoData,
    incentivoText: incentivoData?.value ?? null,
    incentivoSource: incentivoData?.source ?? null,
    cargaNovaReducao: cargaNova.value.reducao,
  }
}

// ---------------------------------------------------------------------------
// Sector x Regime page data
// ---------------------------------------------------------------------------

export interface SetorRegimePageData {
  setor: SeoSetor
  regime: SeoRegime
  setorDisplay: (typeof SETOR_DISPLAY)[SeoSetor]
  regimeDisplay: (typeof REGIME_DISPLAY)[SeoRegime]
  result: SimuladorResult
  cargaAtualMin: number
  cargaAtualMax: number
  cargaNovaMin: number
  cargaNovaMax: number
  efetividadeFator: number
  efetividadeMin: number
  efetividadeMax: number
  cargaNovaReducao: string | undefined
  // Cross-state summary for goods sectors
  stateIcmsRange: { min: number; max: number; minUf: string; maxUf: string } | null
}

export function computeSetorRegimeData(setor: SeoSetor, regime: SeoRegime): SetorRegimePageData {
  const input: SimuladorInput = {
    regime,
    setor: setor as Setor,
    faturamento: DEFAULT_FATURAMENTO,
    uf: "SP", // representative state for regime analysis
  }
  const result = calcularSimulacao(input)
  const cargaAtual = CARGA_ATUAL[regime][setor as Setor].value
  const cargaNova = CARGA_NOVA[setor as Setor].value
  const efetividade = FATOR_EFETIVIDADE[regime][setor as Setor].value

  let stateIcmsRange: SetorRegimePageData["stateIcmsRange"] = null
  if (SETORES_ICMS.has(setor as Setor) && regime !== "simples") {
    let min = Infinity, max = -Infinity, minUf = "", maxUf = ""
    for (const uf of ALL_UFS) {
      const rate = ICMS_ALIQUOTA_MODAL[uf]?.value
      if (rate !== undefined) {
        if (rate < min) { min = rate; minUf = uf }
        if (rate > max) { max = rate; maxUf = uf }
      }
    }
    stateIcmsRange = { min, max, minUf, maxUf }
  }

  return {
    setor,
    regime,
    setorDisplay: SETOR_DISPLAY[setor],
    regimeDisplay: REGIME_DISPLAY[regime],
    result,
    cargaAtualMin: cargaAtual.min,
    cargaAtualMax: cargaAtual.max,
    cargaNovaMin: cargaNova.min,
    cargaNovaMax: cargaNova.max,
    efetividadeFator: efetividade.medio,
    efetividadeMin: efetividade.min,
    efetividadeMax: efetividade.max,
    cargaNovaReducao: cargaNova.reducao,
    stateIcmsRange,
  }
}

// ---------------------------------------------------------------------------
// State ICMS page data
// ---------------------------------------------------------------------------

export interface IcmsGoodsSectorData {
  setor: SeoSetor
  setorNome: string
  margemBruta: number
  ajustePp: number
  direcao: "favoravel" | "desfavoravel" | "neutro"
}

export interface IcmsUfPageData {
  uf: string
  ufDisplay: (typeof UF_DISPLAY)[string]
  icmsRate: number
  icmsSource: string
  icmsReferencia: number
  hasIncentivo: boolean
  incentivoText: string | null
  incentivoSource: string | null
  goodsSectors: IcmsGoodsSectorData[]
}

export function computeIcmsUfData(uf: string): IcmsUfPageData | null {
  const ufUpper = uf.toUpperCase()
  const icmsData = ICMS_ALIQUOTA_MODAL[ufUpper]
  if (!icmsData) return null

  const incentivoData = UF_INCENTIVOS_FISCAIS[ufUpper]
  const refRate = ICMS_REFERENCIA_NACIONAL.value

  const goodsSectorKeys: SeoSetor[] = ["comercio", "industria", "construcao", "agronegocio"]
  const goodsSectors = goodsSectorKeys.map((setor): IcmsGoodsSectorData => {
    const margemData = MARGEM_BRUTA_ESTIMADA[setor as Setor]
    const margin = margemData?.value ?? 0.25
    const ajustePp = Math.round(((icmsData.value - refRate) * margin) * 100) / 100
    const direcao: IcmsGoodsSectorData["direcao"] =
      ajustePp > 0.1 ? "desfavoravel" :
      ajustePp < -0.1 ? "favoravel" :
      "neutro"

    return {
      setor,
      setorNome: SETOR_DISPLAY[setor].nome,
      margemBruta: margin,
      ajustePp,
      direcao,
    }
  })

  return {
    uf: ufUpper,
    ufDisplay: UF_DISPLAY[ufUpper],
    icmsRate: icmsData.value,
    icmsSource: icmsData.source,
    icmsReferencia: refRate,
    hasIncentivo: !!incentivoData,
    incentivoText: incentivoData?.value ?? null,
    incentivoSource: incentivoData?.source ?? null,
    goodsSectors,
  }
}

// ---------------------------------------------------------------------------
// Timeline data for display
// ---------------------------------------------------------------------------

export function getTimelineHighlights() {
  return TRANSICAO_TIMELINE.filter((t) =>
    [2026, 2027, 2029, 2033].includes(t.ano)
  )
}

// ---------------------------------------------------------------------------
// Re-exports for convenience
// ---------------------------------------------------------------------------

export { SEO_SETORES, SEO_REGIMES, ALL_UFS, SETOR_DISPLAY, REGIME_DISPLAY, UF_DISPLAY }
export type { SeoSetor, SeoRegime }
