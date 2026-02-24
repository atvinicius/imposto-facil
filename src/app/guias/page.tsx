import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CircleDollarSign,
  FileText,
  HelpCircle,
  Landmark,
  RefreshCw,
  Scale,
  Store,
} from "lucide-react"
import { categories, getArticlesByCategory, type CategoryKey } from "@/lib/content"
import { Button } from "@/components/ui/button"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

export const metadata: Metadata = {
  title: "Guias da Reforma Tributaria | ImpostoFacil",
  description:
    "23 guias gratuitos sobre a reforma tributaria brasileira (EC 132/2023). IBS, CBS, Imposto Seletivo, cronograma de transicao, impacto por setor e regime — verificados com fontes legislativas oficiais.",
  alternates: { canonical: `${BASE_URL}/guias` },
  openGraph: {
    title: "Guias da Reforma Tributaria — ImpostoFacil",
    description:
      "23 guias gratuitos sobre a reforma tributaria brasileira. Verificados com fontes legislativas oficiais.",
    url: `${BASE_URL}/guias`,
    siteName: "ImpostoFacil",
    type: "website",
    locale: "pt_BR",
  },
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ibs: <Landmark className="h-6 w-6" />,
  cbs: <CircleDollarSign className="h-6 w-6" />,
  is: <Scale className="h-6 w-6" />,
  transicao: <RefreshCw className="h-6 w-6" />,
  glossario: <BookOpen className="h-6 w-6" />,
  setores: <Store className="h-6 w-6" />,
  regimes: <FileText className="h-6 w-6" />,
  faq: <HelpCircle className="h-6 w-6" />,
}

const CATEGORY_COLORS: Record<string, string> = {
  ibs: "bg-sky-50 text-sky-700",
  cbs: "bg-emerald-50 text-emerald-700",
  is: "bg-red-50 text-red-700",
  transicao: "bg-amber-50 text-amber-700",
  glossario: "bg-violet-50 text-violet-700",
  setores: "bg-orange-50 text-orange-700",
  regimes: "bg-indigo-50 text-indigo-700",
  faq: "bg-slate-100 text-slate-700",
}

export default function GuiasIndexPage() {
  const totalArticles = Object.keys(categories).reduce(
    (sum, cat) => sum + getArticlesByCategory(cat).length,
    0
  )

  const categoryData = Object.entries(categories).map(([key, value]) => ({
    key: key as CategoryKey,
    ...value,
    articleCount: getArticlesByCategory(key).length,
  }))

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: "Guias da Reforma Tributaria",
        description: `${totalArticles} guias gratuitos sobre a reforma tributaria brasileira, verificados com fontes legislativas oficiais.`,
        url: `${BASE_URL}/guias`,
        publisher: {
          "@type": "Organization",
          name: "ImpostoFacil",
          url: BASE_URL,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
          { "@type": "ListItem", position: 2, name: "Guias" },
        ],
      },
    ],
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl mb-4">
            Guias da Reforma Tributaria
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {totalArticles} guias gratuitos, verificados com fontes legislativas oficiais.
            Tudo que voce precisa saber sobre IBS, CBS, Imposto Seletivo e a transicao ate 2033.
          </p>
        </header>

        {/* Category grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-12">
          {categoryData.map((cat) => (
            <Link
              key={cat.key}
              href={`/guias/${cat.key}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 hover:border-primary/50 hover:shadow-md transition-all"
            >
              <div className={`mb-3 inline-flex rounded-lg p-2.5 ${CATEGORY_COLORS[cat.key] || "bg-slate-100 text-slate-700"}`}>
                {CATEGORY_ICONS[cat.key]}
              </div>
              <h2 className="text-base font-semibold text-slate-900 mb-1 group-hover:text-primary transition-colors">
                {cat.fullName}
              </h2>
              <p className="text-sm text-muted-foreground mb-2">{cat.description}</p>
              <p className="text-xs font-medium text-primary">
                {cat.articleCount} {cat.articleCount === 1 ? "guia" : "guias"} →
              </p>
            </Link>
          ))}
        </div>

        {/* CTA banner */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-sky-50 to-emerald-50 p-8 text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Quer saber o impacto real na sua empresa?
          </h2>
          <p className="text-sm text-muted-foreground mb-5 max-w-xl mx-auto">
            Os guias explicam a teoria. O simulador calcula o impacto personalizado para o seu negocio
            — em menos de 2 minutos, sem cadastro.
          </p>
          <Button asChild size="lg">
            <Link href="/simulador">
              Simular impacto agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
