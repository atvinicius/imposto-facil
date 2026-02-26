import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import {
  isValidSetor,
  SETOR_DISPLAY,
  REGIME_DISPLAY,
  UF_DISPLAY,
  ALL_UFS,
  SEO_SETORES,
  SEO_REGIMES,
  type SeoSetor,
} from "@/lib/seo/slug-maps"
import { ICMS_ALIQUOTA_MODAL, SETORES_ICMS } from "@/lib/simulator/tax-data"
import type { Setor } from "@/lib/simulator/types"
import { buildBreadcrumbJsonLd } from "@/lib/seo/content-blocks"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

interface PageProps {
  params: Promise<{ setor: string }>
}

export async function generateStaticParams() {
  return SEO_SETORES.map((setor) => ({ setor }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { setor } = await params
  if (!isValidSetor(setor)) return {}
  const info = SETOR_DISPLAY[setor as SeoSetor]

  return {
    title: `Reforma Tributaria ${info.preposicao} ${info.nome} | ImpostoFacil`,
    description: `Impacto da reforma tributaria para o setor de ${info.nome.toLowerCase()} em todos os 27 estados brasileiros. Analise por regime tributario e ICMS estadual.`,
    alternates: { canonical: `${BASE_URL}/reforma/${setor}` },
  }
}

export default async function SetorHubPage({ params }: PageProps) {
  const { setor } = await params
  if (!isValidSetor(setor)) notFound()

  const info = SETOR_DISPLAY[setor as SeoSetor]
  const isGoods = SETORES_ICMS.has(setor as Setor)

  const jsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: BASE_URL },
    { name: "Reforma Tributaria", url: `${BASE_URL}/reforma` },
    { name: info.nome, url: `${BASE_URL}/reforma/${setor}` },
  ])

  return (
    <main className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/reforma" className="hover:text-foreground">Reforma Tributaria</Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground font-medium">{info.nome}</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        Reforma Tributaria {info.preposicao} {info.nome}
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        Veja o impacto da reforma tributaria (EC 132/2023) para empresas de {info.nome.toLowerCase()} em cada estado e regime tributario.
      </p>

      {/* State grid */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Por Estado</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {ALL_UFS.map((uf) => {
            const ufInfo = UF_DISPLAY[uf]
            const icmsRate = isGoods ? ICMS_ALIQUOTA_MODAL[uf]?.value : null
            return (
              <Link
                key={uf}
                href={`/reforma/${setor}/${uf.toLowerCase()}`}
                className="group rounded-md border border-border bg-card p-3 hover:border-primary/50 transition-all text-center"
              >
                <div className="text-lg font-bold group-hover:text-primary transition-colors">{uf}</div>
                <div className="text-xs text-muted-foreground truncate">{ufInfo.nome}</div>
                {icmsRate !== null && (
                  <div className="mt-1 text-xs text-muted-foreground">ICMS {icmsRate}%</div>
                )}
              </Link>
            )
          })}
        </div>
      </section>

      {/* Regime grid */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Por Regime Tributario</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SEO_REGIMES.map((regime) => {
            const regimeInfo = REGIME_DISPLAY[regime]
            return (
              <Link
                key={regime}
                href={`/reforma/${setor}/regime/${regimeInfo.slug}`}
                className="group rounded-lg border border-border bg-card p-5 hover:border-primary/50 transition-all"
              >
                <h3 className="font-semibold group-hover:text-primary transition-colors mb-1">
                  {regimeInfo.nome}
                </h3>
                <p className="text-sm text-muted-foreground">{regimeInfo.descricao}</p>
              </Link>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <div className="text-center mt-10">
        <Link
          href="/simulador"
          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Simular impacto para minha empresa
        </Link>
      </div>
    </main>
  )
}
