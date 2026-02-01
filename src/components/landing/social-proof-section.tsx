import { Card, CardContent } from "@/components/ui/card"
import { STATS, TESTIMONIALS, TRUST_BADGES } from "@/lib/landing-data"
import { Shield, FileCheck, Lock } from "lucide-react"

const trustIcons = [Shield, FileCheck, Lock]

export function SocialProofSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {STATS.companies}
              </div>
              <div className="text-muted-foreground">empresas usam</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {STATS.simulations}
              </div>
              <div className="text-muted-foreground">simulacoes feitas</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {STATS.satisfaction}
              </div>
              <div className="text-muted-foreground">satisfacao</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">
                {STATS.articles}
              </div>
              <div className="text-muted-foreground">artigos na base</div>
            </div>
          </div>

          {/* Testimonials */}
          <h2 className="text-3xl font-bold text-center mb-8">
            O que nossos usuarios dizem
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {TESTIMONIALS.map((testimonial) => (
              <Card key={testimonial.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-8">
            {TRUST_BADGES.map((badge, index) => {
              const Icon = trustIcons[index]
              return (
                <div key={badge.title} className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{badge.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {badge.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
