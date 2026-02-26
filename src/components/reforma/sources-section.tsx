export function SourcesSection({ sources }: { sources: string[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Fontes e Legislacao</h2>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {sources.map((source, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="flex-shrink-0 mt-1 w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
            <span>{source}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
