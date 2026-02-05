import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="font-semibold mb-3">ImpostoFácil</h3>
            <p className="text-sm text-muted-foreground">
              Preparando empresários brasileiros para a reforma tributária com
              ferramentas simples e informação de qualidade.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium mb-3 text-sm">Recursos</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link
                href="/simulador"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Simulador de Impacto
              </Link>
              <Link
                href="/conhecimento"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Base de Conhecimento
              </Link>
              <Link
                href="/assistente"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Assistente IA
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-medium mb-3 text-sm">Legal</h4>
            <nav className="flex flex-col gap-2 text-sm">
              <Link
                href="/termos"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Termos de Uso
              </Link>
              <Link
                href="/privacidade"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Política de Privacidade
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 ImpostoFácil. Todos os direitos reservados.
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            As informações fornecidas são apenas para fins educacionais e não
            constituem aconselhamento jurídico ou tributário. Consulte um
            profissional qualificado para orientação específica.
          </p>
        </div>
      </div>
    </footer>
  )
}
