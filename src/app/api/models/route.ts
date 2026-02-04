import { getCuratedModels } from "@/lib/openrouter/models"

export const runtime = "edge"

export async function GET() {
  try {
    const models = await getCuratedModels()

    return new Response(JSON.stringify({ models }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    })
  } catch (error) {
    console.error("Models API error:", error)
    return new Response(
      JSON.stringify({ error: "Erro ao buscar modelos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
