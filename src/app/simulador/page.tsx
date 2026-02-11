"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calculator, AlertTriangle, CheckCircle, Clock, Lock, TrendingUp, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { MethodologyCard } from "@/components/ui/methodology-card"
import {
  calcularSimulacao,
  gerarTeaser,
  saveSimulatorData,
  NIVEL_RISCO_LABELS,
  type SimuladorInput,
  type SimuladorResult,
  type SimuladorTeaser,
  type RegimeTributario,
  type Setor,
  type FaixaFaturamento,
} from "@/lib/simulator"
import { useAnalytics } from "@/lib/analytics/track"

// Options for the quiz
const REGIME_OPTIONS: { value: RegimeTributario; label: string; description: string }[] = [
  { value: "simples", label: "Simples Nacional", description: "Regime simplificado para micro e pequenas empresas" },
  { value: "lucro_presumido", label: "Lucro Presumido", description: "Base de cálculo presumida pela Receita" },
  { value: "lucro_real", label: "Lucro Real", description: "Tributação sobre o lucro efetivo" },
  { value: "nao_sei", label: "Não tenho certeza", description: "Vamos estimar com base no seu perfil" },
]

const SETOR_OPTIONS: { value: Setor; label: string }[] = [
  { value: "servicos", label: "Serviços (consultoria, TI, marketing, etc.)" },
  { value: "comercio", label: "Comércio (varejo, atacado)" },
  { value: "industria", label: "Indústria (fabricação, manufatura)" },
  { value: "tecnologia", label: "Tecnologia (software, SaaS)" },
  { value: "saude", label: "Saúde (clínicas, laboratórios)" },
  { value: "educacao", label: "Educação (escolas, cursos)" },
  { value: "agronegocio", label: "Agronegócio" },
  { value: "construcao", label: "Construção Civil" },
  { value: "financeiro", label: "Serviços Financeiros" },
  { value: "outro", label: "Outro" },
]

const FATURAMENTO_OPTIONS: { value: FaixaFaturamento; label: string; description: string }[] = [
  { value: "ate_81k", label: "Até R$ 81.000/ano", description: "Faixa MEI" },
  { value: "81k_360k", label: "R$ 81.000 - R$ 360.000/ano", description: "Microempresa" },
  { value: "360k_4.8m", label: "R$ 360.000 - R$ 4,8M/ano", description: "Pequena empresa" },
  { value: "4.8m_78m", label: "R$ 4,8M - R$ 78M/ano", description: "Média empresa" },
  { value: "acima_78m", label: "Acima de R$ 78M/ano", description: "Grande empresa" },
]

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", 
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", 
  "SP", "SE", "TO"
]

type Step = 1 | 2 | 3 | 4 | "result"

