import Link from "next/link"
import { ArrowRight, Calculator, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CountdownTimer } from "./countdown-timer"

export function HeroSection() {
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Urgency Badge */}
          <Badge variant="destructive" className="mb-6 px-4 py-2 text-sm animate-pulse">
            <Clock className="h-3 w-3 mr-1" />
            Período sem multas acaba em abril
          </Badge>

          {/* Countdown */}
          <div className="mb-8">
            <CountdownTimer />
          </div>

          {/* Main Headline - Now focused on the simulator hook */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Descubra em{" "}
            <span className="text-primary">60 segundos</span>{" "}
            se sua empresa vai pagar mais imposto
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
            A reforma tributária já começou. Empresas de serviços podem ter aumento de até{" "}
            <strong className="text-foreground">300% na carga tributária</strong>.
            Faça a simulação gratuita e descubra o impacto no seu negócio.
          </p>

          {/* Stats that create urgency */}
          <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-red-500" />
              <span><strong className="text-foreground">83%</strong> dos empresários não estão preparados</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calculator className="h-4 w-4 text-primary" />
              <span><strong className="text-foreground">15.000+</strong> simulações realizadas</span>
            </div>
          </div>

          {/* Primary CTA - Goes to simulator */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button size="lg" asChild className="text-lg px-8 py-6 h-auto">
              <Link href="/simulador">
                <Calculator className="mr-2 h-5 w-5" />
                Simular impacto na minha empresa
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Gratuito. Sem cadastro. Resultado em 60 segundos.
          </p>

          {/* Social proof mini */}
          <div className="mt-8 pt-8 border-t border-border/50 w-full max-w-lg">
            <p className="text-xs text-muted-foreground mb-3">Empresas que já fizeram a simulação:</p>
            <div className="flex justify-center items-center gap-4 opacity-60">
              {/* Placeholder logos - in production, use real company logos */}
              <div className="h-6 w-20 bg-muted rounded" />
              <div className="h-6 w-24 bg-muted rounded" />
              <div className="h-6 w-16 bg-muted rounded" />
              <div className="h-6 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
