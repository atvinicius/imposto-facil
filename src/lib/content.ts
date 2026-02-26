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
  lastVerified?: string
  difficulty?: "basico" | "intermediario" | "avancado"
  sources?: {
    name: string
    url?: string
    dateAccessed?: string
    articles?: string[]
  }[]
  relatedArticles?: string[]
  searchKeywords?: string[]
  commonQuestions?: string[]
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
  searchKeywords?: string[]
  commonQuestions?: string[]
  difficulty?: "basico" | "intermediario" | "avancado"
}

export const categories = {
  ibs: {
    name: "IBS",
    description: "Imposto sobre Bens e Serviços",
    fullName: "Imposto sobre Bens e Serviços (IBS)",
  },
  cbs: {
    name: "CBS",
    description: "Contribuição sobre Bens e Serviços",
    fullName: "Contribuição sobre Bens e Serviços (CBS)",
  },
  is: {
    name: "IS",
    description: "Imposto Seletivo",
    fullName: "Imposto Seletivo (IS)",
  },
  transicao: {
    name: "Transição",
    description: "Período de transição e cronograma",
    fullName: "Período de Transição",
  },
  glossario: {
    name: "Glossário",
    description: "Termos e definições importantes",
    fullName: "Glossário de Termos",
  },
  setores: {
    name: "Setores",
    description: "Impacto por setor de atividade",
    fullName: "Impacto por Setor",
  },
  regimes: {
    name: "Regimes",
    description: "Guias por regime tributário",
    fullName: "Guias por Regime Tributário",
  },
  faq: {
    name: "FAQ",
    description: "Perguntas frequentes sobre a reforma",
    fullName: "Perguntas Frequentes",
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
      searchKeywords: data.searchKeywords || [],
      commonQuestions: data.commonQuestions || [],
      difficulty: data.difficulty,
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
      updatedAt: data.updatedAt || data.lastUpdated,
      lastVerified: data.lastVerified,
      difficulty: data.difficulty,
      sources: data.sources || [],
      relatedArticles: data.relatedArticles || [],
      searchKeywords: data.searchKeywords || [],
      commonQuestions: data.commonQuestions || [],
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
      article.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      article.searchKeywords?.some((kw) => kw.toLowerCase().includes(lowerQuery)) ||
      article.commonQuestions?.some((q) => q.toLowerCase().includes(lowerQuery))
  )
}
