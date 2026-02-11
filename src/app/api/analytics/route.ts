import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { event_name, session_id, properties } = body

    if (!event_name || typeof event_name !== "string") {
      return NextResponse.json({ error: "event_name is required" }, { status: 400 })
    }

    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json({ error: "session_id is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user if authenticated (optional)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("analytics_events").insert({
      user_id: user?.id ?? null,
      session_id,
      event_name,
      properties: properties ?? {},
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 })
  }
}
