import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
}

export default function GuiasLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="rounded-full bg-primary/10 p-1.5 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            ImpostoFacil
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/simulador" className="text-muted-foreground transition-colors hover:text-foreground">
              Simulador
            </Link>
            <Link href="/guias" className="text-foreground font-medium">
              Guias
            </Link>
            <Link href="/login" className="text-muted-foreground transition-colors hover:text-foreground">
              Login
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Ja tenho conta</Link>
            </Button>
            <Button asChild>
              <Link href="/simulador">
                Simular impacto
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 bg-white">
        <div className="container mx-auto px-4 py-8">
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs leading-5 text-amber-800">
            O ImpostoFacil e uma ferramenta educacional. As informacoes e simulacoes apresentadas
            tem carater informativo e nao substituem a orientacao de um contador ou advogado tributarista.
            Conteudo baseado na EC 132/2023 e LC 214/2025.
          </p>
          <div className="flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 ImpostoFacil. Todos os direitos reservados.</p>
            <div className="flex items-center gap-5">
              <Link href="/guias" className="transition-colors hover:text-slate-900">
                Guias
              </Link>
              <Link href="/simulador" className="transition-colors hover:text-slate-900">
                Simulador
              </Link>
              <Link href="/termos" className="transition-colors hover:text-slate-900">
                Termos
              </Link>
              <Link href="/privacidade" className="transition-colors hover:text-slate-900">
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
