import { Suspense } from "react"
import Link from "next/link"
import { MessageSquare } from "lucide-react"
import { categories, getArticlesByCategory, searchArticles, type CategoryKey } from "@/lib/content"
import { CategoryCard } from "@/components/knowledge/category-card"
import { ArticleCard } from "@/components/knowledge/article-card"
import { SearchInput } from "@/components/knowledge/search-input"
import { Skeleton } from "@/components/ui/skeleton"

interface KnowledgePageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const params = await searchParams
  const query = params.q

  if (query) {
    const results = searchArticles(query)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h1>
          <p className="text-muted-foreground mt-2">
            Resultados da busca por &ldquo;{query}&rdquo;
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-10 w-full max-w-sm" />}>
          <SearchInput />
        </Suspense>

        {results.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">
              Nenhum resultado encontrado para &ldquo;{query}&rdquo;
            </p>
            <Link
              href="/assistente"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <MessageSquare className="h-4 w-4" />
              Tire suas dúvidas
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((article) => (
              <ArticleCard key={`${article.category}/${article.slug}`} article={article} />
            ))}
          </div>
        )}
      </div>
    )
  }

  const categoryData = Object.entries(categories).map(([key, value]) => ({
    key: key as CategoryKey,
    ...value,
    articleCount: getArticlesByCategory(key).length,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h1>
        <p className="text-muted-foreground mt-2">
          Explore artigos sobre a reforma tributaria brasileira
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-10 w-full max-w-sm" />}>
        <SearchInput />
      </Suspense>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoryData.map((category) => (
          <CategoryCard
            key={category.key}
            categoryKey={category.key}
            name={category.name}
            description={category.description}
            articleCount={category.articleCount}
          />
        ))}
      </div>
    </div>
  )
}
