import type { SimuladorInput, FaixaFaturamento, RegimeTributario, Setor, TipoCustoPrincipal } from "./types"

interface ProfileData {
  setor?: string | null
  faturamento?: string | null
  uf?: string | null
  regime_tributario?: string | null
  faturamento_exato?: number | string | null
  fator_r_estimado?: number | string | null
  tipo_custo_principal?: string | null
  pct_b2b?: number | string | null
  tem_incentivo_icms?: string | null
  exporta_servicos?: boolean | null
}

const REGIME_MAP: Record<string, RegimeTributario> = {
  "Simples Nacional": "simples",
  "Lucro Presumido": "lucro_presumido",
  "Lucro Real": "lucro_real",
}

/**
 * Converts a user profile object into a SimuladorInput.
 * Shared between diagnostico/page.tsx and assistente/page.tsx.
 */
export function buildSimulatorInputFromProfile(profile: ProfileData): SimuladorInput | null {
  if (!profile.setor || !profile.faturamento || !profile.uf) {
    return null
  }

  const input: SimuladorInput = {
    regime: REGIME_MAP[profile.regime_tributario || ""] || "nao_sei",
    setor: profile.setor as Setor,
    faturamento: profile.faturamento as FaixaFaturamento,
    uf: profile.uf,
  }

  if (profile.faturamento_exato != null) input.faturamentoExato = Number(profile.faturamento_exato)
  if (profile.fator_r_estimado != null) input.fatorR = Number(profile.fator_r_estimado)
  if (profile.tipo_custo_principal) input.tipoCusto = profile.tipo_custo_principal as TipoCustoPrincipal
  if (profile.pct_b2b != null) input.pctB2B = Number(profile.pct_b2b)
  if (profile.tem_incentivo_icms) input.temIncentivoICMS = profile.tem_incentivo_icms as SimuladorInput["temIncentivoICMS"]
  if (profile.exporta_servicos != null) input.exportaServicos = profile.exporta_servicos

  return input
}
