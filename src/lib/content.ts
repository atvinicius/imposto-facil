import fs from "fs"
import path from "path"
import matter from "gray-matter"

const contentDirectory = path.join(process.cwd(), "src/content")

export interface ArticleFrontmatter {
  title: string
  description: string
  category: string
  tags?: string[]
  publishedAt?: string
  updatedAt?: string
}

export interface Article {
  slug: string
  category: string
  frontmatter: ArticleFrontmatter
  content: string
}

export interface ArticleSummary {
  slug: string
  category: string
  title: string
  description: string
  tags?: string[]
}

export const categories = {
  ibs: {
    name: "IBS",
    description: "Imposto sobre Bens e Servicos",
    fullName: "Imposto sobre Bens e Servicos (IBS)",
  },
  cbs: {
    name: "CBS",
    description: "Contribuicao sobre Bens e Servicos",
    fullName: "Contribuicao sobre Bens e Servicos (CBS)",
  },
  is: {
    name: "IS",
    description: "Imposto Seletivo",
    fullName: "Imposto Seletivo (IS)",
  },
  transicao: {
    name: "Transicao",
    description: "Periodo de transicao e cronograma",
    fullName: "Periodo de Transicao",
  },
  glossario: {
    name: "Glossario",
    description: "Termos e definicoes importantes",
    fullName: "Glossario de Termos",
  },
} as const

export type CategoryKey = keyof typeof categories

export function getArticlesByCategory(category: string): ArticleSummary[] {
  const categoryPath = path.join(contentDirectory, category)

  if (!fs.existsSync(categoryPath)) {
    return []
  }

  const files = fs.readdirSync(categoryPath).filter((file) => file.endsWith(".mdx"))

  const articles: ArticleSummary[] = files.map((file) => {
    const filePath = path.join(categoryPath, file)
    const fileContent = fs.readFileSync(filePath, "utf-8")
    const { data } = matter(fileContent)
    const slug = file.replace(/\.mdx$/, "")

    return {
      slug,
      category,
      title: data.title || slug,
      description: data.description || "",
      tags: data.tags || [],
    }
  })

  return articles.sort((a, b) => a.title.localeCompare(b.title, "pt-BR"))
}

export function getArticle(category: string, slug: string): Article | null {
  const filePath = path.join(contentDirectory, category, `${slug}.mdx`)

  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, "utf-8")
  const { data, content } = matter(fileContent)

  return {
    slug,
    category,
    frontmatter: {
      title: data.title || slug,
      description: data.description || "",
      category: data.category || category,
      tags: data.tags || [],
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt,
    },
    content,
  }
}

export function getAllArticles(): ArticleSummary[] {
  const allArticles: ArticleSummary[] = []

  for (const category of Object.keys(categories)) {
    const articles = getArticlesByCategory(category)
    allArticles.push(...articles)
  }

  return allArticles
}

export function searchArticles(query: string): ArticleSummary[] {
  const allArticles = getAllArticles()
  const lowerQuery = query.toLowerCase()

  return allArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(lowerQuery) ||
      article.description.toLowerCase().includes(lowerQuery) ||
      article.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
  )
}
