import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Simulador de Impacto da Reforma Tributária",
  description:
    "Responda algumas perguntas e descubra em 2 minutos quanto a reforma tributária (EC 132/2023) vai custar para sua empresa. Gratuito, sem cadastro.",
  openGraph: {
    title: "Simulador de Impacto — ImpostoFácil",
    description:
      "Simule gratuitamente o impacto da reforma tributária na sua empresa. Resultado instantâneo com nível de risco, alertas e projeção de impacto.",
  },
}

export default function SimuladorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
