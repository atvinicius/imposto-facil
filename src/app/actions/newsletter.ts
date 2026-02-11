"use server"

import { createAdminClient } from "@/lib/supabase/admin"

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/

export async function subscribeNewsletter(
  email: string,
  source: "landing" | "dashboard"
): Promise<{ success?: boolean; error?: string }> {
  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: "Por favor, insira um email válido." }
  }

  const supabase = createAdminClient()

  // Check if already subscribed
  const { data: existing } = await supabase
    .from("newsletter_subscribers")
    .select("id, unsubscribed_at")
    .eq("email", email.toLowerCase())
    .single()

  if (existing) {
    if (existing.unsubscribed_at) {
      // Re-subscribe
      await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed_at: null, subscribed_at: new Date().toISOString() })
        .eq("id", existing.id)
      return { success: true }
    }
    return { error: "Este email já está inscrito." }
  }

  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email: email.toLowerCase(), source })

  if (error) {
    console.error("Newsletter subscribe error:", error)
    return { error: "Erro ao se inscrever. Tente novamente." }
  }

  return { success: true }
}
