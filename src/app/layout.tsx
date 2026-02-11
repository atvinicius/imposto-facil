import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://impostofacil.com.br"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ImpostoFácil - Guia da Reforma Tributária Brasileira",
    template: "%s | ImpostoFácil",
  },
  description:
    "Descubra em 2 minutos quanto a reforma tributária vai custar para sua empresa. Simulador gratuito + diagnóstico tributário personalizado com alertas, checklist e projeção até 2033.",
  keywords: [
    "reforma tributária",
    "reforma tributária 2026",
    "IBS",
    "CBS",
    "imposto seletivo",
    "ICMS",
    "ISS",
    "PIS",
    "Cofins",
    "IVA",
    "tributos",
    "Brasil",
    "simulador reforma tributária",
    "diagnóstico tributário",
    "EC 132/2023",
    "LC 214/2025",
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "ImpostoFácil",
    title: "ImpostoFácil - Descubra o impacto da reforma tributária na sua empresa",
    description:
      "Simulador gratuito + diagnóstico tributário personalizado. Alertas, checklist de adequação e projeção de impacto até 2033.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImpostoFácil - Reforma Tributária Brasileira",
    description:
      "Descubra em 2 minutos quanto a reforma tributária vai custar para sua empresa.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
