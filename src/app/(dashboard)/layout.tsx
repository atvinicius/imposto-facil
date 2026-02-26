import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { GoogleAdsConversion } from "@/components/google-ads-conversion"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const profile = await getUserProfile()
  const hasSimulatorData = Boolean(profile?.setor && profile?.faturamento && profile?.uf)

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Header
        user={{
          email: user.email,
          nome: profile?.nome || undefined,
        }}
        hasSimulatorData={hasSimulatorData}
      />
      <Suspense>
        <GoogleAdsConversion />
      </Suspense>
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}
