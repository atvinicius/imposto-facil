import { redirect } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/supabase/server"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getUserProfile()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">
          Configure suas informacoes para receber orientacoes personalizadas
        </p>
      </div>

      <ProfileForm
        initialData={{
          nome: profile?.nome || "",
          email: user.email || "",
          uf: profile?.uf || "",
          setor: profile?.setor || "",
          porte_empresa: profile?.porte_empresa || "",
        }}
      />
    </div>
  )
}
