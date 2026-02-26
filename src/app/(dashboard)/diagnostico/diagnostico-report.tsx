"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Bot,
  CheckCircle,
  Clock,
  HelpCircle,
  Lock,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  X,
  Zap,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GatedSection } from "@/components/ui/gated-section"
import { PdfDownloadButton } from "@/components/pdf-download-button"
import { MethodologyCard } from "@/components/ui/methodology-card"
import type { SimuladorInput, SimuladorResult } from "@/lib/simulator"
import { NIVEL_RISCO_LABELS, gerarTeaser } from "@/lib/simulator"
import { useAnalytics } from "@/lib/analytics/track"
import { ChecklistItem } from "./checklist-item"
import { toggleChecklistItem } from "./actions"
import { FeedbackPrompt } from "@/components/feedback/feedback-prompt"
import { getErrosComuns } from "@/lib/simulator/common-mistakes"
import { RerunForm } from "./rerun-form"

export interface ChecklistProgress {
  completed: string[]
  updated_at: string | null
}

interface FullCounts {
  alertCount: number
  timelineCount: number
  actionCount: number
  gatedChecklistCount: number
  hasAnaliseRegime: boolean
}

interface DiagnosticoReportProps {
  result: SimuladorResult
  input: SimuladorInput
  isPaid: boolean
  justUnlocked?: boolean
  checklistProgress?: ChecklistProgress
  runsRemaining?: number
  fullCounts?: FullCounts
}

function EntendaMelhorButton({ question }: { question: string }) {
  return (
    <Button variant="ghost" size="sm" asChild className="text-xs text-muted-foreground hover:text-primary gap-1">
      <Link href={`/assistente?q=${encodeURIComponent(question)}`}>
        <MessageCircle className="h-3.5 w-3.5" />
        Entenda melhor
      </Link>
    </Button>
  )
}

function ConfidenceExplainer({ score, onClose }: { score: number; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-background border rounded-xl shadow-xl max-w-md w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Como calculamos a precisão</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          A pontuação de <strong>{score}%</strong> reflete a quantidade e a qualidade dos dados
          que temos sobre o perfil da sua empresa.
        </p>

        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <Badge variant="outline" className="shrink-0 text-emerald-800 border-emerald-400 bg-emerald-50">70-100%</Badge>
            <div>
              <p className="font-medium">Alta precisão</p>
              <p className="text-muted-foreground">Perfil completo com faturamento, folha, custos e clientes informados.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Badge variant="outline" className="shrink-0 text-amber-900 border-amber-400 bg-amber-50">40-69%</Badge>
            <div>
              <p className="font-medium">Precisão média</p>
              <p className="text-muted-foreground">Alguns dados faltando. O resultado usa médias do setor para preencher lacunas.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Badge variant="outline" className="shrink-0 text-red-800 border-red-400 bg-red-50">0-39%</Badge>
            <div>
              <p className="font-medium">Precisão baixa</p>
              <p className="text-muted-foreground">Dados insuficientes. O resultado é uma estimativa geral para o setor.</p>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Quanto mais dados você fornecer no simulador, mais preciso será o resultado.
            Fatores como faturamento exato, percentual de folha e tipo de custo têm grande impacto na precisão.
          </p>
        </div>
      </div>
    </div>
  )
}

