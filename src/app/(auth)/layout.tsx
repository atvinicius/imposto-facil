import { Logo } from "@/components/ui/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Logo />
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">{children}</div>
      </main>
      <footer className="py-4 text-center text-xs text-muted-foreground">
        <a href="/termos" className="hover:underline">Termos de Uso</a>
        {" · "}
        <a href="/privacidade" className="hover:underline">Política de Privacidade</a>
        {" · "}
        © 2026 ImpostoFácil
      </footer>
    </div>
  )
}
