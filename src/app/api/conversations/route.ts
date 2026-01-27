import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversations, error } = await (supabase as any)
      .from("conversations")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      return NextResponse.json({ error: "Erro ao buscar conversas" }, { status: 500 })
    }

    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Conversations GET error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const title = body.title || "Nova conversa"

    // Get user profile for context snapshot
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("user_profiles")
      .select("uf, setor, porte_empresa")
      .eq("id", user.id)
      .single()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conversation, error } = await (supabase as any)
      .from("conversations")
      .insert({
        user_id: user.id,
        title,
        context_snapshot: profile || {},
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating conversation:", error)
      return NextResponse.json({ error: "Erro ao criar conversa" }, { status: 500 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Conversations POST error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
