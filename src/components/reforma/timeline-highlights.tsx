interface TimelineEntry {
  ano: number
  descricao: string
}

export function TimelineHighlights({ entries, narrative }: { entries: TimelineEntry[]; narrative: string }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Cronograma da Transicao</h2>
      <p className="text-muted-foreground mb-6 leading-relaxed">{narrative}</p>
      <div className="relative pl-6 border-l-2 border-border space-y-6">
        {entries.map((entry) => (
          <div key={entry.ano} className="relative">
            <div className="absolute -left-[calc(0.75rem+1px)] top-0.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />
            <div className="text-sm font-semibold text-primary mb-1">{entry.ano}</div>
            <p className="text-sm text-muted-foreground">{entry.descricao}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
