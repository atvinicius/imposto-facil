import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-foreground"
            >
              ImpostoFácil
            </Link>
            <span className="hidden text-muted-foreground sm:inline">|</span>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/simulador"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Simulador
              </Link>
              <Link
                href="/conhecimento"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Conhecimento
              </Link>
              <Link
                href="/assistente"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Assistente
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link
                href="/termos"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Termos
              </Link>
              <Link
                href="/privacidade"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacidade
              </Link>
            </nav>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 ImpostoFácil. Conteúdo educacional, não substitui
            orientação profissional.
          </p>
        </div>
      </div>
    </footer>
  )
}
