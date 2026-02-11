"use client"

import { useState } from "react"
import { Download, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PdfDownloadButtonProps {
  isPaid: boolean
}

export function PdfDownloadButton({ isPaid }: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDownload() {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/diagnostico/pdf")

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Erro ao gerar PDF")
        return
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `diagnostico-tributario-${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
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

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="outline" onClick={handleDownload} disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {loading ? "Gerando PDF..." : "Baixar PDF"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
