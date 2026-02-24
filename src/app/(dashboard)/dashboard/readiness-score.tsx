"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { ReadinessResult } from "@/lib/readiness/score"

interface ReadinessScoreCardProps {
  score: ReadinessResult
}

const LABEL_COLORS: Record<string, string> = {
  Crítico: "text-red-600",
  Inicial: "text-amber-600",
  Moderado: "text-yellow-600",
  Bom: "text-emerald-600",
  Excelente: "text-green-600",
}

const RING_COLORS: Record<string, string> = {
  Crítico: "#dc2626",
  Inicial: "#d97706",
  Moderado: "#ca8a04",
  Bom: "#059669",
  Excelente: "#16a34a",
}

const BREAKDOWN_ITEMS = [
  { key: "profile" as const, label: "Perfil completo", max: 40 },
  { key: "diagnosticViewed" as const, label: "Diagnóstico gerado", max: 20 },
  { key: "diagnosticPurchased" as const, label: "Diagnóstico completo", max: 20 },
  { key: "checklistDone" as const, label: "Checklist concluído", max: 20 },
]

export function ReadinessScoreCard({ score }: ReadinessScoreCardProps) {
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (score.total / 100) * circumference
  const ringColor = RING_COLORS[score.label] ?? "#dc2626"

  return (
    <Card>
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          {/* Circular progress */}
          <div className="relative shrink-0">
            <svg width="132" height="132" viewBox="0 0 132 132">
              <circle
                cx="66"
                cy="66"
                r="54"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-muted/50"
              />
              <circle
                cx="66"
                cy="66"
                r="54"
                fill="none"
                stroke={ringColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 66 66)"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{score.total}</span>
              <span className={`text-xs font-medium ${LABEL_COLORS[score.label] ?? "text-muted-foreground"}`}>
                {score.label}
              </span>
            </div>
          </div>

          {/* Breakdown + next steps */}
          <div className="flex-1 min-w-0 w-full">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Preparação para a Reforma
            </h3>

            <div className="space-y-3">
              {BREAKDOWN_ITEMS.map((item) => {
                const value = score.breakdown[item.key]
                const pct = (value / item.max) * 100
                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium tabular-nums">
                        {value}/{item.max}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {score.nextSteps.length > 0 && (
              <div className="mt-5 pt-4 border-t">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                  Próximos passos
                </p>
                <ul className="space-y-1.5">
                  {score.nextSteps.map((step) => (
                    <li key={step} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
                {score.nextSteps[0]?.includes("perfil") && (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href="/perfil">Completar perfil</Link>
                  </Button>
                )}
                {score.nextSteps[0]?.includes("simulador") && (
                  <Button asChild size="sm" variant="outline" className="mt-3">
                    <Link href="/simulador">Abrir simulador</Link>
                  </Button>
                )}
                {score.nextSteps[0]?.includes("Desbloqueie") && (
                  <Button asChild size="sm" className="mt-3">
                    <Link href="/checkout">Desbloquear por R$49</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