export default function SimuladorPage() {
  const [step, setStep] = useState<Step>(1)
  const [input, setInput] = useState<Partial<SimuladorInput>>({})
  const [result, setResult] = useState<SimuladorResult | null>(null)
  const [teaser, setTeaser] = useState<SimuladorTeaser | null>(null)
  const { track } = useAnalytics()
  const trackedRef = useRef(false)

  const handleNext = () => {
    if (step === 4 && isStepComplete(4)) {
      const fullInput = input as SimuladorInput
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
          risco: simulationResult.nivelRisco,
        })
      }
      setStep("result")
    } else if (typeof step === "number" && step < 4) {
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step === "result") {
      setStep(4)
    } else if (typeof step === "number" && step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const isStepComplete = (s: number): boolean => {
    switch (s) {
      case 1: return !!input.regime
      case 2: return !!input.setor
      case 3: return !!input.faturamento
      case 4: return !!input.uf
      default: return false
    }
  }

  const canProceed = typeof step === "number" && isStepComplete(step)

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            ImpostoFácil
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
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
                <span className="text-sm text-muted-foreground">Passo {step} de 4</span>
                <span className="text-sm text-muted-foreground">{Math.round((step / 4) * 100)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Steps */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calculator className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>
                      {step === 1 && "Qual o regime tributário da sua empresa?"}
                      {step === 2 && "Qual o setor de atuação?"}
                      {step === 3 && "Qual o faturamento anual aproximado?"}
                      {step === 4 && "Em qual estado sua empresa está?"}
                    </CardTitle>
                    <CardDescription>
                      {step === 1 && "Isso determina como a reforma vai te impactar"}
                      {step === 2 && "Alguns setores serão mais afetados que outros"}
                      {step === 3 && "Vamos calcular o impacto em reais"}
                      {step === 4 && "Quase lá! Último passo"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Step 1: Regime */}
                {step === 1 && (
                  <div className="space-y-3">
                    {REGIME_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          input.regime === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="regime"
                          value={option.value}
                          checked={input.regime === option.value}
                          onChange={(e) => setInput({ ...input, regime: e.target.value as RegimeTributario })}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Step 2: Setor */}
                {step === 2 && (
                  <div className="space-y-2">
                    {SETOR_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          input.setor === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="setor"
                          value={option.value}
                          checked={input.setor === option.value}
                          onChange={(e) => setInput({ ...input, setor: e.target.value as Setor })}
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Step 3: Faturamento */}
                {step === 3 && (
                  <div className="space-y-3">
                    {FATURAMENTO_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
                          input.faturamento === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="faturamento"
                          value={option.value}
                          checked={input.faturamento === option.value}
                          onChange={(e) => setInput({ ...input, faturamento: e.target.value as FaixaFaturamento })}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {/* Step 4: UF */}
                {step === 4 && (
                  <div>
                    <Label htmlFor="uf" className="mb-2 block">Estado</Label>
                    <select
                      id="uf"
                      value={input.uf || ""}
                      onChange={(e) => setInput({ ...input, uf: e.target.value })}
                      className="w-full p-3 border rounded-lg bg-background"
                    >
                      <option value="">Selecione o estado</option>
                      {UF_OPTIONS.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex flex-col-reverse gap-3 mt-6 pt-6 border-t sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                    className="w-full sm:w-auto"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <Button onClick={handleNext} disabled={!canProceed} className="w-full sm:w-auto">
                    {step === 4 ? "Ver resultado" : "Próximo"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Results */
          result && teaser && (
            <div className="space-y-6">
              {/* Main Result Card */}
              <Card className="border-2 border-primary">
                <CardHeader className="text-center pb-2">
                  <Badge className={`w-fit mx-auto mb-4 ${NIVEL_RISCO_LABELS[result.nivelRisco].color}`}>
                    Nível de Risco: {NIVEL_RISCO_LABELS[result.nivelRisco].label}
                  </Badge>
                  <CardTitle className="text-2xl md:text-3xl">
                    {teaser.impactoResumo}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {result.impactoAnual.percentual > 0 
                      ? `Aumento estimado de ${result.impactoAnual.percentual}% na carga tributária`
                      : `Redução estimada de ${Math.abs(result.impactoAnual.percentual)}% na carga tributária`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg mb-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Melhor cenário</div>
                      <div className={`text-xl font-bold ${result.impactoAnual.min > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {result.impactoAnual.min > 0 ? '+' : ''} R$ {Math.abs(result.impactoAnual.min).toLocaleString("pt-BR")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Pior cenário</div>
                      <div className={`text-xl font-bold ${result.impactoAnual.max > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {result.impactoAnual.max > 0 ? '+' : ''} R$ {Math.abs(result.impactoAnual.max).toLocaleString("pt-BR")}
                      </div>
                    </div>
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
                      <Lock className="h-4 w-4" />
                      +{result.alertas.length - 3} alertas no relatório completo
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
                        <Badge variant={
                          data.urgencia === "danger" ? "destructive" : 
                          data.urgencia === "warning" ? "secondary" : "outline"
                        }>
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
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    O que fazer agora
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
                    <Lock className="h-4 w-4" />
                    +{result.acoesRecomendadas.length - 2 + result.gatedContent.checklistCompleto.length} ações no relatório completo
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
                    <div key={proj.ano} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                      <span className="font-mono font-bold text-sm w-12">{proj.ano}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{proj.descricao}</p>
                      </div>
                      <div className={`text-sm font-medium shrink-0 ${proj.diferencaVsAtual > 0 ? "text-red-600" : "text-green-600"}`}>
                        {proj.diferencaVsAtual > 0 ? "+" : ""}R$ {Math.abs(proj.diferencaVsAtual).toLocaleString("pt-BR")}
                      </div>
                    </div>
                  ))}
                  {/* Blurred rows */}
                  <div className="relative">
                    <div className="space-y-3 select-none" style={{ filter: "blur(5px)" }}>
                      {result.gatedContent.projecaoAnual.slice(2, 4).map((proj) => (
                        <div key={proj.ano} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                          <span className="font-mono font-bold text-sm w-12">{proj.ano}</span>
                          <div className="flex-1">
                            <p className="text-sm">{proj.descricao}</p>
                          </div>
                          <span className="text-sm font-medium">R$ ---</span>
                        </div>
                      ))}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/80 px-4 py-2 rounded-full border">
                        <Lock className="h-4 w-4" />
                        +{result.gatedContent.projecaoAnual.length - 2} anos no diagnóstico
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
                      <div className="select-none" style={{ filter: "blur(5px)" }}>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="p-3 bg-muted/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">Regime atual</p>
                            <p className="font-medium">{result.gatedContent.analiseRegime.regimeAtual}</p>
                          </div>
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <p className="text-xs text-muted-foreground">Sugestão</p>
                            <p className="font-medium">{result.gatedContent.analiseRegime.regimeSugerido || "Manter atual"}</p>
                          </div>
                        </div>
                        {result.gatedContent.analiseRegime.economiaEstimada && (
                          <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                            <p className="text-sm text-muted-foreground">Economia estimada</p>
                            <p className="text-xl font-bold text-green-600">
                              R$ {result.gatedContent.analiseRegime.economiaEstimada.toLocaleString("pt-BR")}/ano
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-background/80 px-4 py-2 rounded-full border">
                          <Lock className="h-4 w-4" />
                          Desbloqueie por R$29
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
                <Button variant="ghost" onClick={() => {
                  setStep(1)
                  setInput({})
                  setResult(null)
                  setTeaser(null)
                }}>
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
