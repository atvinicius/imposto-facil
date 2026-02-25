"use client"

import { useState, useRef, useCallback } from "react"
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
  type SimuladorInput,
  type SimuladorResult,
  type SimuladorTeaser,
  type RegimeTributario,
  type Setor,
  type TipoCustoPrincipal,
  type PerfilClientes,
} from "@/lib/simulator"
import { useAnalytics } from "@/lib/analytics/track"

// --- Steps ---

const TOTAL_STEPS = 7

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | "result"

const STEP_CONFIG: Record<number, { title: string; subtitle: string }> = {
  1: { title: "Qual o setor da sua empresa?", subtitle: "Alguns setores serão mais impactados pela reforma" },
  2: { title: "Em qual estado sua empresa está?", subtitle: "A localização influencia incentivos fiscais e alíquotas" },
  3: { title: "Qual o regime tributário?", subtitle: "Isso determina como a reforma vai te impactar" },
  4: { title: "Qual o faturamento anual?", subtitle: "Use o valor aproximado — quanto mais preciso, melhor o resultado" },
  5: { title: "Quanto da receita vai para folha de pagamento?", subtitle: "Folha não gera crédito de IBS/CBS — isso impacta sua carga" },
  6: { title: "Qual o principal tipo de custo?", subtitle: "Custos com insumos geram crédito; folha não" },
  7: { title: "Para quem você vende?", subtitle: "Clientes PJ no Simples não aproveitam crédito integral" },
}

export default function SimuladorPage() {
  const [step, setStep] = useState<Step>(1)
  const [setor, setSetor] = useState<Setor | null>(null)
  const [uf, setUf] = useState<string>("")
  const [regime, setRegime] = useState<RegimeTributario | null>(null)
  const [faturamentoExato, setFaturamentoExato] = useState<number>(0)
  const [faturamentoDisplay, setFaturamentoDisplay] = useState<string>("")
  const [fatorR, setFatorR] = useState<number>(30)
  const [tipoCusto, setTipoCusto] = useState<TipoCustoPrincipal | null>(null)
  const [perfilClientes, setPerfilClientes] = useState<PerfilClientes | null>(null)
  const [result, setResult] = useState<SimuladorResult | null>(null)
  const [teaser, setTeaser] = useState<SimuladorTeaser | null>(null)
  const { track } = useAnalytics()
  const router = useRouter()
  const trackedRef = useRef(false)

  const handleCurrencyChange = useCallback((raw: string) => {
    const value = parseCurrencyInput(raw)
    setFaturamentoExato(value)
    setFaturamentoDisplay(value > 0 ? formatCurrency(value) : "")
  }, [])

  const isStepComplete = (s: number): boolean => {
    switch (s) {
      case 1: return !!setor
      case 2: return !!uf
      case 3: return !!regime
      case 4: return faturamentoExato >= 1_000
      case 5: return true // slider always has a value
      case 6: return !!tipoCusto
      case 7: return !!perfilClientes
      default: return false
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
    }
  }

  const handleNext = () => {
    if (step === TOTAL_STEPS && isStepComplete(TOTAL_STEPS)) {
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
      setStep("result")
    } else if (typeof step === "number" && step < TOTAL_STEPS) {
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step === "result") {
      setStep(TOTAL_STEPS as Step)
    } else if (typeof step === "number" && step > 1) {
      setStep((step - 1) as Step)
    } else if (step === 1) {
      router.push("/")
    }
  }

  const canProceed = typeof step === "number" && isStepComplete(step)
  const stepNum = typeof step === "number" ? step : TOTAL_STEPS
  const config = typeof step === "number" ? STEP_CONFIG[step] : null

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
        {step !== "result" ? (
          <>
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  Passo {stepNum} de {TOTAL_STEPS}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((stepNum / TOTAL_STEPS) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(stepNum / TOTAL_STEPS) * 100}%` }}
                />
              </div>
            </div>

            {/* Step Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>{config?.title}</CardTitle>
                    <CardDescription>{config?.subtitle}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Step 1: Setor */}
                {step === 1 && (
                  <div className="grid grid-cols-2 gap-2">
                    {SETOR_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSetor(option.value)
                          // Auto-advance on selection
                          setTimeout(() => {
                            setStep(2)
                          }, 150)
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

                {/* Step 2: Estado */}
                {step === 2 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {UF_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setUf(option.value)
                          setTimeout(() => {
                            setStep(3)
                          }, 150)
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

                {/* Step 3: Regime */}
                {step === 3 && (
                  <div className="space-y-3">
                    {REGIME_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setRegime(option.value)
                          setTimeout(() => {
                            setStep(4)
                          }, 150)
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
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 4: Faturamento exato */}
                {step === 4 && (
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

                {/* Step 5: Fator R (payroll %) */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-primary mb-1">
                        {fatorR}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        da receita bruta
                      </p>
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

                {/* Step 6: Tipo de custo */}
                {step === 6 && (
                  <div className="space-y-3">
                    {CUSTO_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setTipoCusto(option.value)
                          setTimeout(() => {
                            setStep(7)
                          }, 150)
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
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Step 7: Perfil de clientes */}
                {step === 7 && (
                  <div className="space-y-3">
                    {PERFIL_CLIENTES_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setPerfilClientes(option.value)
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
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
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
                    disabled={false}
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
                    {step === TOTAL_STEPS ? "Ver resultado" : "Próximo"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Results */
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
                      <div className="text-sm text-muted-foreground">
                        Melhor cenário
                      </div>
                      <div
                        className={`text-xl font-bold ${result.impactoAnual.min > 0 ? "text-red-600" : "text-emerald-700"}`}
                      >
                        {result.impactoAnual.min > 0 ? "+" : ""} R${" "}
                        {Math.abs(result.impactoAnual.min).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">
                        Pior cenário
                      </div>
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
                    <CheckCircle className="h-5 w-5 text-green-500" />O que fazer
                    agora
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
                      {result.gatedContent.projecaoAnual
                        .slice(2, 4)
                        .map((proj) => (
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
                        {result.gatedContent.projecaoAnual.length - 2} anos no
                        diagnóstico
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
                            <p className="text-xs text-muted-foreground">
                              Regime atual
                            </p>
                            <p className="font-medium">
                              {result.gatedContent.analiseRegime.regimeAtual}
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              Sugestão
                            </p>
                            <p className="font-medium">
                              {result.gatedContent.analiseRegime.regimeSugerido ||
                                "Manter atual"}
                            </p>
                          </div>
                        </div>
                        {result.gatedContent.analiseRegime.economiaEstimada && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">
                              Economia estimada
                            </p>
                            <p className="text-xl font-bold text-emerald-700">
                              R${" "}
                              {result.gatedContent.analiseRegime.economiaEstimada.toLocaleString(
                                "pt-BR"
                              )}
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
                    Crie sua conta e veja alertas, checklist de ações e projeção
                    ano a ano
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
                    setStep(1)
                    setSetor(null)
                    setUf("")
                    setRegime(null)
                    setFaturamentoExato(0)
                    setFaturamentoDisplay("")
                    setFatorR(30)
                    setTipoCusto(null)
                    setPerfilClientes(null)
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
