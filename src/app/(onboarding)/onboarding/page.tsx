import { redirect } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/supabase/server"
import { OnboardingWizard } from "./onboarding-wizard"

export default async function OnboardingPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getUserProfile()

  if (profile?.onboarding_completed_at) {
    redirect("/dashboard")
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao ImpostoFácil!</h1>
        <p className="text-muted-foreground mt-2">
          Vamos personalizar sua experiência em poucos passos.
        </p>
      </div>

      <OnboardingWizard
        initialData={{
          nome: profile?.nome || undefined,
          nivel_experiencia: profile?.nivel_experiencia || undefined,
          uf: profile?.uf || undefined,
          setor: profile?.setor || undefined,
          porte_empresa: profile?.porte_empresa || undefined,
          regime_tributario: profile?.regime_tributario || undefined,
          interesses: profile?.interesses || undefined,
        }}
      />
    </div>
  )
}
