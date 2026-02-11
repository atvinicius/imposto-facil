"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Nao autorizado" }
  }

  const nome = formData.get("nome") as string
  const uf = formData.get("uf") as string
  const setor = formData.get("setor") as string
  const porte_empresa = formData.get("porte_empresa") as string
  const nivel_experiencia = formData.get("nivel_experiencia") as string
  const regime_tributario = formData.get("regime_tributario") as string

  const updateData = {
    nome: nome || null,
    uf: uf || null,
    setor: setor || null,
    porte_empresa: porte_empresa || null,
    nivel_experiencia: nivel_experiencia || null,
    regime_tributario: regime_tributario || null,
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("user_profiles")
    .update(updateData)
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return { error: "Erro ao atualizar perfil" }
  }

  revalidatePath("/", "layout")
  return { success: true }
}
