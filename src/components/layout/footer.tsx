import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p>2024 ImpostoFacil. Todos os direitos reservados.</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
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
              Assistente
            </Link>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          As informacoes fornecidas sao apenas para fins educacionais e nao
          constituem aconselhamento juridico ou tributario. Consulte um
          profissional qualificado para orientacao especifica.
        </p>
      </div>
    </footer>
  )
}
