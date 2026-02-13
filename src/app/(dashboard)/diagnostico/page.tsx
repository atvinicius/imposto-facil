import { getUserProfile } from "@/lib/supabase/server"
import { calcularSimulacao } from "@/lib/simulator"
import type { SimuladorInput, SimuladorResult, FaixaFaturamento, RegimeTributario, Setor, EnhancedProfile, TipoCustoPrincipal } from "@/lib/simulator"
import { DiagnosticoClient } from "./diagnostico-client"
import { DiagnosticoReport } from "./diagnostico-report"

interface DiagnosticoPageProps {
  searchParams: Promise<{ unlocked?: string }>
}

export default async function DiagnosticoPage({ searchParams }: DiagnosticoPageProps) {
  const params = await searchParams
  const justUnlocked = params.unlocked === "true"
  const profile = await getUserProfile()

  // Check if profile has enough data to generate a diagnostic
  const hasSimulatorData = profile?.setor && profile?.faturamento && profile?.uf

  if (!hasSimulatorData) {
    // Client component will try to load from localStorage and save to profile
    return <DiagnosticoClient />
  }

  // Build input from profile data
  const regimeMap: Record<string, RegimeTributario> = {
    "Simples Nacional": "simples",
    "Lucro Presumido": "lucro_presumido",
    "Lucro Real": "lucro_real",
  }

  // Build enhanced profile from progressive profiling data
  const enhanced: EnhancedProfile = {}
  if (profile.fator_r_estimado != null) enhanced.fatorR = Number(profile.fator_r_estimado)
  if (profile.pct_b2b != null) enhanced.pctB2B = Number(profile.pct_b2b)
  if (profile.tipo_custo_principal) enhanced.tipoCusto = profile.tipo_custo_principal as TipoCustoPrincipal
  if (profile.pct_interestadual != null) enhanced.pctInterestadual = Number(profile.pct_interestadual)
  if (profile.tem_incentivo_icms) enhanced.temIncentivoICMS = profile.tem_incentivo_icms as "sim" | "nao" | "nao_sei"
  if (profile.num_funcionarios) enhanced.numFuncionarios = profile.num_funcionarios
  if (profile.exporta_servicos != null) enhanced.exportaServicos = profile.exporta_servicos

  const hasEnhancedData = Object.keys(enhanced).length > 0

  const input: SimuladorInput = {
    regime: regimeMap[profile.regime_tributario || ""] || "nao_sei",
    setor: profile.setor as Setor,
    faturamento: profile.faturamento as FaixaFaturamento,
    uf: profile.uf!,
    ...(hasEnhancedData ? { enhanced } : {}),
  }

  // Always calculate fresh when enhanced data exists (cached result doesn't include it)
  let result: SimuladorResult
  if (profile.simulator_result && !hasEnhancedData) {
    result = profile.simulator_result as unknown as SimuladorResult
  } else {
    result = calcularSimulacao(input)
  }

  const isPaid = !!(profile.diagnostico_purchased_at || profile.subscription_tier === "diagnostico" || profile.subscription_tier === "pro")

  const checklistProgress = (profile.checklist_progress as { completed: string[]; updated_at: string | null } | null) ?? {
    completed: [],
    updated_at: null,
  }

  return (
    <DiagnosticoReport
      result={result}
      input={input}
      isPaid={isPaid}
      justUnlocked={justUnlocked}
      checklistProgress={checklistProgress}
    />
  )
}
