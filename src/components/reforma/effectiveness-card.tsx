interface EffectivenessCardProps {
  fatorEfetividade: number
  cargaEfetivaPct: number
  cargaLegalPct: number
  impactoAliquota: number
  impactoFormalizacao: number
  impactoTotal: number
  pressao: string
  narrative: string
}

const PRESSAO_BADGE: Record<string, { bg: string; text: string }> = {
  baixa:      { bg: "bg-green-100",  text: "text-green-800" },
  moderada:   { bg: "bg-yellow-100", text: "text-yellow-800" },
  alta:       { bg: "bg-orange-100", text: "text-orange-800" },
  muito_alta: { bg: "bg-red-100",    text: "text-red-800" },
}

function formatBRL(v: number): string {
  return Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: 0 })
}

export function EffectivenessCard(props: EffectivenessCardProps) {
  const badge = PRESSAO_BADGE[props.pressao] ?? PRESSAO_BADGE.baixa
  const pressaoLabel = props.pressao === "muito_alta" ? "Muito Alta" : props.pressao.charAt(0).toUpperCase() + props.pressao.slice(1)

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">O Custo Oculto da Reforma</h2>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-muted-foreground">Pressao de formalizacao:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
            {pressaoLabel}
          </span>
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed">{props.narrative}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-md bg-muted/50 p-4">
            <div className="text-sm text-muted-foreground mb-1">Carga Efetiva Atual</div>
            <div className="text-2xl font-bold">{props.cargaEfetivaPct.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">O que o setor paga, em media</div>
          </div>
          <div className="rounded-md bg-muted/50 p-4">
            <div className="text-sm text-muted-foreground mb-1">Carga Legal Atual</div>
            <div className="text-2xl font-bold">{props.cargaLegalPct.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">O que a lei exige</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Impacto da mudanca de aliquota</span>
            <span className={props.impactoAliquota > 0 ? "text-red-600" : "text-green-600"}>
              {props.impactoAliquota > 0 ? "+" : ""}R$ {formatBRL(props.impactoAliquota)}/ano
            </span>
          </div>
          <div className="flex justify-between">
            <span>Impacto da formalizacao mais rigorosa</span>
            <span className="text-red-600">+R$ {formatBRL(props.impactoFormalizacao)}/ano</span>
          </div>
          <div className="flex justify-between font-semibold border-t border-border pt-2">
            <span>Impacto total estimado</span>
            <span className={props.impactoTotal > 0 ? "text-red-600" : "text-green-600"}>
              {props.impactoTotal > 0 ? "+" : ""}R$ {formatBRL(props.impactoTotal)}/ano
            </span>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          * Referencia: faturamento de R$ 1,5 milhao/ano (faixa EPP). Dados de efetividade baseados em estatisticas publicas da Receita Federal.
        </p>
      </div>
    </section>
  )
}
