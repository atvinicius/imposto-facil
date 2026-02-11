import type { MetadataRoute } from "next"
import { categories, getArticlesByCategory } from "@/lib/content"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/simulador`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]

  const articlePages: MetadataRoute.Sitemap = Object.keys(categories).flatMap((category) => {
    const articles = getArticlesByCategory(category)
    return articles.map((article) => ({
      url: `${BASE_URL}/conhecimento/${article.category}/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))
  })

  return [...staticPages, ...articlePages]
}
