import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HOW_IT_WORKS_STEPS } from "@/lib/landing-data"

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Como funciona
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Comece a se preparar em menos de 5 minutos
          </p>

          <div className="relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-border" />

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {HOW_IT_WORKS_STEPS.map((step) => {
                const Icon = step.icon
                return (
                  <div key={step.number} className="relative text-center">
                    {/* Circle with icon */}
                    <div className="relative mx-auto mb-6">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Icon className="h-10 w-10 text-primary" />
                      </div>
                      {/* Step number badge */}
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {step.number}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild className="text-base px-8">
              <Link href="/signup">
                Comecar agora - e gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
