interface RegimeBurden {
  regimeNome: string
  cargaAtualMin: number
  cargaAtualMax: number
  cargaNovaMin: number
  cargaNovaMax: number
  risco: string
  percentual: number
}

const RISK_DOT: Record<string, string> = {
  baixo: "bg-green-500",
  medio: "bg-yellow-500",
  alto: "bg-orange-500",
  critico: "bg-red-500",
}

export function BurdenComparison({ regimes }: { regimes: RegimeBurden[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Comparativo de Carga Tributaria por Regime</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Regime</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Carga Atual</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Carga Nova (IBS+CBS)</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Variacao</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">Risco</th>
            </tr>
          </thead>
          <tbody>
            {regimes.map((r) => (
              <tr key={r.regimeNome} className="border-b border-border/50">
                <td className="py-3 px-4 font-medium">{r.regimeNome}</td>
                <td className="py-3 px-4 text-center">
                  {r.cargaAtualMin.toFixed(1)}% – {r.cargaAtualMax.toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-center">
                  {r.cargaNovaMin}% – {r.cargaNovaMax}%
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={r.percentual > 0 ? "text-red-600" : "text-green-600"}>
                    {r.percentual > 0 ? "+" : ""}{r.percentual}%
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${RISK_DOT[r.risco] ?? "bg-gray-400"}`} />
                    <span className="capitalize">{r.risco}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
