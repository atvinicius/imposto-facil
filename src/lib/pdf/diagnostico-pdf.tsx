import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer"
import type { SimuladorInput, SimuladorResult } from "@/lib/simulator"
import { NIVEL_RISCO_LABELS, gerarTeaser } from "@/lib/simulator"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
  },
  header: {
    marginBottom: 24,
    borderBottom: "2px solid #0f172a",
    paddingBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
  riskBadge: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  riskText: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 8,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  impactGrid: {
    flexDirection: "row",
    gap: 16,
    marginVertical: 8,
  },
  impactBox: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
    alignItems: "center",
  },
  impactLabel: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
  },
  alertItem: {
    padding: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 4,
    marginBottom: 4,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 6,
    gap: 8,
  },
  timelineBadge: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 3,
    minWidth: 60,
  },
  checklistItem: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
    paddingVertical: 2,
  },
  checkbox: {
    width: 10,
    height: 10,
    border: "1px solid #94a3b8",
    borderRadius: 2,
    marginTop: 1,
  },
  projectionRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottom: "1px solid #f1f5f9",
  },
  projectionHeader: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    marginBottom: 2,
  },
  regimeBox: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: "1px solid #e2e8f0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#94a3b8",
  },
  positive: { color: "#dc2626" },
  negative: { color: "#16a34a" },
})

interface DiagnosticoPDFProps {
  result: SimuladorResult
  input: SimuladorInput
  userName: string
  generatedAt: string
}

const riskColors: Record<string, { bg: string; text: string }> = {
  baixo: { bg: "#dcfce7", text: "#16a34a" },
  medio: { bg: "#fef9c3", text: "#ca8a04" },
  alto: { bg: "#fed7aa", text: "#ea580c" },
  critico: { bg: "#fecaca", text: "#dc2626" },
}

function formatBRL(value: number): string {
  return `R$ ${Math.abs(value).toLocaleString("pt-BR")}`
}

