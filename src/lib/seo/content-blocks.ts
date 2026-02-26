/**
 * Portuguese narrative generators for programmatic SEO pages.
 * All text is template-driven from calculator outputs + conditional logic.
 * No AI-generated content.
 */

import type { SetorUfPageData, SetorRegimePageData, IcmsUfPageData } from "./reforma-data"
import type { SeoSetor } from "./slug-maps"
import { TRANSICAO_TIMELINE } from "@/lib/simulator/tax-data"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 0 })
}

function riskLabel(nivel: string): string {
  const map: Record<string, string> = {
    baixo: "baixo",
    medio: "moderado",
    alto: "alto",
    critico: "critico",
  }
  return map[nivel] ?? nivel
}

function pressaoLabel(p: string): string {
  const map: Record<string, string> = {
    baixa: "baixa",
    moderada: "moderada",
    alta: "alta",
    muito_alta: "muito alta",
  }
  return map[p] ?? p
}

// ---------------------------------------------------------------------------
// Sector x State page content
// ---------------------------------------------------------------------------

export function buildSetorUfOverview(data: SetorUfPageData): string {
  const { setorDisplay, ufDisplay, isGoodsSector, icmsRate, icmsReferencia, hasIncentivo, cargaNovaReducao } = data
  const setorName = setorDisplay.nome.toLowerCase()
  const ufName = ufDisplay.nome

  const parts: string[] = []

  parts.push(
    `A reforma tributaria (EC 132/2023) vai impactar diretamente as empresas de ${setorName} ${ufDisplay.em}. ` +
    `Com a substituicao de cinco tributos (PIS, Cofins, IPI, ICMS e ISS) por tres novos (IBS, CBS e IS), ` +
    `a forma de calcular e pagar impostos muda completamente ate 2033.`
  )

  if (cargaNovaReducao) {
    parts.push(
      `O setor de ${setorName} tem aliquota reduzida na reforma: ${cargaNovaReducao.toLowerCase()}.`
    )
  }

  if (isGoodsSector && icmsRate !== null) {
    const dir = icmsRate > icmsReferencia ? "acima" : icmsRate < icmsReferencia ? "abaixo" : "na media"
    parts.push(
      `${ufName} tem aliquota modal de ICMS de ${icmsRate}%, ${dir} da media nacional de ${icmsReferencia}%. ` +
      `Isso influencia o impacto real da reforma para empresas de ${setorName} no estado.`
    )
  }

  if (hasIncentivo) {
    parts.push(
      `${ufName} possui programas de incentivo fiscal de ICMS que serao extintos gradualmente durante a transicao. ` +
      `Empresas que dependem desses beneficios precisam planejar a transicao com antecedencia.`
    )
  }

  return parts.join(" ")
}

export function buildSetorUfBurdenAnalysis(data: SetorUfPageData): string {
  const { setorDisplay, regimes } = data
  const setorName = setorDisplay.nome.toLowerCase()

  const parts: string[] = [
    `Veja como a carga tributaria muda para empresas de ${setorName} em cada regime tributario:`
  ]

  for (const r of regimes) {
    const mediaAtual = ((r.cargaAtualMin + r.cargaAtualMax) / 2).toFixed(1)
    const mediaNova = ((r.cargaNovaMin + r.cargaNovaMax) / 2).toFixed(1)
    const risco = riskLabel(r.result.nivelRisco)

    parts.push(
      `No ${r.regimeNome}, a carga atual varia de ${r.cargaAtualMin.toFixed(1)}% a ${r.cargaAtualMax.toFixed(1)}% ` +
      `(media ${mediaAtual}%), passando para ${r.cargaNovaMin}% a ${r.cargaNovaMax}% ` +
      `(media ${mediaNova}%) apos a reforma. Nivel de risco: ${risco}.`
    )
  }

  return parts.join(" ")
}