function AssistantCTA({ isPaid, setor, nivelRisco }: { isPaid: boolean; setor: string; nivelRisco: string }) {
  const [showPaywall, setShowPaywall] = useState(false)
  const riscoLabel = NIVEL_RISCO_LABELS[nivelRisco as keyof typeof NIVEL_RISCO_LABELS]?.label ?? nivelRisco

  const suggestedQuestion = `Meu diagnóstico mostra risco ${riscoLabel.toLowerCase()} para o setor de ${setor}. O que devo priorizar?`

  if (isPaid) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 shrink-0">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Pergunte sobre seu diagnóstico</h3>
              <p className="text-sm text-muted-foreground">
                Nossa assistente de IA conhece seu perfil, seus alertas e suas projeções.
                Tire dúvidas em linguagem simples.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1">
              <Link href={`/assistente?q=${encodeURIComponent(suggestedQuestion)}`}>
                <MessageCircle className="h-4 w-4 mr-2" />
                &ldquo;O que devo priorizar?&rdquo;
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/assistente">
                <Bot className="h-4 w-4 mr-2" />
                Abrir assistente
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-slate-200 dark:border-slate-800">
      <CardContent className="p-6 space-y-5">
        {/* Header with avatar */}
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-slate-900 dark:bg-slate-100 p-3 shrink-0">
            <Bot className="h-6 w-6 text-white dark:text-slate-900" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">Assistente de IA</h3>
              <Badge variant="secondary" className="text-xs">IA</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Tire dúvidas sobre a reforma em linguagem simples, com respostas personalizadas para o seu perfil.
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-2 text-sm p-2.5 rounded-lg bg-muted/40">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Respostas personalizadas</span>
          </div>
          <div className="flex items-center gap-2 text-sm p-2.5 rounded-lg bg-muted/40">
            <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
            <span>Base de 32 artigos</span>
          </div>
          <div className="flex items-center gap-2 text-sm p-2.5 rounded-lg bg-muted/40">
            <ShieldAlert className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Conhece seu diagnóstico</span>
          </div>
        </div>

        {/* Example question preview */}
        <div className="rounded-lg border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground mb-1.5">Exemplo de pergunta:</p>
          <p className="text-sm italic">&ldquo;{suggestedQuestion}&rdquo;</p>
        </div>

        {/* CTA button → paywall reveal */}
        {!showPaywall ? (
          <Button
            className="w-full"
            size="lg"
            onClick={() => setShowPaywall(true)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Perguntar sobre meu diagnóstico
          </Button>
        ) : (
          <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 p-5 text-center space-y-3">
            <Lock className="h-7 w-7 text-amber-600 mx-auto" />
            <p className="font-medium text-sm">
              O assistente de IA está disponível no Diagnóstico Completo
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Além da assistente, você desbloqueia todos os alertas, checklist completo,
              projeção ano a ano, análise de regime e PDF.
            </p>
            <Button asChild size="sm">
              <Link href="/checkout">
                Desbloquear por R$49
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Pagamento único. Acesso permanente.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RerunGatedCTA() {
  const [showMessage, setShowMessage] = useState(false)

  return (
    <div className="flex flex-col items-center text-center space-y-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMessage(true)}
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Recalcular com outros dados
      </Button>

      {showMessage && (
        <Card className="w-full border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-5 text-center space-y-3">
            <div className="flex justify-center">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <p className="font-medium text-sm">
              Recálculos estão disponíveis no Diagnóstico Completo
            </p>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Desbloqueie recálculos ilimitados, projeção ano a ano, análise de regime, checklist interativo e exportação em PDF.
            </p>
            <Button asChild size="sm" className="mt-2">
              <Link href="/checkout">
                Desbloquear por R$49
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Pagamento único. Acesso permanente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function DiagnosticoReport({ result, input, isPaid, justUnlocked, checklistProgress, runsRemaining = 0, fullCounts }: DiagnosticoReportProps) {
  const { track } = useAnalytics()
  const trackedRef = useRef(false)
  const [showConfidenceExplainer, setShowConfidenceExplainer] = useState(false)
  const errosComuns = getErrosComuns(input, result, 4)

  // Use fullCounts from server (accurate) or fall back to local data (for paid users)
  const alertCount = fullCounts?.alertCount ?? result.alertas.length
  const timelineCount = fullCounts?.timelineCount ?? result.datasImportantes.length
  const actionCount = fullCounts?.actionCount ?? result.acoesRecomendadas.length
  const gatedChecklistCount = fullCounts?.gatedChecklistCount ?? result.gatedContent.checklistCompleto.length
  const hasAnaliseRegime = fullCounts?.hasAnaliseRegime ?? (result.gatedContent.analiseRegime !== null)

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true
      track("diagnostic_viewed", { isPaid, risco: result.nivelRisco })
    }
  }, [track, isPaid, result.nivelRisco])
  const teaser = gerarTeaser(result, input)
  const riscoInfo = NIVEL_RISCO_LABELS[result.nivelRisco]
  const freeAlertCount = 2
  const freeActionCount = 1
  const freeTimelineCount = 2

  const completedItems = checklistProgress?.completed ?? []
  const totalChecklistItems = actionCount + gatedChecklistCount
  const completedCount = completedItems.length

  function getItemId(index: number, text: string): string {
    return `${index}-${text.substring(0, 20).replace(/\s+/g, "_")}`
  }

  const confidenceLabel =
    result.confiancaPerfil >= 70 ? "Alta" : result.confiancaPerfil >= 40 ? "Média" : "Baixa"
  const confidenceColor =
    result.confiancaPerfil >= 70 ? "text-emerald-800 border-emerald-400" :
    result.confiancaPerfil >= 40 ? "text-amber-900 border-amber-400" :
    "text-red-800 border-red-400"

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Confidence explainer modal */}
      {showConfidenceExplainer && (
        <ConfidenceExplainer
          score={result.confiancaPerfil}
          onClose={() => setShowConfidenceExplainer(false)}
        />
      )}

      {/* Success banner */}
      {justUnlocked && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-emerald-700 shrink-0" />
          <div>
            <p className="font-medium text-emerald-900 dark:text-emerald-200">Diagnóstico Completo desbloqueado!</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300">Todas as análises e projeções estão disponíveis abaixo.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Tributário</h1>
          {isPaid && (
            <Badge variant="outline" className="text-emerald-800 border-emerald-400">Completo</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Análise personalizada do impacto da reforma tributária na sua empresa
        </p>
        <div className="flex items-center justify-center gap-3">
          <Badge className={`text-base px-4 py-1.5 ${riscoInfo.color}`}>
            Nível de Risco: {riscoInfo.label}
          </Badge>
          <button
            onClick={() => setShowConfidenceExplainer(true)}
            className="inline-flex items-center"
          >
            <Badge variant="outline" className={`${confidenceColor} cursor-pointer hover:opacity-80 transition-opacity`}>
              Precisão: {result.confiancaPerfil}% — {confidenceLabel}
              <HelpCircle className="h-3 w-3 ml-1" />
            </Badge>
          </button>
        </div>
      </div>

      {/* Impact Summary (FREE) */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumo do Impacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-medium">{teaser.impactoResumo}</p>
          <div className="grid grid-cols-1 gap-4 p-4 bg-muted/50 rounded-lg sm:grid-cols-2">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Melhor cenário</div>
              <div className={`text-xl font-bold ${result.impactoAnual.min > 0 ? "text-red-600" : "text-emerald-700"}`}>
                {result.impactoAnual.min > 0 ? "+" : ""} R$ {Math.abs(result.impactoAnual.min).toLocaleString("pt-BR")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Pior cenário</div>
              <div className={`text-xl font-bold ${result.impactoAnual.max > 0 ? "text-red-600" : "text-emerald-700"}`}>
                {result.impactoAnual.max > 0 ? "+" : ""} R$ {Math.abs(result.impactoAnual.max).toLocaleString("pt-BR")}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {result.impactoAnual.percentual > 0
              ? `Aumento estimado de ${result.impactoAnual.percentual}% na carga tributária com a reforma.`
              : `Redução estimada de ${Math.abs(result.impactoAnual.percentual)}% na carga tributária com a reforma.`}
            {" "}Baseado no perfil: {input.setor}, {input.regime}, {input.uf}
            {result.ajusteIcmsUf && result.ajusteIcmsUf.direcao !== "neutro" && (
              <> — ICMS {input.uf}: {result.ajusteIcmsUf.ufAliquota}% ({result.ajusteIcmsUf.direcao === "desfavoravel" ? "acima" : "abaixo"} da média)</>
            )}
            .
          </p>
          <EntendaMelhorButton question={`Por que meu impacto estimado é de ${result.impactoAnual.percentual > 0 ? "+" : ""}${result.impactoAnual.percentual}%? O que mais influencia esse número?`} />
        </CardContent>
      </Card>

      {/* State ICMS Adjustment Card (FREE — shown when adjustment is material) */}
      {result.ajusteIcmsUf && Math.abs(result.ajusteIcmsUf.ajustePp) > 0.3 && (
        <div className={`rounded-lg border p-4 flex items-start gap-3 ${
          result.ajusteIcmsUf.direcao === "desfavoravel"
            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
            : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
        }`}>
          <ShieldAlert className={`h-5 w-5 shrink-0 mt-0.5 ${
            result.ajusteIcmsUf.direcao === "desfavoravel" ? "text-amber-600" : "text-emerald-600"
          }`} />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Ajuste Estadual: ICMS {input.uf}
            </p>
            <p className="text-sm text-muted-foreground">
              Alíquota modal de {result.ajusteIcmsUf.ufAliquota}% vs. média nacional de {result.ajusteIcmsUf.referenciaAliquota}%.
              {" "}Ajuste de {result.ajusteIcmsUf.ajustePp > 0 ? "+" : ""}{result.ajusteIcmsUf.ajustePp.toFixed(1)}pp
              na carga atual estimada (margem bruta do setor: {Math.round(result.ajusteIcmsUf.margemEstimada * 100)}%).
            </p>
          </div>
        </div>
      )}

      {/* Erros Comuns do Seu Perfil (FREE) */}
      {errosComuns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-rose-500" />
              Erros Comuns do Seu Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Com base no seu setor, regime e porte, estes são os erros mais frequentes entre empresas similares.
            </p>
            <div className="space-y-3">
              {errosComuns.map((erro) => (
                <div key={erro.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${
                    erro.severidade === "alta" ? "bg-red-500" :
                    erro.severidade === "media" ? "bg-amber-500" :
                    "bg-slate-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{erro.titulo}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{erro.descricao}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {erro.artigoUrl && (
                        <Link href={erro.artigoUrl} className="text-xs text-primary hover:underline">
                          Saiba mais
                        </Link>
                      )}
                      <Link
                        href={`/assistente?q=${encodeURIComponent(erro.perguntaSugerida)}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="h-3 w-3" />
                        Pergunte à assistente
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA (for free users — placed early to drive conversion) */}
      {!isPaid && (
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold">
              Seu diagnóstico tem {alertCount} alertas e{" "}
              {gatedChecklistCount} ações
            </h3>
            <p className="text-slate-300 max-w-lg mx-auto">
              Desbloqueie o relatório completo com análise de regime, projeção ano a ano, checklist de adequação e exportação em PDF.
            </p>
            <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-center">
              <Button asChild size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 sm:w-auto">
                <Link href="/checkout">
                  Desbloquear por R$49
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Pagamento único. Sem assinatura. Acesso permanente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Formalization Pressure — "O Custo Oculto" (FREE — strongest conversion driver) */}
      {result.efetividadeTributaria.impactoFormalizacao > 0 && (
        <Card className="border border-amber-200 dark:border-amber-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              O Custo Oculto da Reforma
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A reforma não muda apenas as alíquotas — ela muda a forma como os impostos são cobrados.
              A partir de 2027, o governo vai reter o imposto automaticamente nas transações eletrônicas,
              antes do dinheiro chegar na sua conta.
            </p>

            {/* The "reveal" — decomposed impact */}
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Mudança de alíquotas</span>
                <span className={`font-medium ${result.efetividadeTributaria.impactoMudancaAliquota > 0 ? "text-red-600" : "text-emerald-700"}`}>
                  {result.efetividadeTributaria.impactoMudancaAliquota > 0 ? "+" : ""}
                  R$ {Math.abs(result.efetividadeTributaria.impactoMudancaAliquota).toLocaleString("pt-BR")}/ano
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Cobrança mais rigorosa no seu setor</span>
                <span className="font-medium text-amber-800 dark:text-amber-300">
                  +R$ {result.efetividadeTributaria.impactoFormalizacao.toLocaleString("pt-BR")}/ano
                </span>
              </div>
              <div className="border-t pt-2 mt-2 flex items-center justify-between font-medium">
                <span>Impacto real estimado</span>
                <span className={`text-lg ${result.efetividadeTributaria.impactoTotalEstimado > 0 ? "text-red-600" : "text-emerald-700"}`}>
                  {result.efetividadeTributaria.impactoTotalEstimado > 0 ? "+" : ""}
                  R$ {Math.abs(result.efetividadeTributaria.impactoTotalEstimado).toLocaleString("pt-BR")}/ano
                </span>
              </div>
            </div>

            {/* Sector context — non-judgmental */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">Carga efetiva hoje</div>
                <div className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
                  {result.efetividadeTributaria.cargaEfetivaAtualPct}%
                </div>
                <div className="text-xs text-muted-foreground">do faturamento</div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">Carga exigida por lei</div>
                <div className="text-lg font-bold text-red-700 dark:text-red-400">
                  {result.efetividadeTributaria.cargaLegalAtualPct}%
                </div>
                <div className="text-xs text-muted-foreground">do faturamento</div>
              </div>
            </div>

            {/* Plain-language explanation */}
            <p className="text-sm">
              No setor de <strong>{input.setor}</strong>, dados da Receita Federal indicam que
              a maioria das empresas paga cerca de <strong>{Math.round(result.efetividadeTributaria.fatorEfetividade * 100)}%</strong> do
              imposto previsto em lei. Com o novo sistema de cobrança automática,
              essa diferença vai diminuir gradualmente até 2033.
            </p>

            {/* Pressure badge */}
            {(result.efetividadeTributaria.pressaoFormalizacao === "alta" ||
              result.efetividadeTributaria.pressaoFormalizacao === "muito_alta") && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-950 dark:text-amber-200">
                  <strong>O que fazer:</strong> Verifique sua situação fiscal no
                  e-CAC da Receita Federal. Existem programas de regularização com
                  condições facilitadas — e as melhores condições são antes da reforma entrar em vigor.
                </p>
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground">
              Estimativa baseada em dados públicos sobre a arrecadação efetiva do setor, não em dados
              individuais da sua empresa. Empresas que já pagam todos os impostos em dia terão impacto menor.
            </p>
            <EntendaMelhorButton question={`O que significa a cobrança mais rigorosa para o setor de ${input.setor}? Como me preparar?`} />
          </CardContent>
        </Card>
      )}

      {/* Cash flow impact from split payment (FREE) */}
      {result.impactoFluxoCaixa.retencaoMensal > 0 && (
        <Card className="border border-sky-200 dark:border-sky-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-sky-600" />
              Impacto no Seu Fluxo de Caixa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A partir de 2027, o imposto é retido automaticamente a cada venda —
              antes do dinheiro chegar na sua conta. Veja como isso afeta seu caixa:
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="p-3 bg-sky-50 dark:bg-sky-950/20 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">A cada R$10 mil em vendas</div>
                <div className="text-xl font-bold text-sky-700 dark:text-sky-300">
                  R$ {result.impactoFluxoCaixa.porCadaDezMil.toLocaleString("pt-BR")}
                </div>
                <div className="text-xs text-muted-foreground">retidos na hora</div>
              </div>
              <div className="p-3 bg-sky-50 dark:bg-sky-950/20 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">Retenção mensal estimada</div>
                <div className="text-xl font-bold text-sky-700 dark:text-sky-300">
                  R$ {result.impactoFluxoCaixa.retencaoMensal.toLocaleString("pt-BR")}
                </div>
                <div className="text-xs text-muted-foreground">/mês</div>
              </div>
              <div className="p-3 bg-sky-50 dark:bg-sky-950/20 rounded-lg text-center">
                <div className="text-xs text-muted-foreground">Capital de giro adicional</div>
                <div className="text-xl font-bold text-sky-700 dark:text-sky-300">
                  R$ {result.impactoFluxoCaixa.capitalGiroAdicional.toLocaleString("pt-BR")}
                </div>
                <div className="text-xs text-muted-foreground">necessário</div>
              </div>
            </div>

            <p className="text-sm">
              Hoje, quando você recebe R$10.000, o valor integral vai para sua conta e você tem
              cerca de 40 dias para pagar o imposto. Com a retenção automática, R$ {result.impactoFluxoCaixa.porCadaDezMil.toLocaleString("pt-BR")} vão
              direto para o governo — você recebe apenas R$ {(10000 - result.impactoFluxoCaixa.porCadaDezMil).toLocaleString("pt-BR")}.
            </p>

            <p className="text-xs text-muted-foreground">
              Estimativa com base na alíquota projetada de IBS+CBS para o setor de {input.setor}.
              Retenção automática prevista a partir de 2027.
            </p>
            <EntendaMelhorButton question="Como planejar meu fluxo de caixa para a retenção automática de impostos?" />
          </CardContent>
        </Card>
      )}

      {/* Alerts (PARTIAL) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Alertas ({alertCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.alertas.slice(0, freeAlertCount).map((alerta, i) => (
            <div key={i} className="flex items-start gap-2 text-sm p-3 bg-muted/30 rounded-lg">
              <span>{alerta}</span>
            </div>
          ))}
          {alertCount > freeAlertCount && (
            <GatedSection locked={!isPaid} ctaText={`Desbloqueie +${alertCount - freeAlertCount} alertas`} placeholderLines={Math.min(alertCount - freeAlertCount, 5)}>
              {result.alertas.slice(freeAlertCount).map((alerta, i) => (
                <div key={i} className="flex items-start gap-2 text-sm p-3 bg-muted/30 rounded-lg">
                  <span>{alerta}</span>
                </div>
              ))}
            </GatedSection>
          )}
          <EntendaMelhorButton question="Explique os alertas do meu diagnóstico e o que devo priorizar." />
        </CardContent>
      </Card>

      {/* Timeline (PARTIAL) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Datas Importantes ({timelineCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.datasImportantes.slice(0, freeTimelineCount).map((data, i) => (
              <div key={i} className="flex items-start gap-3">
                <Badge
                  variant={
                    data.urgencia === "danger"
                      ? "destructive"
                      : data.urgencia === "warning"
                        ? "secondary"
                        : "outline"
                  }
                  className="shrink-0"
                >
                  {data.data}
                </Badge>
                <span className="text-sm">{data.descricao}</span>
              </div>
            ))}
            {timelineCount > freeTimelineCount && (
              <GatedSection locked={!isPaid} ctaText={`Desbloqueie +${timelineCount - freeTimelineCount} datas`} placeholderLines={Math.min(timelineCount - freeTimelineCount, 5)}>
                {result.datasImportantes.slice(freeTimelineCount).map((data, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Badge
                      variant={
                        data.urgencia === "danger"
                          ? "destructive"
                          : data.urgencia === "warning"
                            ? "secondary"
                            : "outline"
                      }
                      className="shrink-0"
                    >
                      {data.data}
                    </Badge>
                    <span className="text-sm">{data.descricao}</span>
                  </div>
                ))}
              </GatedSection>
            )}
            <EntendaMelhorButton question="Quais são os prazos mais urgentes para minha empresa?" />
          </div>
        </CardContent>
      </Card>

      {/* Action Checklist (PARTIAL) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            Ações Recomendadas ({totalChecklistItems})
            {isPaid && completedCount > 0 && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {completedCount}/{totalChecklistItems} concluídas
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.acoesRecomendadas.slice(0, freeActionCount).map((acao, i) => {
            const itemId = getItemId(i, acao)
            return isPaid ? (
              <ChecklistItem
                key={itemId}
                id={itemId}
                label={acao}
                completed={completedItems.includes(itemId)}
                onToggle={toggleChecklistItem}
              />
            ) : (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>{acao}</span>
              </div>
            )
          })}
          <GatedSection locked={!isPaid} ctaText="Desbloqueie o checklist completo">
            <div className="space-y-3">
              {result.acoesRecomendadas.slice(freeActionCount).map((acao, i) => {
                const itemId = getItemId(freeActionCount + i, acao)
                return (
                  <ChecklistItem
                    key={itemId}
                    id={itemId}
                    label={acao}
                    completed={completedItems.includes(itemId)}
                    onToggle={toggleChecklistItem}
                  />
                )
              })}
              <div className="border-t pt-3 mt-3">
                <p className="text-sm font-medium mb-3">Checklist de Adequação</p>
                {result.gatedContent.checklistCompleto.map((item, i) => {
                  const itemId = getItemId(result.acoesRecomendadas.length + i, item)
                  return (
                    <div key={itemId} className="mb-2">
                      <ChecklistItem
                        id={itemId}
                        label={item}
                        completed={completedItems.includes(itemId)}
                        onToggle={toggleChecklistItem}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          </GatedSection>
          <EntendaMelhorButton question="Quais ações recomendadas são mais urgentes para minha empresa?" />
        </CardContent>
      </Card>

      {/* AI Assistant CTA */}
      <AssistantCTA isPaid={isPaid} setor={input.setor} nivelRisco={result.nivelRisco} />

      {/* Regime Comparison (PAID ONLY) */}
      {(result.gatedContent.analiseRegime || (!isPaid && hasAnaliseRegime)) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Análise de Regime Tributário
              {!isPaid && <Lock className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GatedSection locked={!isPaid} ctaText="Desbloqueie a análise de regime" placeholderLines={5}>
              {result.gatedContent.analiseRegime ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-xs text-muted-foreground">Regime Atual</p>
                      <p className="font-medium">{result.gatedContent.analiseRegime.regimeAtual}</p>
                    </div>
                    {result.gatedContent.analiseRegime.regimeSugerido && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-900">
                        <p className="text-xs text-muted-foreground">Regime Sugerido</p>
                        <p className="font-medium text-emerald-800 dark:text-emerald-300">
                          {result.gatedContent.analiseRegime.regimeSugerido}
                        </p>
                      </div>
                    )}
                  </div>
                  {result.gatedContent.analiseRegime.economiaEstimada && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-center">
                      <p className="text-sm text-muted-foreground">Economia estimada com migração</p>
                      <p className="text-2xl font-bold text-emerald-700">
                        R$ {result.gatedContent.analiseRegime.economiaEstimada.toLocaleString("pt-BR")}/ano
                      </p>
                    </div>
                  )}
                  <p className="text-sm">{result.gatedContent.analiseRegime.justificativa}</p>
                  <ul className="space-y-2">
                    {result.gatedContent.analiseRegime.fatores.map((fator, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-1 shrink-0 text-muted-foreground" />
                        {fator}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </GatedSection>
            <EntendaMelhorButton question="Vale a pena mudar meu regime tributário?" />
          </CardContent>
        </Card>
      )}

      {/* Year-by-Year Projection (PAID ONLY) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Projeção Ano a Ano (2026-2033)
            {!isPaid && <Lock className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GatedSection locked={!isPaid} ctaText="Desbloqueie a projeção completa">
            <div className="space-y-3">
              {result.gatedContent.projecaoAnual.map((proj) => (
                <div key={proj.ano} className="flex flex-col gap-1 p-3 bg-muted/30 rounded-lg sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center justify-between sm:contents">
                    <span className="font-mono font-bold text-sm w-12">{proj.ano}</span>
                    <div className={`text-sm font-medium shrink-0 sm:order-last ${proj.diferencaVsAtual > 0 ? "text-red-600" : "text-emerald-700"}`}>
                      {proj.diferencaVsAtual > 0 ? "+" : ""}R$ {Math.abs(proj.diferencaVsAtual).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{proj.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      IBS {proj.aliquotaIBS}% + CBS {proj.aliquotaCBS}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GatedSection>
          <EntendaMelhorButton question="Como vai ficar minha carga tributária ano a ano até 2033?" />
        </CardContent>
      </Card>

      {/* PDF Export & Share (PAID ONLY) */}
      <Card>
        <CardContent className="p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Exportar e Compartilhar</p>
            <p className="text-sm text-muted-foreground">Baixe o PDF ou envie direto pelo WhatsApp para seu contador</p>
          </div>
          <PdfDownloadButton isPaid={isPaid} />
        </CardContent>
      </Card>

      {/* Recalculate section */}
      {isPaid ? (
        <RerunForm
          currentInput={input}
          isPaid={isPaid}
          runsRemaining={runsRemaining}
        />
      ) : (
        <RerunGatedCTA />
      )}

      {/* Methodology (moved to bottom — supporting detail, not the key message) */}
      <MethodologyCard metodologia={result.metodologia} />

      {/* Feedback prompts */}
      {!isPaid && (
        <FeedbackPrompt
          promptId="diagnostic_free_objection"
          feedbackType="pre_purchase"
          title="O que falta para você desbloquear?"
          subtitle="Sua opinião nos ajuda a melhorar."
          mode="options"
          options={[
            { value: "mais_detalhes", label: "Preciso ver mais detalhes" },
            { value: "preco", label: "O preço não cabe agora" },
            { value: "contador", label: "Já tenho um contador" },
            { value: "utilidade", label: "Não sei se vai ser útil" },
          ]}
          allowComment
          commentPlaceholder="Quer nos contar mais? (opcional)"
          delayMs={20000}
          metadata={{ page: "diagnostico", risco: result.nivelRisco, setor: input.setor }}
        />
      )}

      {/* Post-purchase satisfaction */}
      {isPaid && (
        <FeedbackPrompt
          promptId="diagnostic_satisfaction"
          feedbackType="post_purchase"
          title="O diagnóstico te ajudou?"
          subtitle="Uma nota rápida nos ajuda a melhorar."
          mode="rating_comment"
          lowRatingFollowUp={{
            question: "O que podemos melhorar?",
            options: [
              { value: "info_rasa", label: "Informações superficiais" },
              { value: "confuso", label: "Difícil de entender" },
              { value: "dados_errados", label: "Dados não parecem certos" },
              { value: "pouca_orientacao", label: "Faltou orientação prática" },
            ],
          }}
          highRatingFollowUp={{
            question: "O que mais te ajudou?",
            options: [
              { value: "alertas", label: "Alertas e recomendações" },
              { value: "projecao", label: "Projeção ano a ano" },
              { value: "checklist", label: "Checklist de adequação" },
              { value: "regime", label: "Análise de regime" },
              { value: "pdf", label: "Exportação em PDF" },
            ],
          }}
          metadata={{ page: "diagnostico", risco: result.nivelRisco, setor: input.setor }}
        />
      )}
    </div>
  )
}
