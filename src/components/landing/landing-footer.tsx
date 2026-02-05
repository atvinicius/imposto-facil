import Link from "next/link"

export function LandingFooter() {
  return (
    <footer className="border-t py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-bold">
              ImpostoFácil
            </Link>
            <p className="text-sm text-muted-foreground mt-2">
              Entenda a reforma tributária de forma simples e prepare sua
              empresa para as mudanças.
            </p>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/simulador"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Simulador de Impacto
                </Link>
              </li>
              <li>
                <Link
                  href="/conhecimento"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Base de Conhecimento
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Criar conta
                </Link>
              </li>
              <li>
                <Link
                  href="#precos"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h4 className="font-semibold mb-4">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/conhecimento/ibs"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Guia do IBS
                </Link>
              </li>
              <li>
                <Link
                  href="/conhecimento/cbs"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Guia da CBS
                </Link>
              </li>
              <li>
                <Link
                  href="/conhecimento/transicao"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cronograma de Transição
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/termos"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/privacidade"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:contato@impostofacil.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 ImpostoFácil. Todos os direitos reservados.
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center md:text-left">
            As informações fornecidas nesta plataforma são apenas para fins
            educacionais e não constituem aconselhamento jurídico ou tributário.
            Consulte um contador ou advogado tributarista para orientação
            específica ao seu caso.
          </p>
        </div>
      </div>
    </footer>
  )
}
