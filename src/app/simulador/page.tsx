"use client"

import { useState, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  Lock,
  TrendingUp,
  BarChart3,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MethodologyCard } from "@/components/ui/methodology-card"
import {
  calcularSimulacao,
  gerarTeaser,
  saveSimulatorData,
  NIVEL_RISCO_LABELS,
  SETOR_OPTIONS,
  UF_OPTIONS,
  REGIME_OPTIONS,
  CUSTO_OPTIONS,
  PERFIL_CLIENTES_OPTIONS,
  deriveFaixaFaturamento,
  formatCurrency,
  parseCurrencyInput,
  getContextualizer,
  getSetorInsight,
  getUfInsight,
  ufHasIncentiveProgram,
  getIcmsInsight,
  getRegimeInsight,
  getFaturamentoInsight,
  getFolhaInsight,
  getCustoInsight,
  getClientesInsight,
  getExportInsight,
  getActiveSteps,
  getStepProgress,
  type StepAnswers,
  type Insight,
  type SimuladorInput,
  type SimuladorResult,
  type SimuladorTeaser,
  type RegimeTributario,
  type Setor,
  type TipoCustoPrincipal,
  type PerfilClientes,
} from "@/lib/simulator"
import { useAnalytics } from "@/lib/analytics/track"

// ---------------------------------------------------------------------------
// Insight Screen sub-component
// ---------------------------------------------------------------------------

