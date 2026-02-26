import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { computeIcmsUfData } from "@/lib/seo/reforma-data"
import {
  isValidUf,
  UF_DISPLAY,
  ALL_UFS,
  SETOR_DISPLAY,
} from "@/lib/seo/slug-maps"
import {
  buildIcmsUfOverview,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/content-blocks"
import { ReformaBreadcrumbs, buildBreadcrumbItems } from "@/components/reforma/reforma-breadcrumbs"
import { ReformaHeader } from "@/components/reforma/reforma-header"
import { InternalLinks } from "@/components/reforma/internal-links"
import { ReformaCta } from "@/components/reforma/reforma-cta"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

interface PageProps {
  params: Promise<{ uf: string }>
}

export async function generateStaticParams() {
  return ALL_UFS.map((uf) => ({ uf: uf.toLowerCase() }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { uf } = await params
  if (!isValidUf(uf)) return {}

  const ufUpper = uf.toUpperCase()
  const ufInfo = UF_DISPLAY[ufUpper]
  const title = `ICMS ${ufInfo.em} e a Reforma Tributaria | ImpostoFacil`
  const description = `Aliquota de ICMS ${ufInfo.em} e como a extincao do ICMS ate 2033 impacta empresas locais. Analise por setor com dados legislativos.`

  return {
    title,
    description,
    keywords: ["ICMS", ufInfo.nome, "reforma tributaria", "IBS", "aliquota ICMS", uf.toUpperCase()],
    alternates: { canonical: `${BASE_URL}/reforma/icms/${uf.toLowerCase()}` },
  }
}

export default async function IcmsUfPage({ params }: PageProps) {
  const { uf } = await params
  if (!isValidUf(uf)) notFound()

  const data = computeIcmsUfData(uf)
  if (!data) notFound()

  const overview = buildIcmsUfOverview(data)

  const breadcrumbItems = buildBreadcrumbItems(
    [
      { label: "Reforma Tributaria", path: "/reforma" },
      { label: "ICMS por Estado", path: "/reforma/icms" },
    ],
    data.ufDisplay.nome
  )

  const pageUrl = `${BASE_URL}/reforma/icms/${uf.toLowerCase()}`

  const jsonLd = [
    buildArticleJsonLd({
      title: `ICMS ${data.ufDisplay.em} e a Reforma Tributaria`,
      description: `Aliquota de ICMS e impacto da reforma ${data.ufDisplay.em}`,
      url: pageUrl,
    }),
    buildBreadcrumbJsonLd([
      { name: "Inicio", url: BASE_URL },
      { name: "Reforma Tributaria", url: `${BASE_URL}/reforma` },
      { name: "ICMS por Estado", url: `${BASE_URL}/reforma/icms` },
      { name: data.ufDisplay.nome, url: pageUrl },
    ]),
  ]

  // Sector x state links for this UF (goods sectors)
  const goodsSectorLinks = (["comercio", "industria", "construcao", "agronegocio"] as const).map((s) => ({
    href: `/reforma/${s}/${uf.toLowerCase()}`,
    label: `${SETOR_DISPLAY[s].nome} ${data.ufDisplay.em}`,
  }))

  // Other state links
  const otherStateLinks = ALL_UFS
    .filter((u) => u !== data.uf)
    .slice(0, 6)
    .map((u) => ({
      href: `/reforma/icms/${u.toLowerCase()}`,
      label: `ICMS ${UF_DISPLAY[u].em}`,
    }))

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {jsonLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}

      <ReformaBreadcrumbs items={breadcrumbItems} />

      <ReformaHeader
        title={`ICMS ${data.ufDisplay.em} e a Reforma Tributaria`}
        subtitle={`Aliquota modal de ${data.icmsRate}% — como a extincao do ICMS impacta empresas ${data.ufDisplay.em}.`}
      />

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Visao Geral</h2>
        <p className="text-muted-foreground leading-relaxed">{overview}</p>
      </section>

      {/* Rate card */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Aliquota de ICMS</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-md bg-muted/50 p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">ICMS {data.uf}</div>
              <div className="text-3xl font-bold">{data.icmsRate}%</div>
            </div>
            <div className="rounded-md bg-muted/50 p-4 text-center">
              <div className="text-sm text-muted-foreground mb-1">Media Nacional</div>
              <div className="text-3xl font-bold">{data.icmsReferencia}%</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Fonte: {data.icmsSource}</p>
        </div>
      </section>

      {/* Incentive */}
      {data.hasIncentivo && data.incentivoText && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Incentivos Fiscais</h2>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-5">
            <p className="text-sm text-yellow-900 mb-2">{data.incentivoText}</p>
            {data.incentivoSource && (
              <p className="text-xs text-yellow-700">Fonte: {data.incentivoSource}</p>
            )}
          </div>
        </section>
      )}

      {/* Sector breakdown */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Impacto por Setor</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Comparacao do ajuste de ICMS para setores que pagam ICMS (comercio, industria, construcao civil, agronegocio),
          usando a margem bruta media de cada setor (IBGE).
        </p>
        <div className="space-y-3">
          {data.goodsSectors.map((s) => {
            const badgeBg =
              s.direcao === "desfavoravel" ? "bg-red-100 text-red-800" :
              s.direcao === "favoravel" ? "bg-green-100 text-green-800" :
              "bg-gray-100 text-gray-800"
            const dirLabel =
              s.direcao === "desfavoravel" ? "Desfavoravel" :
              s.direcao === "favoravel" ? "Favoravel" : "Neutro"

            return (
              <div key={s.setor} className="rounded-md border border-border p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.setorNome}</div>
                  <div className="text-sm text-muted-foreground">
                    Margem bruta: {(s.margemBruta * 100).toFixed(0)}% | Ajuste: {s.ajustePp > 0 ? "+" : ""}{s.ajustePp.toFixed(1)}pp
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeBg}`}>
                  {dirLabel}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Cronograma de Extincao do ICMS</h2>
        <div className="relative pl-6 border-l-2 border-border space-y-6">
          <div className="relative">
            <div className="absolute -left-[calc(0.75rem+1px)] top-0.5 w-3 h-3 rounded-full bg-yellow-500 border-2 border-background" />
            <div className="text-sm font-semibold text-yellow-700 mb-1">2029</div>
            <p className="text-sm text-muted-foreground">Inicio da reducao do ICMS — IBS assume 5%</p>
          </div>
          <div className="relative">
            <div className="absolute -left-[calc(0.75rem+1px)] top-0.5 w-3 h-3 rounded-full bg-orange-500 border-2 border-background" />
            <div className="text-sm font-semibold text-orange-700 mb-1">2030-2032</div>
            <p className="text-sm text-muted-foreground">Reducao progressiva: 25%, 50%, 75%</p>
          </div>
          <div className="relative">
            <div className="absolute -left-[calc(0.75rem+1px)] top-0.5 w-3 h-3 rounded-full bg-red-500 border-2 border-background" />
            <div className="text-sm font-semibold text-red-700 mb-1">2033</div>
            <p className="text-sm text-muted-foreground">ICMS totalmente extinto — IBS 17,7% em vigor</p>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Fontes</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>{data.icmsSource}</li>
          <li>EC 132/2023 — Emenda Constitucional da Reforma Tributaria</li>
          <li>CONFAZ/IBGE — Media ponderada nacional de ICMS</li>
          {data.incentivoSource && <li>{data.incentivoSource}</li>}
        </ul>
      </section>

      {/* Internal links */}
      <InternalLinks
        groups={[
          { heading: `Setores ${data.ufDisplay.em}`, links: goodsSectorLinks },
          { heading: "Outros estados", links: otherStateLinks },
        ]}
      />

      <ReformaCta />
    </main>
  )
}
