"use client"

import { useState } from "react"
import { Download, Loader2, Lock, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PdfDownloadButtonProps {
  isPaid: boolean
}

const PDF_FILENAME = `diagnostico-tributario-${new Date().toISOString().slice(0, 10)}.pdf`

async function fetchPdfBlob(): Promise<Blob> {
  const response = await fetch("/api/diagnostico/pdf")
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || "Erro ao gerar PDF")
  }
  return response.blob()
}

export function PdfDownloadButton({ isPaid }: PdfDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setDownloading(true)
    setError(null)

    try {
      const blob = await fetchPdfBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = PDF_FILENAME
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro de conexão. Tente novamente.")
    } finally {
      setDownloading(false)
    }
  }

  async function handleWhatsAppShare() {
    setSharing(true)
    setError(null)

    try {
      const blob = await fetchPdfBlob()
      const file = new File([blob], PDF_FILENAME, { type: "application/pdf" })

      // Try native share with file (works on mobile — opens WhatsApp directly)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "Diagnóstico Tributário — ImpostoFácil",
          text: "Segue meu diagnóstico tributário com o impacto da reforma na minha empresa.",
          files: [file],
        })
      } else {
        // Fallback: download the file and open WhatsApp with a text prompt
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = PDF_FILENAME
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        const message = encodeURIComponent(
          "Olá! Segue meu diagnóstico tributário gerado pelo ImpostoFácil. Acabei de baixar o PDF para enviar."
        )
        window.open(`https://wa.me/?text=${message}`, "_blank")
      }
    } catch (err) {
      // User cancelled the share dialog — not an error
      if (err instanceof Error && err.name === "AbortError") return
      setError(err instanceof Error ? err.message : "Erro ao compartilhar. Tente novamente.")
    } finally {
      setSharing(false)
    }
  }

  if (!isPaid) {
    return (
      <Button variant="outline" disabled>
        <Lock className="h-4 w-4 mr-2" />
        Exclusivo do plano completo
      </Button>
    )
  }

  const isLoading = downloading || sharing

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={handleDownload} disabled={isLoading}>
          {downloading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {downloading ? "Gerando..." : "Baixar PDF"}
        </Button>
        <Button variant="outline" onClick={handleWhatsAppShare} disabled={isLoading} className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20">
          {sharing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Share2 className="h-4 w-4 mr-2" />
          )}
          {sharing ? "Enviando..." : "WhatsApp"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
