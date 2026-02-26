import type { MetadataRoute } from "next"
import { categories, getArticlesByCategory } from "@/lib/content"
import { getAllSetorUfCombinations, getAllSetorRegimeCombinations } from "@/lib/seo/reforma-data"
import { SEO_SETORES, ALL_UFS, REGIME_DISPLAY } from "@/lib/seo/slug-maps"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/simulador`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/guias`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ]

  const categoryPages: MetadataRoute.Sitemap = Object.keys(categories).map((category) => ({
    url: `${BASE_URL}/guias/${category}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const articlePages: MetadataRoute.Sitemap = Object.keys(categories).flatMap((category) => {
    const articles = getArticlesByCategory(category)
    return articles.map((article) => ({
      url: `${BASE_URL}/guias/${article.category}/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  })

  // --- Programmatic SEO pages ---

  // Hub pages
  const reformaHubs: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/reforma`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.8 },
    { url: `${BASE_URL}/reforma/icms`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
  ]

  // Sector hub pages (9)
  const sectorHubs: MetadataRoute.Sitemap = SEO_SETORES.map((setor) => ({
    url: `${BASE_URL}/reforma/${setor}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Tier 1: Sector x State (243 pages)
  const setorUfPages: MetadataRoute.Sitemap = getAllSetorUfCombinations().map(({ setor, uf }) => ({
    url: `${BASE_URL}/reforma/${setor}/${uf.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Tier 2: Sector x Regime (27 pages)
  const setorRegimePages: MetadataRoute.Sitemap = getAllSetorRegimeCombinations().map(({ setor, regime }) => ({
    url: `${BASE_URL}/reforma/${setor}/regime/${REGIME_DISPLAY[regime].slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Tier 3: State ICMS (27 pages)
  const icmsUfPages: MetadataRoute.Sitemap = ALL_UFS.map((uf) => ({
    url: `${BASE_URL}/reforma/icms/${uf.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...categoryPages,
    ...articlePages,
    ...reformaHubs,
    ...sectorHubs,
    ...setorUfPages,
    ...setorRegimePages,
    ...icmsUfPages,
  ]
}
