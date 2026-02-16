"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getURL } from "@/lib/get-url"

function translateAuthError(message: string): string {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos.",
    "Email not confirmed": "Email ainda nao confirmado. Verifique sua caixa de entrada.",
    "User already registered": "Este email ja esta cadastrado.",
    "Unable to validate email address: invalid format": "Formato de email invalido.",
    "User not found": "Usuario nao encontrado.",
    "Signups not allowed for otp": "Nenhuma conta encontrada com este email. Crie uma conta primeiro.",
    "For security purposes, you can only request this once every 60 seconds": "Aguarde 60 segundos antes de solicitar outro link.",
    "OTP expired": "O link expirou. Solicite um novo.",
  }
  return errorMap[message] || message
}

export async function signupWithMagicLink(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const nome = formData.get("nome") as string
  const from = formData.get("from") as string | null

  const callbackUrl = from === "simulador"
    ? `${getURL()}auth/callback?next=/diagnostico`
    : `${getURL()}auth/callback`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      data: { nome },
      emailRedirectTo: callbackUrl,
      shouldCreateUser: true,
    },
  })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  return { success: true }
}

export async function loginWithMagicLink(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const redirectTo = (formData.get("redirect") as string) || "/dashboard"

  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//") && !redirectTo.includes("@")
    ? redirectTo
    : "/dashboard"

  const callbackUrl = `${getURL()}auth/callback?next=${encodeURIComponent(safeRedirect)}`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: callbackUrl,
      shouldCreateUser: false,
    },
  })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  return { success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
