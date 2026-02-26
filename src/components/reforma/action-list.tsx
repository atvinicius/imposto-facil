export function ActionList({ items }: { items: string[] }) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-4">Acoes Recomendadas</h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-muted-foreground leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
