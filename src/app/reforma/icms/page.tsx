import type { Metadata } from "next"
import Link from "next/link"
import { ALL_UFS, UF_DISPLAY } from "@/lib/seo/slug-maps"
import { ICMS_ALIQUOTA_MODAL, ICMS_REFERENCIA_NACIONAL } from "@/lib/simulator/tax-data"
import { buildBreadcrumbJsonLd } from "@/lib/seo/content-blocks"

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

export const metadata: Metadata = {
  title: "ICMS por Estado e a Reforma Tributaria | ImpostoFacil",
  description: "Aliquotas modais de ICMS dos 27 estados brasileiros e como a extincao do ICMS (2029-2033) impacta cada estado na reforma tributaria.",
  keywords: ["ICMS", "aliquota ICMS", "reforma tributaria", "IBS", "extincao ICMS", "ICMS por estado"],
  alternates: { canonical: `${BASE_URL}/reforma/icms` },
}

export default function IcmsHubPage() {
  const refRate = ICMS_REFERENCIA_NACIONAL.value

  // Sort states by ICMS rate descending
  const states = ALL_UFS
    .map((uf) => ({
      uf,
      nome: UF_DISPLAY[uf].nome,
      rate: ICMS_ALIQUOTA_MODAL[uf]?.value ?? 0,
      source: ICMS_ALIQUOTA_MODAL[uf]?.source ?? "",
    }))
    .sort((a, b) => b.rate - a.rate)

  const jsonLd = buildBreadcrumbJsonLd([
    { name: "Inicio", url: BASE_URL },
    { name: "Reforma Tributaria", url: `${BASE_URL}/reforma` },
    { name: "ICMS por Estado", url: `${BASE_URL}/reforma/icms` },
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
        <span className="text-foreground font-medium">ICMS por Estado</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        ICMS por Estado e a Reforma Tributaria
      </h1>
      <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
        O ICMS sera gradualmente extinto entre 2029 e 2033, substituido pelo IBS.
        Cada estado tem uma aliquota modal diferente, criando impactos distintos na transicao.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        Media nacional ponderada pelo PIB: <strong>{refRate}%</strong> (CONFAZ/IBGE)
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">UF</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">ICMS Modal</th>
              <th className="text-center py-3 px-4 font-medium text-muted-foreground">vs Media</th>
              <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fonte</th>
            </tr>
          </thead>
          <tbody>
            {states.map((s) => {
              const diff = s.rate - refRate
              return (
                <tr key={s.uf} className="border-b border-border/50 hover:bg-muted/30">
                  <td className="py-3 px-4">
                    <Link href={`/reforma/icms/${s.uf.toLowerCase()}`} className="font-bold text-primary hover:underline">
                      {s.uf}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{s.nome}</td>
                  <td className="py-3 px-4 text-center font-medium">{s.rate}%</td>
                  <td className="py-3 px-4 text-center">
                    <span className={diff > 0 ? "text-red-600" : diff < 0 ? "text-green-600" : "text-muted-foreground"}>
                      {diff > 0 ? "+" : ""}{diff.toFixed(1)}pp
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-muted-foreground max-w-xs truncate">{s.source}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="text-xl font-semibold mb-3">Como funciona a extincao do ICMS</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li><strong>2026:</strong> Ano de teste — IBS 0,1% destacado em NF</li>
          <li><strong>2029:</strong> Inicio da reducao do ICMS (IBS 5%)</li>
          <li><strong>2030-2032:</strong> Reducao progressiva do ICMS (25%, 50%, 75%)</li>
          <li><strong>2033:</strong> ICMS totalmente extinto, IBS 17,7% em vigor pleno</li>
        </ul>
      </div>

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
