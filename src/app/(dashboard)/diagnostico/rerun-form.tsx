"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronDown, ChevronUp, RefreshCw, ShoppingCart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  calcularSimulacao,
  gerarTeaser,
  SETOR_OPTIONS,
  UF_OPTIONS,
  REGIME_OPTIONS,
  CUSTO_OPTIONS,
  PERFIL_CLIENTES_OPTIONS,
  deriveFaixaFaturamento,
  formatCurrency,
  parseCurrencyInput,
  pctB2BtoPerfilClientes,
  type SimuladorInput,
  type Setor,
  type RegimeTributario,
  type TipoCustoPrincipal,
  type PerfilClientes,
} from "@/lib/simulator"
import { useAnalytics } from "@/lib/analytics/track"
import { saveSimulatorDataToProfile } from "./actions"

interface RerunFormProps {
  currentInput: SimuladorInput
  isPaid: boolean
  runsRemaining: number
}

export function RerunForm({ currentInput, isPaid, runsRemaining }: RerunFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { track } = useAnalytics()

  // Form state, pre-filled from current input
  const [setor, setSetor] = useState<Setor>(currentInput.setor)
  const [uf, setUf] = useState(currentInput.uf)
  const [regime, setRegime] = useState<RegimeTributario>(currentInput.regime)
  const [faturamentoExato, setFaturamentoExato] = useState(currentInput.faturamentoExato ?? 0)
  const [faturamentoDisplay, setFaturamentoDisplay] = useState(
    currentInput.faturamentoExato ? formatCurrency(currentInput.faturamentoExato) : ""
  )
  const [fatorR, setFatorR] = useState(currentInput.fatorR ?? 30)
  const [tipoCusto, setTipoCusto] = useState<TipoCustoPrincipal>(currentInput.tipoCusto ?? "misto")
  const [perfilClientes, setPerfilClientes] = useState<PerfilClientes>(
    currentInput.perfilClientes ?? pctB2BtoPerfilClientes(currentInput.pctB2B)
  )

  const handleCurrencyChange = useCallback((raw: string) => {
    const value = parseCurrencyInput(raw)
    setFaturamentoExato(value)
    setFaturamentoDisplay(value > 0 ? formatCurrency(value) : "")
  }, [])

  const canSubmit = !!setor && !!uf && !!regime && faturamentoExato >= 1_000 && !!tipoCusto && !!perfilClientes

  // Paid user with 0 runs: show buy button instead
  const isRunLimitReached = isPaid && runsRemaining <= 0

  const handleSubmit = () => {
    if (!canSubmit || isRunLimitReached) return

    const faixaFaturamento = deriveFaixaFaturamento(faturamentoExato)
    const pctB2B = perfilClientes === "b2b" ? 85 : perfilClientes === "b2c" ? 15 : 50

    const newInput: SimuladorInput = {
      regime,
      setor,
      faturamento: faixaFaturamento,
      uf,
      faturamentoExato,
      fatorR,
      tipoCusto,
      perfilClientes,
      pctB2B,
    }

    const newResult = calcularSimulacao(newInput)
    const newTeaser = gerarTeaser(newResult, newInput)

    startTransition(async () => {
      const res = await saveSimulatorDataToProfile({
        input: newInput,
        result: newResult,
        teaser: newTeaser,
        isRerun: true,
      })

      if (res.error === "run_limit_reached") {
        track("diagnostic_rerun_limit_reached", { setor, regime, uf })
        return
      }

      if (res.success) {
        track("diagnostic_rerun", { setor, regime, uf, faturamentoExato })
        router.refresh()
        setOpen(false)
      }
    })
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* Trigger row */}
        <div className="flex items-center justify-between gap-3">
          {isRunLimitReached ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/checkout">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Comprar mais simulações
              </Link>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(!open)}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recalcular com outros dados
              {open ? (
                <ChevronUp className="h-4 w-4 ml-2" />
              ) : (
                <ChevronDown className="h-4 w-4 ml-2" />
              )}
            </Button>
          )}

          {isPaid && runsRemaining > 0 && (
            <Badge variant="secondary" className="text-xs">
              {runsRemaining} {runsRemaining === 1 ? "recálculo restante" : "recálculos restantes"}
            </Badge>
          )}
        </div>

        {/* Expanded form */}
        {open && !isRunLimitReached && (
          <div className="mt-4 space-y-4 pt-4 border-t">
            {/* Row 1: Setor, UF, Regime */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Setor</label>
                <select
                  value={setor}
                  onChange={(e) => setSetor(e.target.value as Setor)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {SETOR_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.emoji} {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Estado</label>
                <select
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {UF_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.value} — {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Regime</label>
                <select
                  value={regime}
                  onChange={(e) => setRegime(e.target.value as RegimeTributario)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {REGIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 2: Faturamento, Fator R, Tipo Custo */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Faturamento anual</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={faturamentoDisplay}
                    onChange={(e) => handleCurrencyChange(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  Folha / receita: {fatorR}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={fatorR}
                  onChange={(e) => setFatorR(Number(e.target.value))}
                  className="w-full accent-primary h-2 mt-2"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de custo</label>
                <select
                  value={tipoCusto}
                  onChange={(e) => setTipoCusto(e.target.value as TipoCustoPrincipal)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  {CUSTO_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Row 3: Perfil Clientes + Submit */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Para quem você vende?</label>
                <div className="flex gap-2">
                  {PERFIL_CLIENTES_OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => setPerfilClientes(o.value)}
                      className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                        perfilClientes === o.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || isPending}
                size="sm"
                className="shrink-0"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Recalculando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Recalcular
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