export function DiagnosticoPDF({ result, input, userName, generatedAt }: DiagnosticoPDFProps) {
  const teaser = gerarTeaser(result, input)
  const riscoInfo = NIVEL_RISCO_LABELS[result.nivelRisco]
  const riskColor = riskColors[result.nivelRisco]

  return (
    <Document>
      {/* Page 1: Summary, Alerts, Timeline */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Diagnóstico Tributário</Text>
          <Text style={styles.subtitle}>
            ImpostoFácil — Relatório gerado para {userName} em {generatedAt}
          </Text>
          <View style={[styles.riskBadge, { backgroundColor: riskColor.bg }]}>
            <Text style={[styles.riskText, { color: riskColor.text }]}>
              Nível de Risco: {riscoInfo.label}
            </Text>
          </View>
        </View>

        {/* Impact Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Impacto</Text>
          <Text style={{ marginBottom: 8 }}>{teaser.impactoResumo}</Text>
          <View style={styles.impactGrid}>
            <View style={styles.impactBox}>
              <Text style={styles.impactLabel}>Melhor cenário</Text>
              <Text
                style={[
                  styles.impactValue,
                  result.impactoAnual.min > 0 ? styles.positive : styles.negative,
                ]}
              >
                {result.impactoAnual.min > 0 ? "+" : "-"} {formatBRL(result.impactoAnual.min)}
              </Text>
            </View>
            <View style={styles.impactBox}>
              <Text style={styles.impactLabel}>Pior cenário</Text>
              <Text
                style={[
                  styles.impactValue,
                  result.impactoAnual.max > 0 ? styles.positive : styles.negative,
                ]}
              >
                {result.impactoAnual.max > 0 ? "+" : "-"} {formatBRL(result.impactoAnual.max)}
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 9, color: "#64748b" }}>
            Perfil: {input.setor} | {input.regime} | {input.uf}
            {result.ajusteIcmsUf && result.ajusteIcmsUf.direcao !== "neutro"
              ? ` | ICMS ${input.uf}: ${result.ajusteIcmsUf.ufAliquota}% (${result.ajusteIcmsUf.direcao === "desfavoravel" ? "acima" : "abaixo"} da média)`
              : ""}
            {" "}| Variação estimada: {result.impactoAnual.percentual > 0 ? "+" : ""}
            {result.impactoAnual.percentual}%
          </Text>
        </View>

        {/* State ICMS Adjustment */}
        {result.ajusteIcmsUf && Math.abs(result.ajusteIcmsUf.ajustePp) > 0.3 && (
          <View style={[styles.section, { padding: 10, backgroundColor: "#fffbeb", borderRadius: 4 }]}>
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 11, marginBottom: 4 }}>
              Ajuste Estadual: ICMS {input.uf}
            </Text>
            <Text style={{ fontSize: 9, color: "#64748b" }}>
              Alíquota modal de {result.ajusteIcmsUf.ufAliquota}% vs. média nacional de {result.ajusteIcmsUf.referenciaAliquota}%.
              {" "}Ajuste de {result.ajusteIcmsUf.ajustePp > 0 ? "+" : ""}{result.ajusteIcmsUf.ajustePp.toFixed(1)}pp
              na carga atual (margem bruta do setor: {Math.round(result.ajusteIcmsUf.margemEstimada * 100)}%).
            </Text>
          </View>
        )}

        {/* Alerts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas ({result.alertas.length})</Text>
          {result.alertas.map((alerta, i) => (
            <View key={i} style={styles.alertItem}>
              <Text>{alerta}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datas Importantes</Text>
          {result.datasImportantes.map((data, i) => (
            <View key={i} style={styles.timelineItem}>
              <View style={styles.timelineBadge}>
                <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold" }}>{data.data}</Text>
              </View>
              <Text style={{ flex: 1 }}>{data.descricao}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ImpostoFácil — Diagnóstico Tributário</Text>
          <Text style={styles.footerText}>Página 1 de 3</Text>
        </View>
      </Page>

      {/* Page 2: Checklist + Regime Analysis */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Checklist de Adequação ({result.gatedContent.checklistCompleto.length} itens)
          </Text>
          {result.gatedContent.checklistCompleto.map((item, i) => (
            <View key={i} style={styles.checklistItem}>
              <View style={styles.checkbox} />
              <Text style={{ flex: 1 }}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Regime Analysis */}
        {result.gatedContent.analiseRegime && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Análise de Regime Tributário</Text>
            <View style={[styles.impactGrid, { marginBottom: 8 }]}>
              <View style={styles.regimeBox}>
                <Text style={{ fontSize: 9, color: "#64748b" }}>Regime Atual</Text>
                <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 2 }}>
                  {result.gatedContent.analiseRegime.regimeAtual}
                </Text>
              </View>
              {result.gatedContent.analiseRegime.regimeSugerido && (
                <View style={[styles.regimeBox, { backgroundColor: "#f0fdf4" }]}>
                  <Text style={{ fontSize: 9, color: "#64748b" }}>Regime Sugerido</Text>
                  <Text style={{ fontFamily: "Helvetica-Bold", marginTop: 2, color: "#16a34a" }}>
                    {result.gatedContent.analiseRegime.regimeSugerido}
                  </Text>
                </View>
              )}
            </View>
            {result.gatedContent.analiseRegime.economiaEstimada && (
              <View style={{ padding: 10, backgroundColor: "#f0fdf4", borderRadius: 4, marginBottom: 8, alignItems: "center" }}>
                <Text style={{ fontSize: 9, color: "#64748b" }}>Economia estimada com migração</Text>
                <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: "#16a34a" }}>
                  {formatBRL(result.gatedContent.analiseRegime.economiaEstimada)}/ano
                </Text>
              </View>
            )}
            <Text style={{ marginBottom: 6 }}>{result.gatedContent.analiseRegime.justificativa}</Text>
            {result.gatedContent.analiseRegime.fatores.map((fator, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 4, marginBottom: 3 }}>
                <Text style={{ color: "#64748b" }}>→</Text>
                <Text style={{ flex: 1 }}>{fator}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>ImpostoFácil — Diagnóstico Tributário</Text>
          <Text style={styles.footerText}>Página 2 de 3</Text>
        </View>
      </Page>

      {/* Page 3: Year-by-Year Projection + Actions + Disclaimer */}
      <Page size="A4" style={styles.page}>
        {/* Projection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projeção Ano a Ano (2026-2033)</Text>
          <View style={styles.projectionHeader}>
            <Text style={{ width: 40, fontFamily: "Helvetica-Bold", fontSize: 9 }}>Ano</Text>
            <Text style={{ flex: 1, fontFamily: "Helvetica-Bold", fontSize: 9 }}>Descrição</Text>
            <Text style={{ width: 60, fontFamily: "Helvetica-Bold", fontSize: 9, textAlign: "center" }}>IBS</Text>
            <Text style={{ width: 60, fontFamily: "Helvetica-Bold", fontSize: 9, textAlign: "center" }}>CBS</Text>
            <Text style={{ width: 80, fontFamily: "Helvetica-Bold", fontSize: 9, textAlign: "right" }}>Diferença</Text>
          </View>
          {result.gatedContent.projecaoAnual.map((proj) => (
            <View key={proj.ano} style={styles.projectionRow}>
              <Text style={{ width: 40, fontFamily: "Helvetica-Bold", fontSize: 9 }}>{proj.ano}</Text>
              <Text style={{ flex: 1, fontSize: 9 }}>{proj.descricao}</Text>
              <Text style={{ width: 60, fontSize: 9, textAlign: "center" }}>{proj.aliquotaIBS}%</Text>
              <Text style={{ width: 60, fontSize: 9, textAlign: "center" }}>{proj.aliquotaCBS}%</Text>
              <Text
                style={[
                  { width: 80, fontSize: 9, textAlign: "right", fontFamily: "Helvetica-Bold" },
                  proj.diferencaVsAtual > 0 ? styles.positive : styles.negative,
                ]}
              >
                {proj.diferencaVsAtual > 0 ? "+" : "-"} {formatBRL(proj.diferencaVsAtual)}
              </Text>
            </View>
          ))}
        </View>

        {/* Recommended Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ações Recomendadas ({result.acoesRecomendadas.length})
          </Text>
          {result.acoesRecomendadas.map((acao, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
              <Text style={{ color: "#16a34a" }}>✓</Text>
              <Text style={{ flex: 1 }}>{acao}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={{ marginTop: "auto", paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
          <Text style={{ fontSize: 8, color: "#94a3b8", lineHeight: 1.5 }}>
            AVISO: Este relatório é uma simulação educativa baseada nas regras aprovadas pela EC
            132/2023 e na Lei Complementar em discussão. As alíquotas e projeções são estimativas e
            podem variar conforme regulamentação final. Este documento não substitui consultoria
            tributária profissional. Consulte seu contador ou advogado tributarista antes de tomar
            decisões baseadas neste relatório.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>ImpostoFácil — Diagnóstico Tributário</Text>
          <Text style={styles.footerText}>Página 3 de 3</Text>
        </View>
      </Page>
    </Document>
  )
}
