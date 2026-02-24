"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Json } from "@/types/database"

interface SubmitFeedbackInput {
  promptId: string
  feedbackType: "pre_purchase" | "post_purchase"
  rating?: number
  selectedOptions?: string[]
  comment?: string
  pageUrl: string
  sessionId: string
  metadata?: Record<string, unknown>
}

export async function submitFeedback(
  input: SubmitFeedbackInput
): Promise<{ success?: boolean; error?: string }> {
  if (!input.promptId || !input.feedbackType || !input.sessionId) {
    return { error: "Dados incompletos." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const admin = createAdminClient()
  const { error } = await admin.from("feedback").insert({
    user_id: user?.id ?? null,
    session_id: input.sessionId,
    prompt_id: input.promptId,
    feedback_type: input.feedbackType,
    rating: input.rating ?? null,
    selected_options: input.selectedOptions ?? null,
    comment: input.comment?.trim().substring(0, 500) ?? null,
    page_url: input.pageUrl,
    metadata: (input.metadata ?? {}) as Json,
  })

  if (error) {
    console.error("Feedback submission error:", error)
    return { error: "Erro ao enviar feedback." }
  }

  return { success: true }
}
