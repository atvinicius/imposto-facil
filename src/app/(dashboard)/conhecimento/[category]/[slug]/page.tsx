import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, ExternalLink, ShieldCheck } from "lucide-react"
import { categories, getArticle, getArticlesByCategory, type CategoryKey } from "@/lib/content"
import { MDXContent } from "@/components/knowledge/mdx-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>
}

const DIFFICULTY_LABELS = {
  basico: { label: "Basico", color: "bg-green-100 text-green-700" },
  intermediario: { label: "Intermediario", color: "bg-yellow-100 text-yellow-700" },
  avancado: { label: "Avancado", color: "bg-red-100 text-red-700" },
} as const

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

export default async function ArticlePage({ params }: ArticlePageProps) {
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

  // Resolve related articles
  const relatedArticles = (frontmatter.relatedArticles || [])
    .map((ref) => {
      const [cat, sl] = ref.split("/")
      if (!cat || !sl) return null
      const related = getArticle(cat, sl)
      if (!related) return null
      return { category: cat, slug: sl, title: related.frontmatter.title, description: related.frontmatter.description }
    })
    .filter(Boolean) as { category: string; slug: string; title: string; description: string }[]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/conhecimento/${category}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary">{categoryInfo.name}</Badge>
          {difficultyInfo && (
            <Badge variant="outline" className={difficultyInfo.color}>
              {difficultyInfo.label}
            </Badge>
          )}
          {article.frontmatter.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
          {frontmatter.lastVerified && (
            <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verificado: {frontmatter.lastVerified}
            </Badge>
          )}
        </div>
      </div>

      <MDXContent content={article.content} />

      {/* Official sources */}
      {frontmatter.sources && frontmatter.sources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fontes oficiais</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {frontmatter.sources.map((source, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <ExternalLink className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                  <div>
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {source.name}
                      </a>
                    ) : (
                      <span>{source.name}</span>
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
          </CardContent>
        </Card>
      )}

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div>
          <h3 className="text-base font-semibold mb-3">Artigos relacionados</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {relatedArticles.map((related) => (
              <Link
                key={`${related.category}/${related.slug}`}
                href={`/conhecimento/${related.category}/${related.slug}`}
                className="block p-4 border rounded-lg hover:border-primary/50 transition-colors"
              >
                <p className="font-medium text-sm">{related.title}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{related.description}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-6 mt-12">
        <p className="text-sm text-muted-foreground">
          Tem dúvidas sobre este conteúdo?{" "}
          <Link href="/assistente" className="text-primary hover:underline">
            Tire suas dúvidas sobre este conteúdo
          </Link>
        </p>
      </div>
    </div>
  )
}
