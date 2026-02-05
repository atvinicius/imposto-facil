"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Calculator, AlertTriangle, CheckCircle, Clock, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  calcularSimulacao, 
  gerarTeaser,
  NIVEL_RISCO_LABELS,
  type SimuladorInput,
  type SimuladorResult,
  type SimuladorTeaser,
  type RegimeTributario,
  type Setor,
  type FaixaFaturamento,
} from "@/lib/simulator"

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

  const handleNext = () => {
    if (step === 4 && isStepComplete(4)) {
      // Calculate result
      const fullInput = input as SimuladorInput
      const simulationResult = calcularSimulacao(fullInput)
      const simulationTeaser = gerarTeaser(simulationResult, fullInput)
      setResult(simulationResult)
      setTeaser(simulationTeaser)
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
            ImpostoFacil
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
                <div className="flex justify-between mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={step === 1}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                  <Button onClick={handleNext} disabled={!canProceed}>
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
                    <Link href="/signup">
                      {teaser.ctaTexto}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

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
                  
                  {/* Gated content teaser */}
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-dashed">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      No relatório completo você recebe:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>✓ Checklist completo de adequação ({result.gatedContent.checklistCompleto.length} itens)</li>
                      <li>✓ {result.gatedContent.analiseDetalhada}</li>
                      {result.gatedContent.comparativoRegimes && (
                        <li>✓ Comparativo: vale mudar de regime tributário?</li>
                      )}
                      <li>✓ Alertas automáticos sobre novas regulamentações</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Final CTA */}
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    Não deixe sua empresa para trás
                  </h3>
                  <p className="mb-4 text-primary-foreground/80">
                    Crie sua conta gratuita e receba seu relatório completo agora
                  </p>
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/signup">
                      Criar conta gratuita
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  <p className="text-xs mt-3 text-primary-foreground/60">
                    Sem cartão de crédito. Cancele quando quiser.
                  </p>
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
