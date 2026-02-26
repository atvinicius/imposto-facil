import type { Metadata } from "next"
import Link from "next/link"
import { SEO_SETORES, SETOR_DISPLAY } from "@/lib/seo/slug-maps"
import { buildBreadcrumbJsonLd } from "@/lib/seo/content-blocks"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

export const metadata: Metadata = {
  title: "Reforma Tributaria por Setor e Estado | ImpostoFacil",
  description: "Analise o impacto da reforma tributaria (EC 132/2023) por setor de atividade e estado. Dados de carga tributaria, ICMS, formalizacao e acoes recomendadas.",
  keywords: ["reforma tributaria", "IBS", "CBS", "impacto tributario", "setor", "estado", "ICMS"],
  alternates: { canonical: `${BASE_URL}/reforma` },
  openGraph: {
    title: "Reforma Tributaria por Setor e Estado | ImpostoFacil",
    description: "Analise o impacto da reforma tributaria por setor e estado.",
    url: `${BASE_URL}/reforma`,
    type: "website",
  },
}

export default function ReformaHubPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Reforma Tributaria por Setor e Estado",
      description: "Paginas de analise do impacto da reforma tributaria por setor e estado brasileiro.",
      url: `${BASE_URL}/reforma`,
    },
    buildBreadcrumbJsonLd([
      { name: "Inicio", url: BASE_URL },
      { name: "Reforma Tributaria", url: `${BASE_URL}/reforma` },
    ]),
  ]

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        Reforma Tributaria: Impacto por Setor e Estado
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        A reforma tributaria (EC 132/2023) afeta cada setor de forma diferente.
        Escolha seu setor para ver a analise completa com dados por estado e regime tributario.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SEO_SETORES.map((setor) => {
          const info = SETOR_DISPLAY[setor]
          return (
            <Link
              key={setor}
              href={`/reforma/${setor}`}
              className="group rounded-lg border border-border bg-card p-5 hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="text-2xl mb-2">{info.emoji}</div>
              <h2 className="font-semibold group-hover:text-primary transition-colors mb-1">
                {info.nome}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">{info.descricao}</p>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                27 estados
              </span>
            </Link>
          )
        })}
      </div>

      <div className="mt-10 rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold mb-3">Analise por ICMS Estadual</h2>
        <p className="text-muted-foreground mb-4">
          Veja como a aliquota de ICMS do seu estado impacta a transicao para o IBS.
          Cada estado tem uma aliquota diferente (de 17% a 23%), criando impactos distintos.
        </p>
        <Link
          href="/reforma/icms"
          className="inline-flex items-center text-sm font-medium text-primary hover:underline"
        >
          Ver analise ICMS por estado →
        </Link>
      </div>

      <div className="mt-10 text-center">
        <p className="text-muted-foreground mb-4">
          Quer o impacto exato para sua empresa? Use nosso simulador gratuito.
        </p>
        <Link
          href="/simulador"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Simular impacto da reforma
        </Link>
      </div>
    </main>
  )
}
