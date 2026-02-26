import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

export function ReformaBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-6">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-foreground transition-colors">
            Inicio
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            {item.href ? (
              <Link href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function buildBreadcrumbItems(
  segments: { label: string; path: string }[],
  current: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = segments.map((s) => ({
    label: s.label,
    href: s.path,
  }))
  items.push({ label: current })
  return items
}
