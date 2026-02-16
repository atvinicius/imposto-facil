import { type EmailOtpType } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return buildRedirect(next)
    }
  }

  // Token hash flow (fallback): verify OTP directly
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash })
    if (!error) {
      return buildRedirect(next)
    }
  }

  // Preserve the intended redirect so the user can still get there after re-authenticating
  const errorRedirect = next !== "/dashboard"
    ? `/login?error=auth_callback_error&redirect=${encodeURIComponent(next)}`
    : `/login?error=auth_callback_error`

  return buildRedirect(errorRedirect)
}
