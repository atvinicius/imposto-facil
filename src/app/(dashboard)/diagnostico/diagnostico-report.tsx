import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Download,
  Lock,
  Mail,
  TrendingUp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GatedSection } from "@/components/ui/gated-section"
import type { SimuladorInput, SimuladorResult } from "@/lib/simulator"
import { NIVEL_RISCO_LABELS, gerarTeaser } from "@/lib/simulator"

interface DiagnosticoReportProps {
  result: SimuladorResult
  input: SimuladorInput
  isPaid: boolean
}

export function DiagnosticoReport({ result, input, isPaid }: DiagnosticoReportProps) {
  const teaser = gerarTeaser(result, input)
  const riscoInfo = NIVEL_RISCO_LABELS[result.nivelRisco]
  const freeAlertCount = 3
  const freeActionCount = 2

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Diagnóstico Tributário</h1>
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
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
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
            Ações Recomendadas ({result.acoesRecomendadas.length + result.gatedContent.checklistCompleto.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.acoesRecomendadas.slice(0, freeActionCount).map((acao, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>{acao}</span>
            </div>
          ))}
          <GatedSection locked={!isPaid} ctaText="Desbloqueie o checklist completo">
            <div className="space-y-3">
              {result.acoesRecomendadas.slice(freeActionCount).map((acao, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <span>{acao}</span>
                </div>
              ))}
              <div className="border-t pt-3 mt-3">
                <p className="text-sm font-medium mb-3">Checklist de Adequação</p>
                {result.gatedContent.checklistCompleto.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm mb-2">
                    <div className="h-4 w-4 rounded border border-muted-foreground/30 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
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
                <div className="grid grid-cols-2 gap-4">
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
                <div key={proj.ano} className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                  <span className="font-mono font-bold text-sm w-12">{proj.ano}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{proj.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      IBS {proj.aliquotaIBS}% + CBS {proj.aliquotaCBS}%
                    </p>
                  </div>
                  <div className={`text-sm font-medium shrink-0 ${proj.diferencaVsAtual > 0 ? "text-red-600" : "text-green-600"}`}>
                    {proj.diferencaVsAtual > 0 ? "+" : ""}R$ {Math.abs(proj.diferencaVsAtual).toLocaleString("pt-BR")}
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
            <Download className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">Exportar PDF</p>
              <p className="text-sm text-muted-foreground">Compartilhe com seu contador</p>
            </div>
          </div>
          <Button variant="outline" disabled={!isPaid}>
            {isPaid ? "Baixar PDF" : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Exclusivo do plano completo
              </>
            )}
          </Button>
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
            <div className="pt-2">
              <WaitlistForm />
            </div>
            <p className="text-xs text-slate-400">
              O Diagnóstico Completo estará disponível em breve por R$29 (pagamento único).
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function WaitlistForm() {
  return (
    <div className="flex items-center gap-2 max-w-sm mx-auto">
      <div className="relative flex-1">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="email"
          placeholder="seu@email.com"
          className="w-full rounded-lg bg-white/10 border border-white/20 px-10 py-2.5 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
      </div>
      <Button variant="secondary" size="default">
        Avise-me
      </Button>
    </div>
  )
}
