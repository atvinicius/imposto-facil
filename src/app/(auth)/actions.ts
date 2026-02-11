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
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
    "Unable to validate email address: invalid format": "Formato de email invalido.",
    "Signup requires a valid password": "Senha obrigatoria.",
    "User not found": "Usuario nao encontrado.",
  }
  return errorMap[message] || message
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  const redirectTo = (formData.get("redirect") as string) || "/dashboard"
  // Validate redirect to prevent open redirect attacks
  const safeRedirect = redirectTo.startsWith("/") && !redirectTo.startsWith("//") && !redirectTo.includes("@")
    ? redirectTo
    : "/dashboard"

  revalidatePath("/", "layout")
  redirect(safeRedirect)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const nome = formData.get("nome") as string
  const from = formData.get("from") as string | null

  const callbackUrl = from === "simulador"
    ? `${getURL()}auth/callback?next=/diagnostico`
    : `${getURL()}auth/callback`

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome,
      },
      emailRedirectTo: callbackUrl,
    },
  })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  return { success: true }
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getURL()}auth/callback?next=/perfil/senha`,
  })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  return { success: "Enviamos um link para redefinir sua senha. Verifique seu email." }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get("password") as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
