import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { categories, getArticle, getArticlesByCategory, type CategoryKey } from "@/lib/content"
import { MDXContent } from "@/components/knowledge/mdx-content"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ArticlePageProps {
  params: Promise<{ category: string; slug: string }>
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/conhecimento/${category}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{categoryInfo.name}</Badge>
          {article.frontmatter.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <MDXContent content={article.content} />

      <div className="border-t pt-6 mt-12">
        <p className="text-sm text-muted-foreground">
          Tem duvidas sobre este conteudo?{" "}
          <Link href="/assistente" className="text-primary hover:underline">
            Pergunte ao nosso assistente virtual
          </Link>
        </p>
      </div>
    </div>
  )
}
