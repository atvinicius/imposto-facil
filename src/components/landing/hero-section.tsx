import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CountdownTimer } from "./countdown-timer"

export function HeroSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            A reforma entra em vigor em breve
          </Badge>

          <div className="mb-8">
            <CountdownTimer />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Sua empresa esta preparada para a{" "}
            <span className="text-primary">maior mudanca tributaria</span> dos
            ultimos 50 anos?
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            A reforma tributaria vai impactar todas as empresas brasileiras.
            Quem nao se preparar pode perder ate{" "}
            <strong className="text-foreground">15% de lucratividade</strong>{" "}
            com creditos perdidos e multas por nao conformidade.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/signup">
                Fazer simulacao gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base">
              <Link href="#como-funciona">Ver como funciona</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Usado por 2.500+ empresas. Sem cartao de credito.
          </p>
        </div>
      </div>
    </section>
  )
}
