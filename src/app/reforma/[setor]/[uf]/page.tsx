import type { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  getAllSetorUfCombinations,
  computeSetorUfData,
  getTimelineHighlights,
} from "@/lib/seo/reforma-data"
import {
  isValidSetor,
  isValidUf,
  SETOR_DISPLAY,
  REGIME_DISPLAY,
  UF_DISPLAY,
  ALL_UFS,
  SEO_SETORES,
  type SeoSetor,
} from "@/lib/seo/slug-maps"
import {
  buildSetorUfOverview,
  buildSetorUfHiddenCost,
  buildSetorUfIcmsImpact,
  buildSetorUfActionItems,
  buildSetorUfFaqEntries,
  buildTimelineNarrative,
  buildArticleJsonLd,
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
} from "@/lib/seo/content-blocks"
import { ReformaBreadcrumbs, buildBreadcrumbItems } from "@/components/reforma/reforma-breadcrumbs"
import { ReformaHeader } from "@/components/reforma/reforma-header"
import { BurdenComparison } from "@/components/reforma/burden-comparison"
import { EffectivenessCard } from "@/components/reforma/effectiveness-card"
import { IcmsCard } from "@/components/reforma/icms-card"
import { TimelineHighlights } from "@/components/reforma/timeline-highlights"
import { ActionList } from "@/components/reforma/action-list"
import { SourcesSection } from "@/components/reforma/sources-section"
import { InternalLinks } from "@/components/reforma/internal-links"
import { ReformaCta } from "@/components/reforma/reforma-cta"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

interface PageProps {
  params: Promise<{ setor: string; uf: string }>
}

