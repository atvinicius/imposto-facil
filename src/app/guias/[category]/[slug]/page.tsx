import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowRight, BookOpen, ChevronRight, ExternalLink, ShieldCheck } from "lucide-react"
import { categories, getArticle, getArticlesByCategory, type CategoryKey } from "@/lib/content"
import { GuideMDXContent } from "@/components/guias/guide-mdx-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

interface GuidePageProps {
  params: Promise<{ category: string; slug: string }>
}

const DIFFICULTY_LABELS = {
  basico: { label: "Basico", color: "bg-green-100 text-green-800" },
  intermediario: { label: "Intermediario", color: "bg-yellow-100 text-amber-900" },
  avancado: { label: "Avancado", color: "bg-red-100 text-red-800" },
} as const

function toDateString(value: string | Date | undefined): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString().split("T")[0]
  return String(value)
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  const headings: { id: string; text: string; level: number }[] = []
  let match
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      id: slugify(match[2]),
      text: match[2],
      level: match[1].length,
    })
  }
  return headings
}

function estimateReadingTime(content: string): number {
  const words = content.split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export async function generateStaticParams() {
  const allParams: { category: string; slug: string }[] = []
  for (const category of Object.keys(categories)) {
    const articles = getArticlesByCategory(category)
    for (const article of articles) {
      allParams.push({ category, slug: article.slug })
    }
  }
  return allParams
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { category, slug } = await params
  const article = getArticle(category, slug)
  if (!article) return {}

  const categoryInfo = categories[category as CategoryKey]
  const { frontmatter } = article
  const canonical = `${BASE_URL}/guias/${category}/${slug}`

  return {
    title: `${frontmatter.title} | Guias ImpostoFácil`,
    description: frontmatter.description,
    keywords: frontmatter.searchKeywords,
    alternates: { canonical },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      url: canonical,
      siteName: "ImpostoFácil",
      type: "article",
      publishedTime: toDateString(frontmatter.publishedAt),
      modifiedTime: toDateString(frontmatter.updatedAt) || toDateString(frontmatter.lastVerified),
      section: categoryInfo?.fullName,
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.description,
    },
  }
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { category, slug } = await params

  if (!Object.keys(categories).includes(category)) {
    notFound()
  }

  const article = getArticle(category, slug)
  if (!article) {
    notFound()
  }

  const categoryInfo = categories[category as CategoryKey]
  const { frontmatter } = article
  const difficultyInfo = frontmatter.difficulty ? DIFFICULTY_LABELS[frontmatter.difficulty] : null
  const headings = extractHeadings(article.content)
  const readingTime = estimateReadingTime(article.content)

  // Resolve related articles
  const relatedArticles = (frontmatter.relatedArticles || [])
    .map((ref) => {
      const [cat, sl] = ref.split("/")
      if (!cat || !sl) return null
      const related = getArticle(cat, sl)
      if (!related) return null
      return {
        category: cat,
        slug: sl,
        title: related.frontmatter.title,
        description: related.frontmatter.description,
      }
    })
    .filter(Boolean) as { category: string; slug: string; title: string; description: string }[]

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: frontmatter.title,
        description: frontmatter.description,
        datePublished: toDateString(frontmatter.publishedAt),
        dateModified: toDateString(frontmatter.updatedAt) || toDateString(frontmatter.lastVerified) || toDateString(frontmatter.publishedAt),
        author: {
          "@type": "Organization",
          name: "ImpostoFácil",
          url: BASE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "ImpostoFácil",
          url: BASE_URL,
        },
        mainEntityOfPage: `${BASE_URL}/guias/${category}/${slug}`,
        ...(frontmatter.sources && frontmatter.sources.length > 0 && {
          isBasedOn: frontmatter.sources
            .filter((s) => s.url)
            .map((s) => ({ "@type": "WebPage", url: s.url, name: s.name })),
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Guias", item: `${BASE_URL}/guias` },
          { "@type": "ListItem", position: 3, name: categoryInfo.name, item: `${BASE_URL}/guias/${category}` },
          { "@type": "ListItem", position: 4, name: frontmatter.title },
        ],
      },
      ...(frontmatter.commonQuestions && frontmatter.commonQuestions.length > 0
        ? [{
            "@type": "FAQPage",
            mainEntity: frontmatter.commonQuestions.map((q) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: {
                "@type": "Answer",
                text: `Leia o guia completo sobre ${frontmatter.title} para uma resposta detalhada.`,
              },
            })),
          }]
        : []),
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/guias" className="hover:text-foreground transition-colors">Guias</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/guias/${category}`} className="hover:text-foreground transition-colors">
            {categoryInfo.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate max-w-[200px]">{frontmatter.title}</span>
        </nav>

        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
            {frontmatter.title}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">{frontmatter.description}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{categoryInfo.name}</Badge>
            {difficultyInfo && (
              <Badge variant="outline" className={difficultyInfo.color}>
                {difficultyInfo.label}
              </Badge>
            )}
            {frontmatter.lastVerified && (
              <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verificado em {toDateString(frontmatter.lastVerified)}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {readingTime} min de leitura
            </span>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
          <div>
            {/* Table of contents (mobile - above article) */}
            {headings.length > 2 && (
              <nav className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-4 lg:hidden">
                <p className="text-sm font-semibold text-slate-900 mb-2">Neste guia</p>
                <ul className="space-y-1.5">
                  {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}>
                      <a
                        href={`#${heading.id}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* Article body */}
            <GuideMDXContent content={article.content} />

            {/* Sources card */}
            {frontmatter.sources && frontmatter.sources.length > 0 && (
              <div className="mt-10 rounded-xl border-2 border-sky-200 bg-sky-50/50 p-6">
                <h2 className="text-base font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-sky-600" />
                  Fontes oficiais
                </h2>
                <ul className="space-y-2.5">
                  {frontmatter.sources.map((source, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ExternalLink className="h-3.5 w-3.5 mt-0.5 shrink-0 text-sky-600" />
                      <div>
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-700 hover:underline font-medium"
                          >
                            {source.name}
                          </a>
                        ) : (
                          <span className="font-medium">{source.name}</span>
                        )}
                        {source.articles && source.articles.length > 0 && (
                          <span className="text-muted-foreground"> ({source.articles.join(", ")})</span>
                        )}
                        {source.dateAccessed && (
                          <span className="text-muted-foreground text-xs ml-1">
                            — acessado em {source.dateAccessed}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-10">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Artigos relacionados</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {relatedArticles.map((related) => (
                    <Link
                      key={`${related.category}/${related.slug}`}
                      href={`/guias/${related.category}/${related.slug}`}
                      className="block p-4 border rounded-xl hover:border-primary/50 transition-colors bg-white"
                    >
                      <p className="font-medium text-sm">{related.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{related.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA banner */}
            <div className="mt-10 rounded-xl border border-slate-200 bg-gradient-to-r from-sky-50 to-emerald-50 p-6 text-center">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Descubra o impacto na sua empresa
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Responda algumas perguntas e receba um diagnóstico personalizado com alertas, ações e projeção até 2033.
              </p>
              <Button asChild>
                <Link href="/simulador">
                  Simular impacto agora
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Disclaimer */}
            <p className="mt-8 text-xs text-muted-foreground leading-5">
              Este conteudo tem carater educacional e informativo, baseado na EC 132/2023 e LC 214/2025.
              Nao substitui a orientacao de um contador ou advogado tributarista qualificado.
            </p>
          </div>

          {/* Sidebar TOC (desktop) */}
          {headings.length > 2 && (
            <aside className="hidden lg:block">
              <nav className="sticky top-24 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900 mb-3">Neste guia</p>
                <ul className="space-y-1.5">
                  {headings.map((heading) => (
                    <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
                      <a
                        href={`#${heading.id}`}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors leading-snug block py-0.5"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>
          )}
        </div>
      </div>
    </div>
  )
}
