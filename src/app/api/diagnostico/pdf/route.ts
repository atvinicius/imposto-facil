import { NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { createClient, getUserProfile } from "@/lib/supabase/server"
import { calcularSimulacao } from "@/lib/simulator"
import type { SimuladorInput, SimuladorResult, FaixaFaturamento, RegimeTributario, Setor } from "@/lib/simulator"
import { DiagnosticoPDF } from "@/lib/pdf/diagnostico-pdf"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const profile = await getUserProfile()
    if (!profile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 })
    }

    // Check paid status
    const isPaid = !!(
      profile.diagnostico_purchased_at ||
      profile.subscription_tier === "diagnostico" ||
      profile.subscription_tier === "pro"
    )

    if (!isPaid) {
      return NextResponse.json(
        { error: "Diagnóstico completo não adquirido" },
        { status: 403 }
      )
    }

    // Check if profile has enough data
    if (!profile.setor || !profile.faturamento || !profile.uf) {
      return NextResponse.json(
        { error: "Dados insuficientes para gerar o diagnóstico" },
        { status: 400 }
      )
    }

    // Build input from profile (same logic as diagnostico page)
    const regimeMap: Record<string, RegimeTributario> = {
      "Simples Nacional": "simples",
      "Lucro Presumido": "lucro_presumido",
      "Lucro Real": "lucro_real",
    }

    const input: SimuladorInput = {
      regime: regimeMap[profile.regime_tributario || ""] || "nao_sei",
      setor: profile.setor as Setor,
      faturamento: profile.faturamento as FaixaFaturamento,
      uf: profile.uf,
    }

    // Use cached result if available, otherwise calculate fresh
    let result: SimuladorResult
    if (profile.simulator_result) {
      result = profile.simulator_result as unknown as SimuladorResult
    } else {
      result = calcularSimulacao(input)
    }

    const generatedAt = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const pdfElement = React.createElement(DiagnosticoPDF, {
      result,
      input,
      userName: profile.nome || user.email || "Usuário",
      generatedAt,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(pdfElement as any)

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="diagnostico-tributario-${new Date().toISOString().slice(0, 10)}.pdf"`,
      },
    })
  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Erro ao gerar PDF" },
      { status: 500 }
    )
  }
}
