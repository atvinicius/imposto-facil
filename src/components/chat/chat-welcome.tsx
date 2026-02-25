"use client"

import { AssistantAvatar } from "./assistant-avatar"

export interface DiagnosticSummary {
  riskLevel: string
  impactPercent: number
  sector: string
  regime: string
  alertCount: number
  topAlert: string | null
  formalizationPressure: string | null
}

interface ChatWelcomeProps {
  onSendMessage: (message: string) => void
  diagnosticSummary?: DiagnosticSummary | null
}

const SECTOR_LABELS: Record<string, string> = {
  servicos: "Serviços",
  comercio: "Comércio",
  industria: "Indústria",
  tecnologia: "Tecnologia",
  saude: "Saúde",
  educacao: "Educação",
  construcao: "Construção",
  alimentacao: "Alimentação",
  agronegocio: "Agronegócio",
  transporte: "Transporte",
}

function getSectorLabel(sector: string): string {
  return SECTOR_LABELS[sector] || sector
}

function getPersonalizedQuestions(summary: DiagnosticSummary): string[] {
  const questions: string[] = []

  questions.push(
    `Por que meu impacto estimado é de ${summary.impactPercent > 0 ? "+" : ""}${summary.impactPercent}%? O que mais influencia esse número?`
  )

  if (summary.topAlert) {
    questions.push(
      `Explique o alerta "${summary.topAlert}" — o que devo fazer?`
    )
  }

  if (summary.formalizationPressure === "alta" || summary.formalizationPressure === "muito_alta") {
    questions.push(
      `O que significa a cobrança mais rigorosa para o setor de ${getSectorLabel(summary.sector)}? Como me preparar?`
    )
  } else {
    questions.push(
      `Quais são os prazos mais urgentes para minha empresa?`
    )
  }

  questions.push(
    `Quais ações recomendadas são mais urgentes para minha empresa?`
  )

  return questions
}

const fallbackQuestions = [
  "O que muda para minha empresa com a reforma tributária?",
  "Qual o cronograma de transição de 2026 a 2033?",
  "Como funciona o IBS e a CBS no novo sistema?",
  "Quais setores serão mais impactados pela reforma?",
]

export function ChatWelcome({ onSendMessage, diagnosticSummary }: ChatWelcomeProps) {
  const hasDiagnostic = !!diagnosticSummary
  const questions = hasDiagnostic
    ? getPersonalizedQuestions(diagnosticSummary!)
    : fallbackQuestions

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <AssistantAvatar size="lg" className="mb-4" />
      <h3 className="text-xl font-semibold mb-1">
        {hasDiagnostic
          ? "Seu diagnóstico está pronto. Quer entender melhor?"
          : "Pergunte sobre a reforma tributária"}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {hasDiagnostic
          ? "Pergunte sobre o impacto no seu negócio, alertas, prazos ou ações recomendadas. As respostas são baseadas no seu perfil e nos dados do diagnóstico."
          : "Tire dúvidas sobre IBS, CBS, Imposto Seletivo ou o período de transição."}
      </p>
      <div className="grid gap-2 w-full max-w-md">
        {questions.map((question) => (
          <button
            key={question}
            onClick={() => onSendMessage(question)}
            className="text-left px-4 py-3 rounded-lg border hover:border-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition-colors text-sm"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )
}