export function buildSetorUfHiddenCost(data: SetorUfPageData): string {
  const { setorDisplay, ufDisplay, regimes } = data
  const setorName = setorDisplay.nome.toLowerCase()

  // Use lucro_presumido data as the most representative for hidden cost narrative
  const lpData = regimes.find((r) => r.regime === "lucro_presumido") ?? regimes[0]
  const ef = lpData.result.efetividadeTributaria
  const pressao = pressaoLabel(ef.pressaoFormalizacao)

  const parts: string[] = []

  parts.push(
    `Alem da mudanca de aliquotas, existe um custo oculto da reforma que afeta especialmente o setor de ${setorName}. ` +
    `Dados publicos da Receita Federal indicam que o setor paga, em media, ${(ef.fatorEfetividade * 100).toFixed(0)}% ` +
    `da carga tributaria legal. Ou seja, a carga efetiva e de aproximadamente ${ef.cargaEfetivaAtualPct.toFixed(1)}%, ` +
    `enquanto a carga legal e de ${ef.cargaLegalAtualPct.toFixed(1)}%.`
  )

  parts.push(
    `Com a reforma, o sistema de retencao automatica (cobranca na transacao eletronica) ` +
    `passara a cobrar 100% da aliquota legal. Para empresas de ${setorName} ${ufDisplay.em}, ` +
    `a pressao de formalizacao e classificada como ${pressao}.`
  )

  if (ef.impactoFormalizacao > 0) {
    parts.push(
      `Para uma empresa com faturamento de R$ 1,5 milhao/ano (referencia EPP), ` +
      `o impacto estimado da mudanca de aliquota e de R$ ${formatBRL(Math.abs(ef.impactoMudancaAliquota))}/ano, ` +
      `enquanto o impacto da formalizacao mais rigorosa e de R$ ${formatBRL(ef.impactoFormalizacao)}/ano — ` +
      `totalizando R$ ${formatBRL(Math.abs(ef.impactoTotalEstimado))}/ano.`
    )
  }

  return parts.join(" ")
}

export function buildSetorUfIcmsImpact(data: SetorUfPageData): string | null {
  if (!data.isGoodsSector || data.icmsRate === null || data.margemBruta === null) return null

  const { setorDisplay, ufDisplay, icmsRate, icmsReferencia, margemBruta } = data
  const ajustePp = Math.round(((icmsRate - icmsReferencia) * margemBruta) * 100) / 100
  const dir = ajustePp > 0 ? "encarece" : ajustePp < 0 ? "reduz" : "nao altera"

  return (
    `${ufDisplay.nome} pratica uma aliquota modal de ICMS de ${icmsRate}%, ` +
    `enquanto a media nacional ponderada pelo PIB e de ${icmsReferencia}%. ` +
    `Considerando a margem bruta media do setor de ${setorDisplay.nome.toLowerCase()} ` +
    `(${(margemBruta * 100).toFixed(0)}%, segundo o IBGE), essa diferenca ${dir} ` +
    `a carga tributaria atual em ${Math.abs(ajustePp).toFixed(1)} ponto(s) percentual(is) sobre o faturamento. ` +
    `Com a extincao do ICMS ate 2033, essa diferenca regional deixara de existir — ` +
    `o IBS tera aliquota uniforme definida pelo Comite Gestor.`
  )
}

export function buildSetorUfActionItems(data: SetorUfPageData): string[] {
  const { setor, isGoodsSector, hasIncentivo, cargaNovaReducao } = data
  const lpData = data.regimes.find((r) => r.regime === "lucro_presumido") ?? data.regimes[0]
  const pressao = lpData.result.efetividadeTributaria.pressaoFormalizacao

  const items: string[] = [
    "Atualizar sistema de emissao de notas fiscais para incluir campos IBS e CBS (obrigatorio em 2026)",
    "Simular fluxo de caixa com retencao automatica de impostos a partir de 2027",
    "Revisar contratos de longo prazo para incluir clausula de reajuste tributario",
  ]

  if (pressao === "alta" || pressao === "muito_alta") {
    items.push("Verificar situacao fiscal no e-CAC e regularizar pendencias antes da reforma")
    items.push("Avaliar impacto da formalizacao completa no capital de giro")
  }

  if (isGoodsSector && hasIncentivo) {
    items.push("Planejar transicao dos incentivos fiscais de ICMS que serao extintos ate 2032")
  }

  if (setor === "servicos" || setor === "tecnologia") {
    items.push("Analisar impacto da nao-cumulatividade limitada (folha de pagamento nao gera credito)")
  }

  if (setor === "construcao") {
    items.push("Mapear cadeia de subcontratados e formalizar contratos de prestacao de servico")
  }

  if (setor === "agronegocio") {
    items.push("Verificar enquadramento no regime diferenciado do agronegocio (aliquota reduzida em 60%)")
  }

  if (cargaNovaReducao) {
    items.push(`Confirmar elegibilidade para ${cargaNovaReducao.toLowerCase()}`)
  }

  items.push("Consultar um contador sobre o regime tributario ideal no novo sistema")

  return items
}

