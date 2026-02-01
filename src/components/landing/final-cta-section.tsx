import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CountdownTimer } from "./countdown-timer"

export function FinalCtaSection() {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nao deixe sua empresa para tras
          </h2>
          <p className="text-xl opacity-90 mb-8">
            A reforma vai acontecer. Sua empresa estara preparada?
          </p>

          <div className="flex justify-center mb-8">
            <CountdownTimer compact />
          </div>

          <Button
            size="lg"
            variant="secondary"
            asChild
            className="text-base px-8"
          >
            <Link href="/signup">
              Comecar gratis agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <p className="text-sm opacity-75 mt-4">
            Sem cartao de credito. Cancele quando quiser.
          </p>
        </div>
      </div>
    </section>
  )
}
