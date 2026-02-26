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

/**
 * Resolves the post-auth redirect destination from multiple sources.
 * Priority: URL ?next param > user metadata > /dashboard default.
 * Handles both relative paths (/diagnostico) and full same-origin URLs.
 */
function resolveRedirect(nextParam: string | null, user: User | null, appOrigin: string): string {
  const candidates = [
    nextParam,
    user?.user_metadata?.redirect_to as string | undefined,
  ]

  for (const raw of candidates) {
    if (!raw) continue

    // Relative path — use directly
    if (raw.startsWith("/") && !raw.startsWith("//") && !raw.includes("@")) {
      return raw
    }

    // Full URL — extract path if same origin
    try {
      const url = new URL(raw)
      const origin = new URL(appOrigin)
      if (url.host === origin.host) {
        return url.pathname
      }
    } catch {
      // Not a valid URL — skip
    }
  }

  return "/dashboard"
}

/**
 * Auth callback handler.
 *
 * Handles two flows:
 *
 * 1. token_hash + type → verifyOtp()
 *    Email auth (magic link, signup confirmation).
 *    Requires custom Supabase email templates that send token_hash
 *    directly as a query parameter. This is the Supabase-recommended
 *    approach for SSR and works cross-device since no cookies are needed.
 *    See: https://supabase.com/docs/guides/auth/server-side/nextjs
 *
 * 2. code → exchangeCodeForSession()
 *    OAuth (Google sign-in) and PKCE email flow (before custom templates).
 *    Uses code_verifier from cookies, so same-device only.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type") as EmailOtpType | null
  const nextParam = searchParams.get("next")

  const supabase = await createClient()
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL || origin

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

  // Flow 1: Token hash verification (email auth — magic link / signup)
  // token_hash comes directly in the URL from custom email templates.
  // No cookies/PKCE needed — works cross-device.
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error && data.user) {
      await saveSimulatorMetadataToProfile(data.user)
      const next = resolveRedirect(nextParam, data.user, appOrigin)
      const isNewSignup = type === "signup" || type === "email"
      const sep = next.includes("?") ? "&" : "?"
      return buildRedirect(isNewSignup ? `${next}${sep}signup=1` : next)
    }
  }

  // Flow 2: PKCE code exchange (OAuth / pre-template-change email auth)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      await saveSimulatorMetadataToProfile(data.user)
      const next = resolveRedirect(nextParam, data.user, appOrigin)
      // For OAuth, check if user was created in the last 60 seconds (new signup)
      const isNew = data.user.created_at &&
        Date.now() - new Date(data.user.created_at).getTime() < 60_000
      const sep = next.includes("?") ? "&" : "?"
      return buildRedirect(isNew ? `${next}${sep}signup=1` : next)
    }
  }

  // Both flows failed — redirect to login with error
  const next = resolveRedirect(nextParam, null, appOrigin)
  const errorRedirect = next !== "/dashboard"
    ? `/login?error=auth_callback_error&redirect=${encodeURIComponent(next)}`
    : `/login?error=auth_callback_error`

  return buildRedirect(errorRedirect)
}