export function buildSetorUfFaqEntries(data: SetorUfPageData): { pergunta: string; resposta: string }[] {
  const { setorDisplay, ufDisplay, regimes, isGoodsSector, icmsRate } = data
  const setorName = setorDisplay.nome.toLowerCase()
  const ufName = ufDisplay.nome

  const faqs: { pergunta: string; resposta: string }[] = []

  faqs.push({
    pergunta: `Qual o impacto da reforma tributaria ${setorDisplay.preposicao} ${setorName} ${ufDisplay.em}?`,
    resposta: `O impacto varia conforme o regime tributario. ${regimes.map((r) => {
      const risco = riskLabel(r.result.nivelRisco)
      return `No ${r.regimeNome}, o risco e ${risco} (variacao de ${r.result.impactoAnual.percentual}%)`
    }).join(". ")}. Use nosso simulador para calcular o impacto exato para sua empresa.`,
  })

  faqs.push({
    pergunta: `Quando a reforma tributaria comeca a valer ${ufDisplay.em}?`,
    resposta: `A reforma vale para todo o Brasil. Em 2026, ha um periodo de teste (CBS 0,9% + IBS 0,1% destacados em NF). ` +
      `Em 2027, a CBS entra em vigor e o PIS/Cofins e extinto. A extincao do ICMS e ISS ocorre gradualmente de 2029 a 2033.`,
  })

  if (isGoodsSector && icmsRate !== null) {
    faqs.push({
      pergunta: `Como a extincao do ICMS afeta ${setorName} ${ufDisplay.em}?`,
      resposta: `${ufName} tem ICMS de ${icmsRate}% (media nacional: 19%). Com a extincao gradual ate 2033, ` +
        `o ICMS sera substituido pelo IBS (aliquota uniforme). ` +
        `${icmsRate > 19
          ? `Como ${ufName} tem aliquota acima da media, a transicao pode reduzir a carga relativa para empresas locais.`
          : icmsRate < 19
          ? `Como ${ufName} tem aliquota abaixo da media, empresas que tinham vantagem competitiva podem perder essa diferenca.`
          : `Como ${ufName} esta na media, o impacto da transicao ICMS→IBS e neutro.`
        }`,
    })
  }

  return faqs
}

// ---------------------------------------------------------------------------
// Sector x Regime page content
// ---------------------------------------------------------------------------

export function buildSetorRegimeOverview(data: SetorRegimePageData): string {
  const { setorDisplay, regimeDisplay, efetividadeFator, cargaNovaReducao } = data
  const setorName = setorDisplay.nome.toLowerCase()

  const parts: string[] = [
    `Empresas de ${setorName} no ${regimeDisplay.nome} serao diretamente afetadas pela reforma tributaria. ` +
    `A transicao de PIS/Cofins, ICMS e ISS para IBS e CBS muda a forma de calcular, pagar e creditar impostos.`
  ]

  if (cargaNovaReducao) {
    parts.push(`Este setor conta com aliquota reduzida: ${cargaNovaReducao.toLowerCase()}.`)
  }

  parts.push(
    `Dados publicos indicam que o setor paga, em media, ${(efetividadeFator * 100).toFixed(0)}% da carga legal no ${regimeDisplay.nome}. ` +
    `Com a retencao automatica da reforma, essa taxa tendera a 100%.`
  )

  return parts.join(" ")
}

export function buildSetorRegimeBurden(data: SetorRegimePageData): string {
  const { regimeDisplay, cargaAtualMin, cargaAtualMax, cargaNovaMin, cargaNovaMax, result } = data
  const risco = riskLabel(result.nivelRisco)

  return (
    `No ${regimeDisplay.nome}, a carga tributaria atual varia de ${cargaAtualMin.toFixed(1)}% a ${cargaAtualMax.toFixed(1)}% ` +
    `sobre o faturamento. Com a reforma, a nova aliquota (IBS + CBS) sera de ${cargaNovaMin}% a ${cargaNovaMax}%. ` +
    `O impacto estimado e de ${result.impactoAnual.percentual}% na carga total. Nivel de risco: ${risco}.`
  )
}

