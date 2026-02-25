import { type EmailOtpType, type User } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { simulatorInputToProfile } from "@/lib/simulator/storage"
import type { SimuladorInput } from "@/lib/simulator/types"

/**
 * Saves simulator data from user metadata to the user profile.
 * Called after successful auth — handles the cross-device case where
 * localStorage is unavailable.
 */
async function saveSimulatorMetadataToProfile(user: User) {
  const simulatorInput = user.user_metadata?.simulator_input as SimuladorInput | undefined
  if (!simulatorInput?.setor || !simulatorInput?.uf || !simulatorInput?.faturamento) {
    return // No simulator data in metadata
  }

  const admin = createAdminClient()

  // Check if profile already has simulator data (idempotent)
  const { data: existing } = await admin
    .from("user_profiles")
    .select("setor, uf, faturamento")
    .eq("id", user.id)
    .single()

  if (existing?.setor && existing?.uf && existing?.faturamento) {
    return // Profile already has data — don't overwrite
  }

  const profileData = simulatorInputToProfile(simulatorInput)

  await admin
    .from("user_profiles")
    .update({
      ...profileData,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id)
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const nextParam = searchParams.get("next") ?? "/dashboard"
  // Validate redirect to prevent open redirect attacks
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") && !nextParam.includes("@")
    ? nextParam
    : "/dashboard"

  const supabase = await createClient()

  function buildRedirect(path: string) {
    const forwardedHost = request.headers.get("x-forwarded-host")
    const isLocalEnv = process.env.NODE_ENV === "development"
    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${path}`)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${path}`)
    } else {
      return NextResponse.redirect(`${origin}${path}`)
    }
  }

  // PKCE flow: exchange code for session
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      await saveSimulatorMetadataToProfile(data.user)
      return buildRedirect(next)
    }
  }

  // Token hash flow (implicit/magic link): verify OTP directly
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error && data.user) {
      await saveSimulatorMetadataToProfile(data.user)
      return buildRedirect(next)
    }
  }

  // Preserve the intended redirect so the user can still get there after re-authenticating
  const errorRedirect = next !== "/dashboard"
    ? `/login?error=auth_callback_error&redirect=${encodeURIComponent(next)}`
    : `/login?error=auth_callback_error`

  return buildRedirect(errorRedirect)
}
