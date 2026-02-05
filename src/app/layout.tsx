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

export const metadata: Metadata = {
  title: "ImpostoFácil - Guia da Reforma Tributária Brasileira",
  description:
    "Plataforma de orientação sobre a reforma tributária brasileira. Tire suas dúvidas sobre IBS, CBS, Imposto Seletivo e mais com nosso assistente de IA.",
  keywords: [
    "reforma tributária",
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
  ],
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
