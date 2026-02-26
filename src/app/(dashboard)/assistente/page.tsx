import { getUserProfile } from "@/lib/supabase/server"
import { calcularSimulacao, buildSimulatorInputFromProfile } from "@/lib/simulator"
import { NIVEL_RISCO_LABELS } from "@/lib/simulator"
import { AssistenteClient } from "./assistente-client"
import type { DiagnosticSummary } from "@/components/chat/chat-welcome"

interface AssistentePageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function AssistentePage({ searchParams }: AssistentePageProps) {
  const params = await searchParams
  const initialQuestion = params.q || null

  // Load diagnostic data for personalized welcome
  let diagnosticSummary: DiagnosticSummary | null = null
  let isPaid = false

  try {
    const profile = await getUserProfile()
    if (profile) {
      isPaid = !!(
        profile.diagnostico_purchased_at ||
        profile.subscription_tier === "diagnostico" ||
        profile.subscription_tier === "pro"
      )

      const input = buildSimulatorInputFromProfile(profile)
      if (input) {
        const result = calcularSimulacao(input)
        diagnosticSummary = {
          riskLevel: NIVEL_RISCO_LABELS[result.nivelRisco].label,
          impactPercent: result.impactoAnual.percentual,
          sector: input.setor,
          regime: input.regime,
          alertCount: result.alertas.length,
          topAlert: result.alertas[0] || null,
          formalizationPressure: result.efetividadeTributaria?.pressaoFormalizacao || null,
        }
      }
    }
  } catch {
    // If profile loading fails, fall back to generic welcome
  }

  return (
    <AssistenteClient
      initialQuestion={initialQuestion}
      diagnosticSummary={diagnosticSummary}
      isPaid={isPaid}
    />
  )
}