export function buildSetorRegimeEffectiveness(data: SetorRegimePageData): string {
  const { setorDisplay, regimeDisplay, efetividadeFator, efetividadeMin, efetividadeMax, result } = data
  const ef = result.efetividadeTributaria
  const pressao = pressaoLabel(ef.pressaoFormalizacao)

  return (
    `No ${regimeDisplay.nome}, empresas de ${setorDisplay.nome.toLowerCase()} pagam entre ` +
    `${(efetividadeMin * 100).toFixed(0)}% e ${(efetividadeMax * 100).toFixed(0)}% da carga legal ` +
    `(media: ${(efetividadeFator * 100).toFixed(0)}%). A carga efetiva e de ${ef.cargaEfetivaAtualPct.toFixed(1)}%, ` +
    `contra ${ef.cargaLegalAtualPct.toFixed(1)}% da carga legal. ` +
    `A pressao de formalizacao com a reforma e classificada como ${pressao}. ` +
    `O impacto da formalizacao mais rigorosa e estimado em R$ ${formatBRL(ef.impactoFormalizacao)}/ano ` +
    `(para faturamento de referencia de R$ 1,5 milhao/ano).`
  )
}

// ---------------------------------------------------------------------------
// State ICMS page content
// ---------------------------------------------------------------------------

export function buildIcmsUfOverview(data: IcmsUfPageData): string {
  const { ufDisplay, icmsRate, icmsReferencia, hasIncentivo } = data
  const ufName = ufDisplay.nome
  const dir = icmsRate > icmsReferencia ? "acima" : icmsRate < icmsReferencia ? "abaixo" : "na media"

  const parts: string[] = [
    `${ufName} pratica uma aliquota modal de ICMS de ${icmsRate}%, ` +
    `${dir} da media nacional ponderada de ${icmsReferencia}%. ` +
    `Com a reforma tributaria, o ICMS sera gradualmente substituido pelo IBS ate 2033.`
  ]

  if (hasIncentivo) {
    parts.push(
      `O estado possui programas de incentivo fiscal que serao extintos durante a transicao, ` +
      `impactando empresas que dependem desses beneficios.`
    )
  }

  return parts.join(" ")
}

export function buildIcmsUfSectorBreakdown(data: IcmsUfPageData): string {
  const { ufDisplay, goodsSectors } = data

  const lines = goodsSectors.map((s) => {
    const dirLabel = s.direcao === "desfavoravel" ? "encarece" :
      s.direcao === "favoravel" ? "reduz" : "nao altera significativamente"
    return `${s.setorNome}: margem bruta media de ${(s.margemBruta * 100).toFixed(0)}%, ` +
      `ajuste de ${s.ajustePp > 0 ? "+" : ""}${s.ajustePp.toFixed(1)}pp — ${dirLabel} a carga atual`
  })

  return (
    `Impacto da aliquota de ICMS de ${ufDisplay.nome} por setor (comparado a media nacional):\n` +
    lines.join(".\n") + "."
  )
}

// ---------------------------------------------------------------------------
// Shared: timeline highlights
// ---------------------------------------------------------------------------

export function buildTimelineNarrative(setor?: SeoSetor): string {
  const entries = TRANSICAO_TIMELINE.filter((t) => [2026, 2027, 2029, 2033].includes(t.ano))

  const lines = entries.map((t) => `${t.ano}: ${t.descricao}`)

  let extra = ""
  if (setor === "agronegocio") {
    extra = " Produtores rurais devem ficar atentos a recuperacao de creditos de ICMS acumulados antes da extincao."
  } else if (setor === "construcao") {
    extra = " O setor de construcao civil deve planejar a formalizacao de subcontratados antes de 2027."
  } else if (setor === "servicos" || setor === "tecnologia") {
    extra = " Empresas de servicos devem revisar contratos e precificacao antes de 2027."
  }

  return `Datas-chave da transicao: ${lines.join(". ")}.${extra}`
}

// ---------------------------------------------------------------------------
// JSON-LD structured data builders
// ---------------------------------------------------------------------------

export function buildArticleJsonLd(params: {
  title: string
  description: string
  url: string
  datePublished?: string
  dateModified?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: params.title,
    description: params.description,
    url: params.url,
    datePublished: params.datePublished ?? "2025-01-20",
    dateModified: params.dateModified ?? new Date().toISOString().split("T")[0],
    author: {
      "@type": "Organization",
      name: "ImpostoFacil",
      url: "https://impostofacil.com.br",
    },
    publisher: {
      "@type": "Organization",
      name: "ImpostoFacil",
      url: "https://impostofacil.com.br",
    },
  }
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function buildFaqJsonLd(faqs: { pergunta: string; resposta: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.pergunta,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.resposta,
      },
    })),
  }
}
