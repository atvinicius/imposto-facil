"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calculator, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStoredSimulatorData, clearStoredSimulatorData } from "@/lib/simulator"
import { saveSimulatorDataToProfile } from "./actions"

function hasData() {
  if (typeof window === "undefined") return false
  return getStoredSimulatorData() !== null
}

export function DiagnosticoClient() {
  const router = useRouter()
  const didRun = useRef(false)
  const dataAvailable = hasData()

  useEffect(() => {
    if (didRun.current || !dataAvailable) return
    didRun.current = true

    const data = getStoredSimulatorData()
    if (!data) return

    saveSimulatorDataToProfile({
      input: data.input,
      result: data.result,
      teaser: data.teaser,
    }).then((result) => {
      if (result.success) {
        clearStoredSimulatorData()
        router.refresh()
      }
    })
  }, [router, dataAvailable])

  if (dataAvailable) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Preparando seu diagnóstico...</p>
      </div>
    )
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 rounded-full bg-primary/10 p-4 w-fit">
          <Calculator className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Faça sua simulação primeiro</CardTitle>
        <CardDescription>
          Para gerar seu Diagnóstico Tributário, precisamos dos dados da simulação de impacto.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/simulador">
            Iniciar simulação
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
