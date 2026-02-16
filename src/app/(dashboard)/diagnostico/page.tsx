import { getUserProfile } from "@/lib/supabase/server"
import { calcularSimulacao } from "@/lib/simulator"
import type { SimuladorInput, SimuladorResult, FaixaFaturamento, RegimeTributario, Setor, TipoCustoPrincipal } from "@/lib/simulator"
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

  const input: SimuladorInput = {
    regime: regimeMap[profile.regime_tributario || ""] || "nao_sei",
    setor: profile.setor as Setor,
    faturamento: profile.faturamento as FaixaFaturamento,
    uf: profile.uf!,
  }

  // Apply expanded simulator fields from profile (collected upfront)
  if (profile.faturamento_exato != null) input.faturamentoExato = Number(profile.faturamento_exato)
  if (profile.fator_r_estimado != null) input.fatorR = Number(profile.fator_r_estimado)
  if (profile.tipo_custo_principal) input.tipoCusto = profile.tipo_custo_principal as TipoCustoPrincipal
  if (profile.pct_b2b != null) input.pctB2B = Number(profile.pct_b2b)

  // Always calculate fresh to use the latest calculator logic
  const result: SimuladorResult = calcularSimulacao(input)

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
