import { getUserProfile, getUser } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createStripeClient } from "@/lib/stripe/client"
import { calcularSimulacao, buildSimulatorInputFromProfile } from "@/lib/simulator"
import type { SimuladorResult } from "@/lib/simulator"
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

  // Build input from profile data using shared utility
  const input = buildSimulatorInputFromProfile(profile)!

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
