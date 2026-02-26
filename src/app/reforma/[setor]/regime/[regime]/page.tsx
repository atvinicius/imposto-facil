import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getAllSetorRegimeCombinations,
  computeSetorRegimeData,
  getTimelineHighlights,
} from "@/lib/seo/reforma-data"
import {
  isValidSetor,
  isValidRegimeSlug,
  REGIME_SLUG_TO_KEY,
  SETOR_DISPLAY,
  REGIME_DISPLAY,
  UF_DISPLAY,
  ALL_UFS,
  type SeoSetor,
  type SeoRegime,
} from "@/lib/seo/slug-maps"
import {
  buildSetorRegimeOverview,
  buildSetorRegimeBurden,
  buildSetorRegimeEffectiveness,
  buildTimelineNarrative,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
} from "@/lib/seo/content-blocks"
import { ReformaBreadcrumbs, buildBreadcrumbItems } from "@/components/reforma/reforma-breadcrumbs"
import { ReformaHeader } from "@/components/reforma/reforma-header"
import { EffectivenessCard } from "@/components/reforma/effectiveness-card"
import { TimelineHighlights } from "@/components/reforma/timeline-highlights"
import { ActionList } from "@/components/reforma/action-list"
import { SourcesSection } from "@/components/reforma/sources-section"
import { InternalLinks } from "@/components/reforma/internal-links"
import { ReformaCta } from "@/components/reforma/reforma-cta"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

interface PageProps {
  params: Promise<{ setor: string; regime: string }>
}

