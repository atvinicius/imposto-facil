import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronRight, ShieldCheck } from "lucide-react"
import { categories, getArticle, getArticlesByCategory, type CategoryKey } from "@/lib/content"
import { Badge } from "@/components/ui/badge"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

const DIFFICULTY_LABELS = {
  basico: { label: "Basico", color: "bg-green-100 text-green-800" },
  intermediario: { label: "Intermediario", color: "bg-yellow-100 text-yellow-800" },
  avancado: { label: "Avancado", color: "bg-red-100 text-red-800" },
} as const

function toDateString(value: string | Date | undefined): string | undefined {
  if (!value) return undefined
  if (value instanceof Date) return value.toISOString().split("T")[0]
  return String(value)
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  ibs: "Guias sobre o Imposto sobre Bens e Servicos (IBS), o novo imposto estadual e municipal que substituira ICMS e ISS.",
  cbs: "Guias sobre a Contribuicao sobre Bens e Servicos (CBS), que substituira PIS e Cofins no ambito federal.",
  is: "Guias sobre o Imposto Seletivo (IS), o novo tributo sobre bens e servicos prejudiciais a saude e ao meio ambiente.",
  transicao: "Cronograma, prazos e preparacao para o periodo de transicao da reforma tributaria (2026-2033).",
  glossario: "Definicoes e explicacoes dos principais termos da reforma tributaria brasileira.",
  setores: "Analise detalhada do impacto da reforma tributaria por setor de atividade economica.",
  regimes: "Guias especificos para cada regime tributario: Simples Nacional, Lucro Presumido e Lucro Real.",
  faq: "Respostas para as duvidas mais comuns sobre a reforma tributaria e seus impactos.",
}

export async function generateStaticParams() {
  return Object.keys(categories).map((category) => ({ category }))
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params
  const categoryInfo = categories[category as CategoryKey]
  if (!categoryInfo) return {}

  const description = CATEGORY_DESCRIPTIONS[category] || categoryInfo.description
  const canonical = `${BASE_URL}/guias/${category}`

  return {
    title: `${categoryInfo.fullName} | Guias da Reforma Tributaria`,
    description,
    alternates: { canonical },
    openGraph: {
      title: `${categoryInfo.fullName} — Guias ImpostoFacil`,
      description,
      url: canonical,
      siteName: "ImpostoFacil",
      type: "website",
      locale: "pt_BR",
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params

  if (!Object.keys(categories).includes(category)) {
    notFound()
  }

  const categoryInfo = categories[category as CategoryKey]
  const articles = getArticlesByCategory(category)

  // Get full article data for lastVerified
  const articlesWithMeta = articles.map((summary) => {
    const full = getArticle(category, summary.slug)
    return {
      ...summary,
      lastVerified: full?.frontmatter.lastVerified,
      description: full?.frontmatter.description || summary.description,
    }
  })

  // Other categories for cross-links
  const otherCategories = Object.entries(categories)
    .filter(([key]) => key !== category)
    .map(([key, value]) => ({
      key,
      ...value,
      articleCount: getArticlesByCategory(key).length,
    }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "Guias", item: `${BASE_URL}/guias` },
      { "@type": "ListItem", position: 3, name: categoryInfo.fullName },
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
          <span className="text-foreground font-medium">{categoryInfo.name}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-2">
            {categoryInfo.fullName}
          </h1>
          <p className="text-lg text-muted-foreground">
            {CATEGORY_DESCRIPTIONS[category] || categoryInfo.description}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {articles.length} {articles.length === 1 ? "guia" : "guias"} disponiveis
          </p>
        </header>

        {/* Article list */}
        <div className="space-y-4 mb-12">
          {articlesWithMeta.map((article) => {
            const difficultyInfo = article.difficulty ? DIFFICULTY_LABELS[article.difficulty] : null
            return (
              <Link
                key={article.slug}
                href={`/guias/${category}/${article.slug}`}
                className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/50 hover:shadow-sm transition-all"
              >
                <h2 className="text-lg font-semibold text-slate-900 mb-1">{article.title}</h2>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{article.description}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {difficultyInfo && (
                    <Badge variant="outline" className={`text-xs ${difficultyInfo.color}`}>
                      {difficultyInfo.label}
                    </Badge>
                  )}
                  {article.lastVerified && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      Verificado em {toDateString(article.lastVerified)}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Cross-links to other categories */}
        <div className="border-t pt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Explore outras categorias</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherCategories.map((cat) => (
              <Link
                key={cat.key}
                href={`/guias/${cat.key}`}
                className="rounded-xl border border-slate-200 bg-white p-4 hover:border-primary/50 transition-colors"
              >
                <p className="font-medium text-sm text-slate-900">{cat.fullName}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {cat.articleCount} {cat.articleCount === 1 ? "guia" : "guias"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
