"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle,
  CreditCard,
  Sparkles,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { redeemPromoCode } from "./actions"

const FEATURES = [
  "Todos os alertas com explicações detalhadas",
  "Checklist completo de adequação (15-20 itens)",
  "Projeção ano a ano de 2026 a 2033",
  "Análise de regime tributário (vale mudar?)",
  "Exportação em PDF para seu contador",
]

const FREE_FEATURES = [
  "Resumo do impacto em R$",
  "Nível de risco personalizado",
  "3 alertas principais",
  "2 ações recomendadas",
  "Cronograma de datas importantes",
]

export default function CheckoutPage() {
  const router = useRouter()
  const [promoCode, setPromoCode] = useState("")
  const [promoError, setPromoError] = useState<string | null>(null)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoSuccess, setPromoSuccess] = useState(false)

  async function handlePromoCode() {
    if (!promoCode.trim()) return

    setPromoLoading(true)
    setPromoError(null)

    const result = await redeemPromoCode(promoCode)

    if (result.error) {
      setPromoError(result.error)
      setPromoLoading(false)
    } else {
      setPromoSuccess(true)
      setTimeout(() => {
        router.push("/diagnostico?unlocked=true")
      }, 1500)
    }
  }

  if (promoSuccess) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <div className="mx-auto w-fit rounded-full bg-green-100 p-4">
          <Sparkles className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Diagnóstico desbloqueado!</h1>
        <p className="text-muted-foreground">Redirecionando para seu relatório completo...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Desbloqueie seu Diagnóstico Completo
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Acesse todas as análises, projeções e o checklist de adequação para preparar sua empresa.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Free tier */}
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="text-lg">Diagnóstico Básico</CardTitle>
            <p className="text-3xl font-bold">Grátis</p>
            <p className="text-sm text-muted-foreground">Seu plano atual</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Paid tier */}
        <Card className="border-2 border-primary relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground">Recomendado</Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-lg">Diagnóstico Completo</CardTitle>
            <p className="text-3xl font-bold">R$29</p>
            <p className="text-sm text-muted-foreground">Pagamento único — sem assinatura</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                <span className="font-medium">Tudo do plano grátis, mais:</span>
              </li>
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Stripe button (simulated) */}
            <Button className="w-full" size="lg" disabled>
              <CreditCard className="h-4 w-4 mr-2" />
              Pagar com cartão — em breve
            </Button>

            {/* Promo code */}
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tem um código promocional?
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o código"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value)
                    setPromoError(null)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handlePromoCode()}
                  disabled={promoLoading}
                />
                <Button
                  onClick={handlePromoCode}
                  disabled={promoLoading || !promoCode.trim()}
                  variant="outline"
                >
                  {promoLoading ? "..." : "Aplicar"}
                </Button>
              </div>
              {promoError && (
                <p className="text-sm text-destructive mt-2">{promoError}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button variant="ghost" asChild>
          <Link href="/diagnostico">
            Voltar ao diagnóstico
          </Link>
        </Button>
      </div>
    </div>
  )
}