export async function generateStaticParams() {
  return getAllSetorUfCombinations().map(({ setor, uf }) => ({
    setor,
    uf: uf.toLowerCase(),
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { setor, uf } = await params
  if (!isValidSetor(setor) || !isValidUf(uf)) return {}

  const ufUpper = uf.toUpperCase()
  const setorInfo = SETOR_DISPLAY[setor as SeoSetor]
  const ufInfo = UF_DISPLAY[ufUpper]
  const title = `Reforma Tributaria ${setorInfo.preposicao} ${setorInfo.nome} ${ufInfo.em} | ImpostoFacil`
  const description = `Impacto da reforma tributaria (EC 132/2023) para empresas de ${setorInfo.nome.toLowerCase()} ${ufInfo.em}. Carga tributaria atual vs nova, ICMS, formalizacao e acoes recomendadas.`

  return {
    title,
    description,
    keywords: [
      "reforma tributaria", setorInfo.nome.toLowerCase(), ufInfo.nome,
      "IBS", "CBS", "impacto tributario", "carga tributaria",
      `${setorInfo.nome.toLowerCase()} ${ufInfo.nome}`,
    ],
    alternates: { canonical: `${BASE_URL}/reforma/${setor}/${uf.toLowerCase()}` },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/reforma/${setor}/${uf.toLowerCase()}`,
      type: "article",
    },
  }
}

export default async function SetorUfPage({ params }: PageProps) {
  const { setor, uf } = await params
  if (!isValidSetor(setor) || !isValidUf(uf)) notFound()

  const data = computeSetorUfData(setor as SeoSetor, uf)
  const overview = buildSetorUfOverview(data)
  const hiddenCost = buildSetorUfHiddenCost(data)
  const icmsNarrative = buildSetorUfIcmsImpact(data)
  const actionItems = buildSetorUfActionItems(data)
  const faqs = buildSetorUfFaqEntries(data)
  const timelineNarrative = buildTimelineNarrative(setor as SeoSetor)
  const timelineEntries = getTimelineHighlights()

  // Use first regime (Simples) risk for header badge; show all in table
  const primaryRisk = data.regimes[0].result.nivelRisco
  // Use LP data for effectiveness card (most representative)
  const lpData = data.regimes.find((r) => r.regime === "lucro_presumido") ?? data.regimes[0]
  const ef = lpData.result.efetividadeTributaria

  // Collect unique sources
  const allSources = new Set<string>()
  for (const r of data.regimes) {
    r.result.metodologia.fontes.forEach((s) => allSources.add(s))
  }
  const sources = Array.from(allSources).slice(0, 10)

  // Internal links
  const sameSetorLinks = ALL_UFS
    .filter((u) => u !== data.uf)
    .slice(0, 5)
    .map((u) => ({
      href: `/reforma/${setor}/${u.toLowerCase()}`,
      label: `${data.setorDisplay.nome} ${UF_DISPLAY[u].em}`,
      detail: undefined as string | undefined,
    }))

  const sameUfLinks = SEO_SETORES
    .filter((s) => s !== setor)
    .slice(0, 4)
    .map((s) => ({
      href: `/reforma/${s}/${uf.toLowerCase()}`,
      label: `${SETOR_DISPLAY[s].nome} ${data.ufDisplay.em}`,
    }))

  const regimeLinks = (["simples", "lucro_presumido", "lucro_real"] as const).map((r) => ({
    href: `/reforma/${setor}/regime/${REGIME_DISPLAY[r].slug}`,
    label: `${data.setorDisplay.nome} no ${REGIME_DISPLAY[r].nome}`,
  }))

  const breadcrumbItems = buildBreadcrumbItems(
    [
      { label: "Reforma Tributaria", path: "/reforma" },
      { label: data.setorDisplay.nome, path: `/reforma/${setor}` },
    ],
    data.ufDisplay.nome
  )

  const pageUrl = `${BASE_URL}/reforma/${setor}/${uf.toLowerCase()}`
  const pageTitle = `Reforma Tributaria ${data.setorDisplay.preposicao} ${data.setorDisplay.nome} ${data.ufDisplay.em}`

  const jsonLd = [
    buildArticleJsonLd({
      title: pageTitle,
      description: `Impacto da reforma tributaria para ${data.setorDisplay.nome.toLowerCase()} ${data.ufDisplay.em}`,
      url: pageUrl,
    }),
    buildBreadcrumbJsonLd([
      { name: "Inicio", url: BASE_URL },
      { name: "Reforma Tributaria", url: `${BASE_URL}/reforma` },
      { name: data.setorDisplay.nome, url: `${BASE_URL}/reforma/${setor}` },
      { name: data.ufDisplay.nome, url: pageUrl },
    ]),
    ...(faqs.length > 0 ? [buildFaqJsonLd(faqs)] : []),
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
        subtitle={`Analise completa do impacto tributario para empresas de ${data.setorDisplay.nome.toLowerCase()} ${data.ufDisplay.em}, com dados por regime tributario.`}
        riskLevel={primaryRisk}
      />

      {/* Overview */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Visao Geral</h2>
        <p className="text-muted-foreground leading-relaxed">{overview}</p>
      </section>

      {/* Burden comparison table */}
      <BurdenComparison
        regimes={data.regimes.map((r) => ({
          regimeNome: r.regimeNome,
          cargaAtualMin: r.cargaAtualMin,
          cargaAtualMax: r.cargaAtualMax,
          cargaNovaMin: r.cargaNovaMin,
          cargaNovaMax: r.cargaNovaMax,
          risco: r.result.nivelRisco,
          percentual: r.result.impactoAnual.percentual,
        }))}
      />

      {/* Hidden cost / formalization */}
      <EffectivenessCard
        fatorEfetividade={ef.fatorEfetividade}
        cargaEfetivaPct={ef.cargaEfetivaAtualPct}
        cargaLegalPct={ef.cargaLegalAtualPct}
        impactoAliquota={ef.impactoMudancaAliquota}
        impactoFormalizacao={ef.impactoFormalizacao}
        impactoTotal={ef.impactoTotalEstimado}
        pressao={ef.pressaoFormalizacao}
        narrative={hiddenCost}
      />

      {/* ICMS card (goods sectors only) */}
      {icmsNarrative && data.icmsRate !== null && data.margemBruta !== null && (
        <IcmsCard
          ufNome={data.ufDisplay.nome}
          icmsRate={data.icmsRate}
          icmsReferencia={data.icmsReferencia}
          margemBruta={data.margemBruta}
          ajustePp={Math.round(((data.icmsRate - data.icmsReferencia) * data.margemBruta) * 100) / 100}
          direcao={
            ((data.icmsRate - data.icmsReferencia) * data.margemBruta) > 0.1 ? "desfavoravel" :
            ((data.icmsRate - data.icmsReferencia) * data.margemBruta) < -0.1 ? "favoravel" : "neutro"
          }
          narrative={icmsNarrative}
          fonte={data.icmsSource ?? ""}
        />
      )}

      {/* Timeline */}
      <TimelineHighlights
        entries={timelineEntries.map((t) => ({ ano: t.ano, descricao: t.descricao }))}
        narrative={timelineNarrative}
      />

      {/* Action items */}
      <ActionList items={actionItems} />

      {/* Sources */}
      <SourcesSection sources={sources} />

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-6">Perguntas Frequentes</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="font-medium mb-2">{faq.pergunta}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.resposta}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Internal links */}
      <InternalLinks
        groups={[
          { heading: `${data.setorDisplay.nome} em outros estados`, links: sameSetorLinks },
          { heading: `Outros setores ${data.ufDisplay.em}`, links: sameUfLinks },
          { heading: `Analise por regime tributario`, links: regimeLinks },
        ]}
      />

      {/* CTA */}
      <ReformaCta />
    </main>
  )
}
