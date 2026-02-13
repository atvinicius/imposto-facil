"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { SimuladorInput, SimuladorResult, SimuladorTeaser } from "@/lib/simulator"
import { simulatorInputToProfile } from "@/lib/simulator"
import type { TipoCustoPrincipal } from "@/lib/simulator/types"

interface SaveSimulatorDataInput {
  input: SimuladorInput
  result: SimuladorResult
  teaser: SimuladorTeaser
}

export async function saveSimulatorDataToProfile(data: SaveSimulatorDataInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autorizado" }
  }

  const profileFields = simulatorInputToProfile(data.input)

  const updateData = {
    uf: profileFields.uf,
    setor: profileFields.setor,
    porte_empresa: profileFields.porte_empresa,
    regime_tributario: profileFields.regime_tributario || null,
    faturamento: profileFields.faturamento,
    simulator_result: data.result as unknown as Record<string, unknown>,
    onboarding_completed_at: new Date().toISOString(),
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_profiles")
    .update(updateData)
    .eq("id", user.id)

  if (error) {
    console.error("Error saving simulator data:", error)
    return { error: "Erro ao salvar dados da simulação" }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

interface ChecklistProgressData {
  completed: string[]
  updated_at: string | null
}

export async function toggleChecklistItem(itemId: string): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Não autorizado" }
  }

  // Read current progress
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from("user_profiles")
    .select("checklist_progress")
    .eq("id", user.id)
    .single()

  const progress: ChecklistProgressData = (profile?.checklist_progress as ChecklistProgressData) ?? {
    completed: [],
    updated_at: null,
  }

  // Toggle item
  const idx = progress.completed.indexOf(itemId)
  if (idx === -1) {
    progress.completed.push(itemId)
  } else {
    progress.completed.splice(idx, 1)
  }
  progress.updated_at = new Date().toISOString()

  // Write back
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_profiles")
    .update({ checklist_progress: progress })
    .eq("id", user.id)

  if (error) {
    console.error("Error toggling checklist item:", error)
    return { error: "Erro ao atualizar checklist" }
  }

  revalidatePath("/diagnostico")
  return {}
}

export interface EnhancedProfileInput {
  fatorR?: number
  pctB2B?: number
  tipoCusto?: TipoCustoPrincipal
}

export async function saveEnhancedProfile(data: EnhancedProfileInput): Promise<{ error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Nao autorizado" }
  }

  const updateData: Record<string, unknown> = {}
  if (data.fatorR !== undefined) updateData.fator_r_estimado = data.fatorR
  if (data.pctB2B !== undefined) updateData.pct_b2b = data.pctB2B
  if (data.tipoCusto) updateData.tipo_custo_principal = data.tipoCusto

  if (Object.keys(updateData).length === 0) {
    return { error: "Nenhum dado para salvar" }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_profiles")
    .update(updateData)
    .eq("id", user.id)

  if (error) {
    console.error("Error saving enhanced profile:", error)
    return { error: "Erro ao salvar dados do perfil" }
  }

  revalidatePath("/diagnostico")
  return {}
}
