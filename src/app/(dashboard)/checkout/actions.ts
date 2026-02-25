"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database"

const VALID_PROMO_CODES: Record<string, { tier: "diagnostico" | "pro"; label: string }> = {
  amigos: { tier: "diagnostico", label: "Amigos ImpostoFácil" },
}

export async function redeemPromoCode(code: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autorizado" }
  }

  const normalizedCode = code.trim().toLowerCase()
  const promo = VALID_PROMO_CODES[normalizedCode]

  if (!promo) {
    return { error: "Código promocional inválido" }
  }

  // Check if user already has a paid tier
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const profile = data as Tables<"user_profiles"> | null

  const isPaid = !!(profile?.diagnostico_purchased_at || (profile?.subscription_tier && profile.subscription_tier !== "free"))

  // Block promo only if user still has runs remaining
  if (isPaid && (profile?.diagnostico_runs_remaining ?? 0) > 0) {
    return { error: "Você já possui o diagnóstico completo" }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_profiles")
    .update({
      subscription_tier: promo.tier,
      diagnostico_purchased_at: new Date().toISOString(),
      diagnostico_runs_remaining: 3,
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error redeeming promo code:", error)
    return { error: "Erro ao aplicar código. Tente novamente." }
  }

  revalidatePath("/", "layout")
  return { success: true, label: promo.label }
}
