import { getUserProfile } from "@/lib/supabase/server"
import { calcularSimulacao } from "@/lib/simulator"
import type { SimuladorInput, SimuladorResult, FaixaFaturamento, RegimeTributario, Setor } from "@/lib/simulator"
import { DiagnosticoClient } from "./diagnostico-client"
import { DiagnosticoReport } from "./diagnostico-report"

export default async function DiagnosticoPage() {
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

  // Use cached result if available, otherwise calculate fresh
  let result: SimuladorResult
  if (profile.simulator_result) {
    result = profile.simulator_result as unknown as SimuladorResult
  } else {
    result = calcularSimulacao(input)
  }

  const isPaid = !!(profile.diagnostico_purchased_at || profile.subscription_tier === "diagnostico" || profile.subscription_tier === "pro")

  return <DiagnosticoReport result={result} input={input} isPaid={isPaid} />
}
