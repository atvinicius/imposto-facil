import Link from "next/link"

interface LinkItem {
  href: string
  label: string
  detail?: string
}

interface InternalLinksProps {
  title?: string
  groups: {
    heading: string
    links: LinkItem[]
  }[]
}

export function InternalLinks({ title = "Paginas Relacionadas", groups }: InternalLinksProps) {
  return (
    <section className="mb-10">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.heading}>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {group.heading}
            </h3>
            <ul className="space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm hover:text-primary transition-colors"
                  >
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
                    <span>{link.label}</span>
                    {link.detail && (
                      <span className="text-xs text-muted-foreground">({link.detail})</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
