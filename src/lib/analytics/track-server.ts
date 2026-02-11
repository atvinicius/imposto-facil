import { createClient } from "@/lib/supabase/server"

export async function trackServerEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  sessionId = "server"
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("analytics_events").insert({
      user_id: user?.id ?? null,
      session_id: sessionId,
      event_name: eventName,
      properties,
    })
  } catch {
    // Silent failure — analytics should never break the app
  }
}
