"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Info, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SimuladorResult } from "@/lib/simulator"

interface MethodologyCardProps {
  metodologia: SimuladorResult["metodologia"]
  compact?: boolean
}

const CONFIANCA_CONFIG = {
  alta: {
    label: "Alta",
    icon: ShieldCheck,
    color: "text-green-600 bg-green-100",
  },
  media: {
    label: "Média",
    icon: Shield,
    color: "text-amber-900 bg-amber-100",
  },
  baixa: {
    label: "Baixa",
    icon: ShieldAlert,
    color: "text-orange-600 bg-orange-100",
  },
} as const

export function MethodologyCard({ metodologia, compact }: MethodologyCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = CONFIANCA_CONFIG[metodologia.confianca]
  const Icon = config.icon

  if (compact) {
    return (
      <div className="rounded-lg border bg-muted/30 p-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 w-full text-left text-sm"
        >
          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="flex-1 text-muted-foreground">
            {metodologia.resumo.split(".")[0]}.
          </span>
          <Badge variant="outline" className={`shrink-0 text-xs ${config.color}`}>
            <Icon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
        </button>
        {expanded && (
          <div className="mt-3 pt-3 border-t space-y-3">
            <MethodologyDetails metodologia={metodologia} />
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          Metodologia
          <Badge variant="outline" className={`ml-auto text-xs ${config.color}`}>
            <Icon className="h-3 w-3 mr-1" />
            Confiança: {config.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{metodologia.resumo}</p>
        <MethodologyDetails metodologia={metodologia} />
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-3">
          <p className="text-xs text-amber-950 dark:text-amber-200">
            Esta simulação tem caráter informativo e educacional. Não substitui consultoria
            tributária profissional. Consulte seu contador para decisões específicas.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function MethodologyDetails({ metodologia }: { metodologia: SimuladorResult["metodologia"] }) {
  return (
    <>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Fontes utilizadas</p>
        <ul className="space-y-1">
          {metodologia.fontes.slice(0, 6).map((fonte, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
              <span className="text-primary mt-0.5">•</span>
              {fonte}
            </li>
          ))}
          {metodologia.fontes.length > 6 && (
            <li className="text-xs text-muted-foreground">
              +{metodologia.fontes.length - 6} fontes adicionais
            </li>
          )}
        </ul>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Limitações</p>
        <ul className="space-y-1">
          {metodologia.limitacoes.map((lim, i) => (
            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
              <span className="text-amber-700 mt-0.5">•</span>
              {lim}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-muted-foreground">
        Última atualização: {metodologia.ultimaAtualizacao}
      </p>
    </>
  )
}
