import { type NextRequest, NextResponse } from "next/server"

/**
 * Redirects to /auth/callback preserving all query params.
 * Ensures a single code path for all auth verification
 * regardless of which URL Supabase email templates point to.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"

  const base = !isLocalEnv && forwardedHost
    ? `https://${forwardedHost}`
    : origin

  const callbackUrl = new URL(`${base}/auth/callback`)
  searchParams.forEach((value, key) => {
    callbackUrl.searchParams.set(key, value)
  })

  return NextResponse.redirect(callbackUrl.toString())
}
