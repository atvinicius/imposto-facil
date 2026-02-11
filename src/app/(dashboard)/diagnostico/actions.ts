"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { SimuladorInput, SimuladorResult, SimuladorTeaser } from "@/lib/simulator"
import { simulatorInputToProfile } from "@/lib/simulator"

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
