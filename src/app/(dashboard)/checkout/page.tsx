"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  CheckCircle,
  CreditCard,
  Loader2,
  Sparkles,
  Tag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { redeemPromoCode } from "./actions"
import { useAnalytics } from "@/lib/analytics/track"

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
  const { track } = useAnalytics()
  const trackedRef = useRef(false)

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true
      track("checkout_viewed")
    }
  }, [track])
  const [stripeLoading, setStripeLoading] = useState(false)
  const [stripeError, setStripeError] = useState<string | null>(null)

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
      track("diagnostic_purchased", { method: "promo_code" })
      setTimeout(() => {
        router.push("/diagnostico?unlocked=true")
      }, 1500)
    }
  }

  async function handleStripeCheckout() {
    setStripeLoading(true)
    setStripeError(null)

    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        setStripeError(data.error || "Erro ao iniciar pagamento")
        setStripeLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      setStripeError("Erro de conexão. Tente novamente.")
      setStripeLoading(false)
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
            <div className="flex items-baseline gap-2">
              <span className="text-lg text-muted-foreground line-through">R$97</span>
              <span className="text-3xl font-bold">R$49</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                Preço de lançamento
              </span>
              <span className="text-sm text-muted-foreground">Pagamento único — sem assinatura</span>
            </div>
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

            {/* Stripe checkout */}
            <Button
              className="w-full"
              size="lg"
              onClick={handleStripeCheckout}
              disabled={stripeLoading}
            >
              {stripeLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              {stripeLoading ? "Redirecionando..." : "Pagar R$49 com cartão"}
            </Button>
            {stripeError && (
              <p className="text-sm text-destructive text-center">{stripeError}</p>
            )}

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
