import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  limitations: string[]
  cta: string
  highlighted?: boolean
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  limitations,
  cta,
  highlighted = false,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex flex-col",
        highlighted && "border-primary shadow-xl scale-105 z-10"
      )}
    >
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Mais popular
        </Badge>
      )}
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ul className="space-y-3 flex-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
          {limitations.map((limitation) => (
            <li key={limitation} className="flex items-start gap-2">
              <X className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{limitation}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button
            className="w-full"
            variant={highlighted ? "default" : "outline"}
            asChild
          >
            <Link href="/signup">{cta}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
