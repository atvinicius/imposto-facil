"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type OnboardingData = {
  nome?: string
  nivel_experiencia?: string
  uf?: string
  setor?: string
  porte_empresa?: string
  regime_tributario?: string
  interesses?: string[]
}

type ProfileUpdate = {
  nome?: string | null
  nivel_experiencia?: string | null
  uf?: string | null
  setor?: string | null
  porte_empresa?: string | null
  regime_tributario?: string | null
  interesses?: string[] | null
  onboarding_completed_at?: string | null
  updated_at?: string
}

export async function saveOnboardingStep(data: OnboardingData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const updateData: ProfileUpdate = {
    nome: data.nome,
    nivel_experiencia: data.nivel_experiencia,
    uf: data.uf,
    setor: data.setor,
    porte_empresa: data.porte_empresa,
    regime_tributario: data.regime_tributario,
    interesses: data.interesses,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(updateData as never)
    .eq("id", user.id)

  if (error) {
    return { error: "Erro ao salvar dados" }
  }

  revalidatePath("/onboarding")
  return { success: true }
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const updateData: ProfileUpdate = {
    nome: data.nome,
    nivel_experiencia: data.nivel_experiencia,
    uf: data.uf,
    setor: data.setor,
    porte_empresa: data.porte_empresa,
    regime_tributario: data.regime_tributario,
    interesses: data.interesses,
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(updateData as never)
    .eq("id", user.id)

  if (error) {
    console.error("Supabase error completing onboarding:", error)
    return { error: "Erro ao completar onboarding" }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function skipOnboarding() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuário não autenticado" }
  }

  const updateData: ProfileUpdate = {
    onboarding_completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from("user_profiles")
    .update(updateData as never)
    .eq("id", user.id)

  if (error) {
    console.error("Supabase error skipping onboarding:", error)
    return { error: "Erro ao pular onboarding" }
  }

  revalidatePath("/dashboard")
  return { success: true }
}
