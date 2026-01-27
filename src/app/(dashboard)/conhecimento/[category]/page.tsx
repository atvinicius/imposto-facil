import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { categories, getArticlesByCategory, type CategoryKey } from "@/lib/content"
import { ArticleCard } from "@/components/knowledge/article-card"
import { Button } from "@/components/ui/button"

interface CategoryPageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return Object.keys(categories).map((category) => ({
    category,
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params

  if (!Object.keys(categories).includes(category)) {
    notFound()
  }

  const categoryInfo = categories[category as CategoryKey]
  const articles = getArticlesByCategory(category)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/conhecimento">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{categoryInfo.fullName}</h1>
          <p className="text-muted-foreground mt-1">{categoryInfo.description}</p>
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            Nenhum artigo disponivel nesta categoria.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
