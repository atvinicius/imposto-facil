"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Lock,
  Sparkles,
  TrendingUp,
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

export interface ChecklistProgress {
  completed: string[]
  updated_at: string | null
}

interface DiagnosticoReportProps {
  result: SimuladorResult
  input: SimuladorInput
  isPaid: boolean
  justUnlocked?: boolean
  checklistProgress?: ChecklistProgress
}

export function DiagnosticoReport({ result, input, isPaid, justUnlocked, checklistProgress }: DiagnosticoReportProps) {
  const { track } = useAnalytics()
  const trackedRef = useRef(false)

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true
      track("diagnostic_viewed", { isPaid, risco: result.nivelRisco })
    }
  }, [track, isPaid, result.nivelRisco])
  const teaser = gerarTeaser(result, input)
  const riscoInfo = NIVEL_RISCO_LABELS[result.nivelRisco]
  const freeAlertCount = 3
  const freeActionCount = 2

  const completedItems = checklistProgress?.completed ?? []
  const allChecklistItems = [
    ...result.acoesRecomendadas,
    ...result.gatedContent.checklistCompleto,
  ]
  const totalChecklistItems = allChecklistItems.length
  const completedCount = completedItems.length

  function getItemId(index: number, text: string): string {
    return `${index}-${text.substring(0, 20).replace(/\s+/g, "_")}`
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Success banner */}
      {justUnlocked && (
        <div className="rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-300">Diagnóstico Completo desbloqueado!</p>
            <p className="text-sm text-green-700 dark:text-green-400">Todas as análises e projeções estão disponíveis abaixo.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Tributário</h1>
          {isPaid && (
            <Badge variant="outline" className="text-green-600 border-green-300">Completo</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Análise personalizada do impacto da reforma tributária na sua empresa
        </p>
        <Badge className={`text-base px-4 py-1.5 ${riscoInfo.color}`}>
          Nível de Risco: {riscoInfo.label}
        </Badge>
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
              <div className={`text-xl font-bold ${result.impactoAnual.min > 0 ? "text-red-600" : "text-green-600"}`}>
                {result.impactoAnual.min > 0 ? "+" : ""} R$ {Math.abs(result.impactoAnual.min).toLocaleString("pt-BR")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Pior cenário</div>
              <div className={`text-xl font-bold ${result.impactoAnual.max > 0 ? "text-red-600" : "text-green-600"}`}>
                {result.impactoAnual.max > 0 ? "+" : ""} R$ {Math.abs(result.impactoAnual.max).toLocaleString("pt-BR")}
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {result.impactoAnual.percentual > 0
              ? `Aumento estimado de ${result.impactoAnual.percentual}% na carga tributária com a reforma.`
              : `Redução estimada de ${Math.abs(result.impactoAnual.percentual)}% na carga tributária com a reforma.`}
            {" "}Baseado no perfil: {input.setor}, {input.regime}, {input.uf}.
          </p>
        </CardContent>
      </Card>

      {/* Methodology */}
      <MethodologyCard metodologia={result.metodologia} />

      {/* Alerts (PARTIAL) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Alertas ({result.alertas.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.alertas.slice(0, freeAlertCount).map((alerta, i) => (
            <div key={i} className="flex items-start gap-2 text-sm p-3 bg-muted/30 rounded-lg">
              <span>{alerta}</span>
            </div>
          ))}
          {result.alertas.length > freeAlertCount && (
            <GatedSection locked={!isPaid} ctaText={`Desbloqueie +${result.alertas.length - freeAlertCount} alertas`}>
              {result.alertas.slice(freeAlertCount).map((alerta, i) => (
                <div key={i} className="flex items-start gap-2 text-sm p-3 bg-muted/30 rounded-lg">
                  <span>{alerta}</span>
                </div>
              ))}
            </GatedSection>
          )}
        </CardContent>
      </Card>

      {/* Timeline (FREE) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Datas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.datasImportantes.map((data, i) => (
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
          </div>
        </CardContent>
      </Card>

      {/* Action Checklist (PARTIAL) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
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
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
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
        </CardContent>
      </Card>

      {/* Regime Comparison (PAID ONLY) */}
      {result.gatedContent.analiseRegime && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Análise de Regime Tributário
              {!isPaid && <Lock className="h-4 w-4 text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GatedSection locked={!isPaid} ctaText="Desbloqueie a análise de regime">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground">Regime Atual</p>
                    <p className="font-medium">{result.gatedContent.analiseRegime.regimeAtual}</p>
                  </div>
                  {result.gatedContent.analiseRegime.regimeSugerido && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                      <p className="text-xs text-muted-foreground">Regime Sugerido</p>
                      <p className="font-medium text-green-700 dark:text-green-400">
                        {result.gatedContent.analiseRegime.regimeSugerido}
                      </p>
                    </div>
                  )}
                </div>
                {result.gatedContent.analiseRegime.economiaEstimada && (
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Economia estimada com migração</p>
                    <p className="text-2xl font-bold text-green-600">
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
            </GatedSection>
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
                    <div className={`text-sm font-medium shrink-0 sm:order-last ${proj.diferencaVsAtual > 0 ? "text-red-600" : "text-green-600"}`}>
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
        </CardContent>
      </Card>

      {/* PDF Export (PAID ONLY) */}
      <Card>
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium">Exportar PDF</p>
              <p className="text-sm text-muted-foreground">Compartilhe com seu contador</p>
            </div>
          </div>
          <PdfDownloadButton isPaid={isPaid} />
        </CardContent>
      </Card>

      {/* Upgrade CTA */}
      {!isPaid && (
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <CardContent className="p-8 text-center space-y-4">
            <h3 className="text-2xl font-bold">
              Seu diagnóstico tem {result.alertas.length} alertas e{" "}
              {result.gatedContent.checklistCompleto.length} ações
            </h3>
            <p className="text-slate-300 max-w-lg mx-auto">
              Desbloqueie o relatório completo com análise de regime, projeção ano a ano, checklist de adequação e exportação em PDF.
            </p>
            <div className="flex flex-col items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-center">
              <Button asChild size="lg" className="w-full bg-white text-slate-900 hover:bg-slate-100 sm:w-auto">
                <Link href="/checkout">
                  Desbloquear por R$29
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
    </div>
  )
}