export async function generateStaticParams() {
  return getAllSetorRegimeCombinations().map(({ setor, regime }) => ({
    setor,
    regime: REGIME_DISPLAY[regime].slug,
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { setor, regime: regimeSlug } = await params
  if (!isValidSetor(setor) || !isValidRegimeSlug(regimeSlug)) return {}

  const regimeKey = REGIME_SLUG_TO_KEY[regimeSlug]
  const setorInfo = SETOR_DISPLAY[setor as SeoSetor]
  const regimeInfo = REGIME_DISPLAY[regimeKey]
  const title = `${setorInfo.nome} no ${regimeInfo.nome}: Impacto da Reforma Tributaria | ImpostoFacil`
  const description = `Analise do impacto da reforma tributaria para empresas de ${setorInfo.nome.toLowerCase()} no ${regimeInfo.nome}. Carga atual vs nova, formalizacao e acoes.`

  return {
    title,
    description,
    alternates: { canonical: `${BASE_URL}/reforma/${setor}/regime/${regimeSlug}` },
  }
}

export default async function SetorRegimePage({ params }: PageProps) {
  const { setor, regime: regimeSlug } = await params
  if (!isValidSetor(setor) || !isValidRegimeSlug(regimeSlug)) notFound()

  const regimeKey = REGIME_SLUG_TO_KEY[regimeSlug] as SeoRegime
  const data = computeSetorRegimeData(setor as SeoSetor, regimeKey)
  const overview = buildSetorRegimeOverview(data)
  const burdenText = buildSetorRegimeBurden(data)
  const effectivenessText = buildSetorRegimeEffectiveness(data)
  const timelineNarrative = buildTimelineNarrative(setor as SeoSetor)
  const timelineEntries = getTimelineHighlights()

  const ef = data.result.efetividadeTributaria
  const sources = data.result.metodologia.fontes.slice(0, 8)
  const actionItems = data.result.acoesRecomendadas.slice(0, 8)

  // Internal links: all states for this sector
  const stateLinks = ALL_UFS.slice(0, 8).map((uf) => ({
    href: `/reforma/${setor}/${uf.toLowerCase()}`,
    label: `${data.setorDisplay.nome} ${UF_DISPLAY[uf].em}`,
  }))

  // ICMS range for goods sectors
  const icmsInfo = data.stateIcmsRange
    ? `ICMS varia de ${data.stateIcmsRange.min}% (${data.stateIcmsRange.minUf}) a ${data.stateIcmsRange.max}% (${data.stateIcmsRange.maxUf})`
    : null

  const breadcrumbItems = buildBreadcrumbItems(
    [
      { label: "Reforma Tributaria", path: "/reforma" },
      { label: data.setorDisplay.nome, path: `/reforma/${setor}` },
    ],
    data.regimeDisplay.nome
  )

  const pageUrl = `${BASE_URL}/reforma/${setor}/regime/${regimeSlug}`
  const pageTitle = `${data.setorDisplay.nome} no ${data.regimeDisplay.nome}: Impacto da Reforma`

  const jsonLd = [
    buildArticleJsonLd({
      title: pageTitle,
      description: `Impacto da reforma tributaria para ${data.setorDisplay.nome.toLowerCase()} no ${data.regimeDisplay.nome}`,
      url: pageUrl,
    }),
    buildBreadcrumbJsonLd([
      { name: "Inicio", url: BASE_URL },
      { name: "Reforma Tributaria", url: `${BASE_URL}/reforma` },
      { name: data.setorDisplay.nome, url: `${BASE_URL}/reforma/${setor}` },
      { name: data.regimeDisplay.nome, url: pageUrl },
    ]),
  ]

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
        title={pageTitle}
        subtitle={`Analise detalhada para empresas de ${data.setorDisplay.nome.toLowerCase()} no regime de ${data.regimeDisplay.nome}.`}
        riskLevel={data.result.nivelRisco}
      />

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Visao Geral</h2>
        <p className="text-muted-foreground leading-relaxed">{overview}</p>
      </section>

      {/* Burden analysis */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Carga Tributaria: Antes e Depois</h2>
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="rounded-md bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground mb-1">Carga Atual</div>
              <div className="text-2xl font-bold">{data.cargaAtualMin.toFixed(1)}% – {data.cargaAtualMax.toFixed(1)}%</div>
            </div>
            <div className="rounded-md bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground mb-1">Carga Nova (IBS+CBS)</div>
              <div className="text-2xl font-bold">{data.cargaNovaMin}% – {data.cargaNovaMax}%</div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">{burdenText}</p>
          {data.cargaNovaReducao && (
            <p className="mt-3 text-sm text-green-700 bg-green-50 rounded px-3 py-2">
              {data.cargaNovaReducao}
            </p>
          )}
          {icmsInfo && (
            <p className="mt-3 text-xs text-muted-foreground">{icmsInfo}</p>
          )}
        </div>
      </section>

      {/* Effectiveness */}
      <EffectivenessCard
        fatorEfetividade={ef.fatorEfetividade}
        cargaEfetivaPct={ef.cargaEfetivaAtualPct}
        cargaLegalPct={ef.cargaLegalAtualPct}
        impactoAliquota={ef.impactoMudancaAliquota}
        impactoFormalizacao={ef.impactoFormalizacao}
        impactoTotal={ef.impactoTotalEstimado}
        pressao={ef.pressaoFormalizacao}
        narrative={effectivenessText}
      />

      {/* Timeline */}
      <TimelineHighlights
        entries={timelineEntries.map((t) => ({ ano: t.ano, descricao: t.descricao }))}
        narrative={timelineNarrative}
      />

      {/* Actions */}
      <ActionList items={actionItems} />

      {/* Sources */}
      <SourcesSection sources={sources} />

      {/* Internal links */}
      <InternalLinks
        groups={[
          {
            heading: `${data.setorDisplay.nome} por estado`,
            links: stateLinks,
          },
          {
            heading: "Mais sobre o setor",
            links: [
              { href: `/reforma/${setor}`, label: `Hub: ${data.setorDisplay.nome}` },
              { href: "/reforma", label: "Todos os setores" },
            ],
          },
        ]}
      />

      <ReformaCta />
    </main>
  )
}