function InsightScreen({
  insight,
  onComplete,
}: {
  insight: Insight
  onComplete: () => void
}) {
  return (
    <div className="insight-enter">
      <div className="flex flex-col items-center text-center py-8 px-4 space-y-4">
        <span className="text-4xl">{insight.emoji}</span>
        <h3 className="text-xl font-bold">{insight.headline}</h3>
        <p className="text-muted-foreground max-w-sm">{insight.detail}</p>
        <Button
          onClick={onComplete}
          className="mt-4"
          size="sm"
        >
          Continuar
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SimuladorPage() {
  // --- Answer state ---
  const [setor, setSetor] = useState<Setor | null>(null)
  const [uf, setUf] = useState<string>("")
  const [temIncentivoICMS, setTemIncentivoICMS] = useState<"sim" | "nao" | "nao_sei" | null>(null)
  const [regime, setRegime] = useState<RegimeTributario | null>(null)
  const [faturamentoExato, setFaturamentoExato] = useState<number>(0)
  const [faturamentoDisplay, setFaturamentoDisplay] = useState<string>("")
  const [fatorR, setFatorR] = useState<number>(30)
  const [tipoCusto, setTipoCusto] = useState<TipoCustoPrincipal | null>(null)
  const [perfilClientes, setPerfilClientes] = useState<PerfilClientes | null>(null)
  const [exportaServicos, setExportaServicos] = useState<boolean | null>(null)

  // --- Navigation state ---
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState<"question" | "insight">("question")
  const [showResult, setShowResult] = useState(false)

  // --- Result state ---
  const [result, setResult] = useState<SimuladorResult | null>(null)
  const [teaser, setTeaser] = useState<SimuladorTeaser | null>(null)

  const { track } = useAnalytics()
  const router = useRouter()
  const trackedRef = useRef(false)

  // --- Derived: active steps based on current answers ---
  const answers: StepAnswers = useMemo(() => ({
    setor,
    uf,
    regime,
    temIncentivoICMS,
    exportaServicos,
  }), [setor, uf, regime, temIncentivoICMS, exportaServicos])

  const activeSteps = useMemo(() => getActiveSteps(answers), [answers])
  const currentStep = activeSteps[stepIndex]
  const progress = getStepProgress(activeSteps, stepIndex)

  // --- Helpers ---
  const handleCurrencyChange = useCallback((raw: string) => {
    const value = parseCurrencyInput(raw)
    setFaturamentoExato(value)
    setFaturamentoDisplay(value > 0 ? formatCurrency(value) : "")
  }, [])

  const isCurrentStepComplete = (): boolean => {
    if (!currentStep) return false
    switch (currentStep.id) {
      case "setor": return !!setor
      case "uf": return !!uf
      case "icms": return !!temIncentivoICMS
      case "regime": return !!regime
      case "faturamento": return faturamentoExato >= 1_000
      case "folha": return true
      case "custo": return !!tipoCusto
      case "clientes": return !!perfilClientes
      case "exporta": return exportaServicos !== null
      default: return false
    }
  }

  const getInsightForCurrentStep = (): Insight | null => {
    if (!currentStep) return null
    switch (currentStep.id) {
      case "setor": return setor ? getSetorInsight(setor) : null
      case "uf": return uf ? getUfInsight(uf) : null
      case "icms": return temIncentivoICMS ? getIcmsInsight(temIncentivoICMS) : null
      case "regime": return regime && setor ? getRegimeInsight(regime, setor) : null
      case "faturamento": return faturamentoExato >= 1_000 ? getFaturamentoInsight(faturamentoExato) : null
      case "folha": return getFolhaInsight(fatorR)
      case "custo": return tipoCusto ? getCustoInsight(tipoCusto) : null
      case "clientes": return perfilClientes && regime ? getClientesInsight(perfilClientes, regime ?? "nao_sei") : null
      case "exporta": return exportaServicos !== null ? getExportInsight(exportaServicos) : null
      default: return null
    }
  }

  const buildInput = (): SimuladorInput => {
    const faixaFaturamento = deriveFaixaFaturamento(faturamentoExato)
    const pctB2B = perfilClientes === "b2b" ? 85 : perfilClientes === "b2c" ? 15 : 50
    return {
      regime: regime!,
      setor: setor!,
      faturamento: faixaFaturamento,
      uf,
      faturamentoExato,
      fatorR,
      tipoCusto: tipoCusto!,
      perfilClientes: perfilClientes!,
      pctB2B,
      temIncentivoICMS: temIncentivoICMS ?? undefined,
      exportaServicos: exportaServicos ?? undefined,
    }
  }

  const advanceToNextStep = useCallback(() => {
    const nextIndex = stepIndex + 1
    // Recompute active steps with current answers for accurate length
    const currentActive = getActiveSteps({
      setor,
      uf,
      regime,
      temIncentivoICMS,
      exportaServicos,
    })

    if (nextIndex >= currentActive.length) {
      // All steps complete — run simulation
      const fullInput = buildInput()
      const simulationResult = calcularSimulacao(fullInput)
      const simulationTeaser = gerarTeaser(simulationResult, fullInput)
      setResult(simulationResult)
      setTeaser(simulationTeaser)
      saveSimulatorData(fullInput, simulationResult, simulationTeaser)
      if (!trackedRef.current) {
        trackedRef.current = true
        track("simulator_completed", {
          regime: fullInput.regime,
          setor: fullInput.setor,
          faturamento: fullInput.faturamento,
          uf: fullInput.uf,
          faturamentoExato: fullInput.faturamentoExato,
          risco: simulationResult.nivelRisco,
        })
      }
      setShowResult(true)
    } else {
      setStepIndex(nextIndex)
    }
    setPhase("question")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, setor, uf, regime, temIncentivoICMS, exportaServicos, faturamentoExato, fatorR, tipoCusto, perfilClientes])

  const showInsightThenAdvance = useCallback(() => {
    setPhase("insight")
  }, [])

  const handleSelection = useCallback((stepId: string) => {
    // Auto-advance: show insight after selection
    // Small delay so the selection highlight renders
    setTimeout(() => {
      showInsightThenAdvance()
    }, 150)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showInsightThenAdvance])

  const handleNext = () => {
    if (!isCurrentStepComplete()) return
    showInsightThenAdvance()
  }

  const handleBack = () => {
    if (showResult) {
      setShowResult(false)
      setPhase("question")
      return
    }
    if (phase === "insight") {
      setPhase("question")
      return
    }
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1)
      setPhase("question")
    } else {
      router.push("/")
    }
  }

  const canProceed = isCurrentStepComplete()
  const contextualizer = currentStep ? getContextualizer(currentStep.id) : ""

  // --- ICMS options ---
  const ICMS_OPTIONS = [
    { value: "sim" as const, label: "Sim", description: "Minha empresa tem incentivo fiscal de ICMS" },
    { value: "nao" as const, label: "Não", description: "Não tenho incentivo fiscal" },
    { value: "nao_sei" as const, label: "Não sei", description: "Preciso verificar com meu contador" },
  ]

  const EXPORT_OPTIONS = [
    { value: true, label: "Sim", description: "Exporto serviços para clientes no exterior" },
    { value: false, label: "Não", description: "Atendo apenas o mercado brasileiro" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao início
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {!showResult ? (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Passo {progress.current} de {progress.total}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((progress.current / progress.total) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Card */}
            <Card>
              {phase === "question" && currentStep ? (
                <>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calculator className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{currentStep.title}</CardTitle>
                        <CardDescription>{currentStep.subtitle}</CardDescription>
                      </div>
                    </div>
                    {contextualizer && (
                      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                        <span>📊</span>
                        <span>Por que perguntamos · {contextualizer}</span>
                      </p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {/* Setor */}
                    {currentStep.id === "setor" && (
                      <div className="grid grid-cols-2 gap-2">
                        {SETOR_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setSetor(option.value)
                              handleSelection("setor")
                            }}
                            className={`flex items-center gap-2 p-3 rounded-lg border text-left transition-all ${
                              setor === option.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <span className="text-lg">{option.emoji}</span>
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* UF */}
                    {currentStep.id === "uf" && (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {UF_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setUf(option.value)
                              handleSelection("uf")
                            }}
                            className={`p-3 rounded-lg border text-center transition-all ${
                              uf === option.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="font-bold text-sm">{option.value}</div>
                            <div className="text-xs text-muted-foreground truncate">{option.label}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* ICMS Incentive (conditional) */}
                    {currentStep.id === "icms" && (
                      <div className="space-y-3">
                        {ICMS_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setTemIncentivoICMS(option.value)
                              handleSelection("icms")
                            }}
                            className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                              temIncentivoICMS === option.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 transition-colors ${
                                temIncentivoICMS === option.value
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Regime */}
                    {currentStep.id === "regime" && (
                      <div className="space-y-3">
                        {REGIME_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setRegime(option.value)
                              handleSelection("regime")
                            }}
                            className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                              regime === option.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 transition-colors ${
                                regime === option.value
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Faturamento */}
                    {currentStep.id === "faturamento" && (
                      <div className="space-y-4">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                            R$
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={faturamentoDisplay}
                            onChange={(e) => handleCurrencyChange(e.target.value)}
                            placeholder="0"
                            autoFocus
                            className="w-full pl-10 pr-16 py-4 text-2xl font-bold border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                            /ano
                          </span>
                        </div>
                        {faturamentoExato > 0 && (
                          <p className="text-sm text-muted-foreground text-center">
                            {faturamentoExato <= 81_000
                              ? "Faixa MEI"
                              : faturamentoExato <= 360_000
                                ? "Faixa Microempresa"
                                : faturamentoExato <= 4_800_000
                                  ? "Faixa Pequena Empresa (EPP)"
                                  : faturamentoExato <= 78_000_000
                                    ? "Média empresa"
                                    : "Grande empresa"}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Folha */}
                    {currentStep.id === "folha" && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-primary mb-1">
                            {fatorR}%
                          </div>
                          <p className="text-sm text-muted-foreground">da receita bruta</p>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          step={5}
                          value={fatorR}
                          onChange={(e) => setFatorR(Number(e.target.value))}
                          className="w-full accent-primary h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0% (sem funcionários)</span>
                          <span>80%+ (intensivo em mão de obra)</span>
                        </div>
                        {fatorR > 50 && (
                          <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
                            Folha elevada: despesas com pessoal não geram crédito de IBS/CBS, o que tende a aumentar sua carga tributária efetiva.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Custo */}
                    {currentStep.id === "custo" && (
                      <div className="space-y-3">
                        {CUSTO_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setTipoCusto(option.value)
                              handleSelection("custo")
                            }}
                            className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                              tipoCusto === option.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 transition-colors ${
                                tipoCusto === option.value
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Clientes */}
                    {currentStep.id === "clientes" && (
                      <div className="space-y-3">
                        {PERFIL_CLIENTES_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setPerfilClientes(option.value)
                              handleSelection("clientes")
                            }}
                            className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                              perfilClientes === option.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 transition-colors ${
                                perfilClientes === option.value
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Exporta servicos (conditional) */}
                    {currentStep.id === "exporta" && (
                      <div className="space-y-3">
                        {EXPORT_OPTIONS.map((option) => (
                          <button
                            key={String(option.value)}
                            type="button"
                            onClick={() => {
                              setExportaServicos(option.value)
                              handleSelection("exporta")
                            }}
                            className={`w-full flex items-start gap-3 p-4 rounded-lg border text-left transition-all ${
                              exportaServicos === option.value
                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className={`mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 transition-colors ${
                                exportaServicos === option.value
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-sm text-muted-foreground">{option.description}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Navigation */}
                    <div className="flex flex-col-reverse gap-3 mt-6 pt-6 border-t sm:flex-row sm:justify-between">
                      <Button
                        variant="outline"
                        onClick={handleBack}
                        className="w-full sm:w-auto"
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Voltar
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="w-full sm:w-auto"
                      >
                        {stepIndex === activeSteps.length - 1 ? "Ver resultado" : "Próximo"}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : phase === "insight" ? (
                <CardContent className="p-0">
                  {(() => {
                    const insight = getInsightForCurrentStep()
                    if (!insight) return null
                    return <InsightScreen insight={insight} onComplete={advanceToNextStep} />
                  })()}
                </CardContent>
              ) : null}
            </Card>
          </>
        ) : (
          /* Results — unchanged from original */
          result &&
          teaser && (
            <div className="space-y-6">
              {/* Main Result Card */}
              <Card className="border-2 border-primary">
                <CardHeader className="text-center pb-2">
                  <Badge
                    className={`w-fit mx-auto mb-4 ${NIVEL_RISCO_LABELS[result.nivelRisco].color}`}
                  >
                    Nível de Risco: {NIVEL_RISCO_LABELS[result.nivelRisco].label}
                  </Badge>
                  <CardTitle className="text-2xl md:text-3xl">
                    {teaser.impactoResumo}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {result.impactoAnual.percentual > 0
                      ? `Aumento estimado de ${result.impactoAnual.percentual}% na carga tributária`
                      : `Redução estimada de ${Math.abs(result.impactoAnual.percentual)}% na carga tributária`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Melhor cenário</div>
                      <div
                        className={`text-xl font-bold ${result.impactoAnual.min > 0 ? "text-red-600" : "text-emerald-700"}`}
                      >
                        {result.impactoAnual.min > 0 ? "+" : ""} R${" "}
                        {Math.abs(result.impactoAnual.min).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Pior cenário</div>
                      <div
                        className={`text-xl font-bold ${result.impactoAnual.max > 0 ? "text-red-600" : "text-emerald-700"}`}
                      >
                        {result.impactoAnual.max > 0 ? "+" : ""} R${" "}
                        {Math.abs(result.impactoAnual.max).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  {/* Confidence badge */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="text-sm text-muted-foreground">Precisão da simulação:</div>
                    <Badge variant="outline" className={
                      result.confiancaPerfil >= 70 ? "text-emerald-800 border-emerald-400" :
                      result.confiancaPerfil >= 40 ? "text-amber-900 border-amber-400" :
                      "text-red-800 border-red-400"
                    }>
                      {result.confiancaPerfil}% — {result.confiancaPerfil >= 70 ? "Alta" : result.confiancaPerfil >= 40 ? "Média" : "Baixa"}
                    </Badge>
                  </div>

                  {/* CTA */}
                  <Button asChild className="w-full" size="lg">
                    <Link href="/signup?from=simulador">
                      Ver diagnóstico completo
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Methodology */}
              <MethodologyCard metodologia={result.metodologia} compact />

              {/* Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Alertas para sua empresa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.alertas.slice(0, 3).map((alerta, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span>{alerta}</span>
                      </li>
                    ))}
                  </ul>
                  {result.alertas.length > 3 && (
                    <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
                      <Lock className="h-4 w-4" />+{result.alertas.length - 3}{" "}
                      alertas no relatório completo
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="h-5 w-5 text-primary" />
                    Datas importantes para você
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {result.datasImportantes.slice(0, 3).map((data, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Badge
                          variant={
                            data.urgencia === "danger"
                              ? "destructive"
                              : data.urgencia === "warning"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {data.data}
                        </Badge>
                        <span className="text-sm">{data.descricao}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />O que fazer agora
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.acoesRecomendadas.slice(0, 2).map((acao, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        <span>{acao}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-muted-foreground mt-3 flex items-center gap-1">
                    <Lock className="h-4 w-4" />+
                    {result.acoesRecomendadas.length -
                      2 +
                      result.gatedContent.checklistCompleto.length}{" "}
                    ações no relatório completo
                  </p>
                </CardContent>
              </Card>

              {/* Year-by-year projection teaser */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Projeção Ano a Ano
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.gatedContent.projecaoAnual.slice(0, 2).map((proj) => (
                    <div
                      key={proj.ano}
                      className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                    >
                      <span className="font-mono font-bold text-sm w-12">
                        {proj.ano}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{proj.descricao}</p>
                      </div>
                      <div
                        className={`text-sm font-medium shrink-0 ${proj.diferencaVsAtual > 0 ? "text-red-600" : "text-emerald-700"}`}
                      >
                        {proj.diferencaVsAtual > 0 ? "+" : ""}R${" "}
                        {Math.abs(proj.diferencaVsAtual).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  ))}
                  {/* Blurred rows */}
                  <div className="relative">
                    <div
                      className="space-y-3 select-none"
                      style={{ filter: "blur(5px)" }}
                    >
                      {result.gatedContent.projecaoAnual.slice(2, 4).map((proj) => (
                        <div
                          key={proj.ano}
                          className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg"
                        >
                          <span className="font-mono font-bold text-sm w-12">
                            {proj.ano}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm">{proj.descricao}</p>
                          </div>
                          <span className="text-sm font-medium">R$ ---</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/80 px-4 py-2 rounded-full border">
                        <Lock className="h-4 w-4" />+
                        {result.gatedContent.projecaoAnual.length - 2} anos no diagnóstico
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Regime analysis teaser */}
              {result.gatedContent.analiseRegime && (
                <Card className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-violet-500" />
                      Análise de Regime Tributário
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div
                        className="select-none"
                        style={{ filter: "blur(5px)" }}
                      >
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">Regime atual</p>
                            <p className="font-medium">
                              {result.gatedContent.analiseRegime.regimeAtual}
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <p className="text-xs text-muted-foreground">Sugestão</p>
                            <p className="font-medium">
                              {result.gatedContent.analiseRegime.regimeSugerido || "Manter atual"}
                            </p>
                          </div>
                        </div>
                        {result.gatedContent.analiseRegime.economiaEstimada && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Economia estimada</p>
                            <p className="text-xl font-bold text-emerald-700">
                              R${" "}
                              {result.gatedContent.analiseRegime.economiaEstimada.toLocaleString("pt-BR")}
                              /ano
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/80 px-4 py-2 rounded-full border">
                          <Lock className="h-4 w-4" />
                          Desbloqueie por R$49
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Final CTA */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    Receba seu Diagnóstico Tributário completo
                  </h3>
                  <p className="mb-4 text-primary-foreground/80">
                    Crie sua conta e veja alertas, checklist de ações e projeção ano a ano
                  </p>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/signup?from=simulador">
                      Ver diagnóstico completo
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Restart */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setStepIndex(0)
                    setPhase("question")
                    setShowResult(false)
                    setSetor(null)
                    setUf("")
                    setTemIncentivoICMS(null)
                    setRegime(null)
                    setFaturamentoExato(0)
                    setFaturamentoDisplay("")
                    setFatorR(30)
                    setTipoCusto(null)
                    setPerfilClientes(null)
                    setExportaServicos(null)
                    setResult(null)
                    setTeaser(null)
                    trackedRef.current = false
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Fazer nova simulação
                </Button>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}
