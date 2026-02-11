"use client"

import { DudaAvatar } from "./duda-avatar"

interface DudaWelcomeProps {
  onSendMessage: (message: string) => void
}

const starterQuestions = [
  "O que muda para minha empresa com a reforma tributaria?",
  "Qual o cronograma de transicao de 2026 a 2033?",
  "Como funciona o IBS e a CBS no novo sistema?",
  "Quais setores serao mais impactados pela reforma?",
]

export function DudaWelcome({ onSendMessage }: DudaWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <DudaAvatar size="lg" className="mb-4" />
      <h3 className="text-xl font-semibold mb-1">
        Ola! Eu sou a Duda
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Sua assistente especializada na reforma tributaria brasileira.
        Pergunte qualquer coisa sobre IBS, CBS, Imposto Seletivo ou o periodo de transicao.
      </p>
      <div className="grid gap-2 w-full max-w-md">
        {starterQuestions.map((question) => (
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
