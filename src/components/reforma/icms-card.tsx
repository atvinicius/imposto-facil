interface IcmsCardProps {
  ufNome: string
  icmsRate: number
  icmsReferencia: number
  margemBruta: number
  ajustePp: number
  direcao: "favoravel" | "desfavoravel" | "neutro"
  narrative: string
  fonte: string
}

const DIRECAO_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  favoravel:    { bg: "bg-green-100",  text: "text-green-800",  label: "Favoravel" },
  desfavoravel: { bg: "bg-red-100",    text: "text-red-800",    label: "Desfavoravel" },
  neutro:       { bg: "bg-gray-100",   text: "text-gray-800",   label: "Neutro" },
}

export function IcmsCard(props: IcmsCardProps) {
  const badge = DIRECAO_BADGE[props.direcao]

  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Ajuste Estadual de ICMS</h2>
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-medium text-muted-foreground">Direcao do ajuste:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
        </div>

        <p className="text-muted-foreground mb-6 leading-relaxed">{props.narrative}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-md bg-muted/50 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">ICMS {props.ufNome}</div>
            <div className="text-xl font-bold">{props.icmsRate}%</div>
          </div>
          <div className="rounded-md bg-muted/50 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Media Nacional</div>
            <div className="text-xl font-bold">{props.icmsReferencia}%</div>
          </div>
          <div className="rounded-md bg-muted/50 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Margem Bruta</div>
            <div className="text-xl font-bold">{(props.margemBruta * 100).toFixed(0)}%</div>
          </div>
          <div className="rounded-md bg-muted/50 p-3 text-center">
            <div className="text-xs text-muted-foreground mb-1">Ajuste</div>
            <div className="text-xl font-bold">
              {props.ajustePp > 0 ? "+" : ""}{props.ajustePp.toFixed(1)}pp
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">Fonte: {props.fonte}</p>
      </div>
    </section>
  )
}
