import Link from "next/link"
import { ArrowRight, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CountdownTimer } from "./countdown-timer"

export function FinalCtaSection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Você vai pagar mais ou menos imposto?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Descubra agora. A simulação leva 60 segundos.
          </p>

          <div className="flex justify-center mb-8">
            <CountdownTimer compact />
          </div>

          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-lg px-8 py-6 h-auto"
          >
            <Link href="/simulador">
              <Calculator className="mr-2 h-5 w-5" />
              Fazer simulação gratuita
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <p className="text-sm opacity-75 mt-4">
            Sem cadastro. Sem cartão de crédito. Resultado imediato.
          </p>
        </div>
      </div>
    </section>
  )
}
