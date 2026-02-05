import { Card, CardContent } from "@/components/ui/card"
import { PROBLEM_STATS, BEFORE_AFTER } from "@/lib/landing-data"
import { X, Check, AlertTriangle } from "lucide-react"

export function ProblemSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            O caos tributário brasileiro
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Entenda por que a reforma é urgente e como ela vai mudar tudo
          </p>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {PROBLEM_STATS.map((stat) => (
              <Card key={stat.label} className="text-center">
                <CardContent className="pt-6">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.value}
                  </div>
                  <div className="font-semibold mb-1">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Before/After Comparison */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <X className="h-5 w-5 text-destructive" />
                  {BEFORE_AFTER.before.title}
                </h3>
                <ul className="space-y-3">
                  {BEFORE_AFTER.before.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <X className="h-4 w-4 text-destructive shrink-0 mt-1" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  {BEFORE_AFTER.after.title}
                </h3>
                <ul className="space-y-3">
                  {BEFORE_AFTER.after.items.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-green-600 shrink-0 mt-1" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Stakes Callout */}
          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardContent className="py-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg shrink-0">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">
                    O custo de não se preparar
                  </h3>
                  <p className="text-muted-foreground">
                    Empresas despreparadas podem perder de{" "}
                    <strong className="text-foreground">
                      R$ 50.000 a R$ 500.000
                    </strong>{" "}
                    em créditos tributários durante a transição, além de multas
                    por não conformidade e retrabalho em sistemas.
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
