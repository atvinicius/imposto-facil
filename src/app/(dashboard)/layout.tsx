import { redirect } from "next/navigation"
import { getUser, getUserProfile } from "@/lib/supabase/server"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={{
          email: user.email,
          nome: profile?.nome || undefined,
        }}
      />
      <main className="flex-1 container py-6">{children}</main>
      <Footer />
    </div>
  )
}
