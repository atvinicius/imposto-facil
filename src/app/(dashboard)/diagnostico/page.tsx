import { getUserProfile, getUser } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createStripeClient } from "@/lib/stripe/client"
import { calcularSimulacao } from "@/lib/simulator"
import type { SimuladorInput, SimuladorResult, FaixaFaturamento, RegimeTributario, Setor, TipoCustoPrincipal } from "@/lib/simulator"
import { DiagnosticoClient } from "./diagnostico-client"
import { DiagnosticoReport } from "./diagnostico-report"

interface DiagnosticoPageProps {
  searchParams: Promise<{ unlocked?: string; session_id?: string }>
}

/**
 * Verify a Stripe checkout session and grant access if paid.
 * This handles the race condition where the user is redirected back
 * before the Stripe webhook has fired.
 */
async function verifyStripeSession(sessionId: string, userId: string): Promise<boolean> {
  try {
    const stripe = createStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (
      session.payment_status === "paid" &&
      session.metadata?.supabase_user_id === userId
    ) {
      const supabase = createAdminClient()
      await supabase
        .from("user_profiles")
        .update({
          subscription_tier: "diagnostico",
          diagnostico_purchased_at: new Date().toISOString(),
          stripe_customer_id: (session.customer as string) || undefined,
          diagnostico_runs_remaining: 3,
        })
        .eq("id", userId)
      return true
    }
  } catch (e) {
    console.error("Failed to verify Stripe session:", e)
  }
  return false
}

export default async function DiagnosticoPage({ searchParams }: DiagnosticoPageProps) {
  const params = await searchParams
  const justUnlocked = params.unlocked === "true"
  let profile = await getUserProfile()

  // If redirected from Stripe checkout and profile isn't marked as paid yet,
  // verify the session directly with Stripe to avoid webhook race condition
  if (params.session_id && profile && !profile.diagnostico_purchased_at) {
    const user = await getUser()
    if (user) {
      const verified = await verifyStripeSession(params.session_id, user.id)
      if (verified) {
        // Re-fetch profile with updated payment status
        profile = await getUserProfile()
      }
    }
  }

  // Check if profile has enough data to generate a diagnostic
  const hasSimulatorData = profile?.setor && profile?.faturamento && profile?.uf

  if (!hasSimulatorData || !profile) {
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
  if (profile.tem_incentivo_icms) input.temIncentivoICMS = profile.tem_incentivo_icms as SimuladorInput["temIncentivoICMS"]
  if (profile.exporta_servicos != null) input.exportaServicos = profile.exporta_servicos

  // Always calculate fresh to use the latest calculator logic
  const result: SimuladorResult = calcularSimulacao(input)

  const isPaid = !!(profile.diagnostico_purchased_at || profile.subscription_tier === "diagnostico" || profile.subscription_tier === "pro")

  const runsRemaining = (profile as Record<string, unknown>).diagnostico_runs_remaining as number ?? 0

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
      runsRemaining={runsRemaining}
    />
  )
}
