import { Card, CardContent } from "@/components/ui/card"
import { PricingCard } from "./pricing-card"
import { PRICING_TIERS } from "@/lib/landing-data"
import { Shield } from "lucide-react"

export function PricingSection() {
  return (
    <section id="precos" className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Planos para cada necessidade
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Comece gratis e evolua conforme sua empresa cresce
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {PRICING_TIERS.map((tier) => (
              <PricingCard key={tier.name} {...tier} />
            ))}
          </div>

          {/* Guarantee */}
          <Card className="max-w-xl mx-auto border-green-500/20 bg-green-500/5">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-full shrink-0">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">
                    Garantia de 7 dias
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Se voce nao ficar satisfeito com o plano pago, devolvemos
                    100% do seu dinheiro nos primeiros 7 dias. Sem perguntas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
