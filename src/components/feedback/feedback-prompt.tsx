"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X, CheckCircle, Loader2, MessageSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAnalytics } from "@/lib/analytics/track"
import { submitFeedback } from "@/app/actions/feedback"

interface Option {
  value: string
  label: string
}

interface FollowUp {
  question: string
  options: Option[]
}

interface FeedbackPromptProps {
  promptId: string
  feedbackType: "pre_purchase" | "post_purchase"
  title: string
  subtitle?: string
  mode: "options" | "rating" | "rating_comment"
  options?: Option[]
  /** Follow-up questions shown after a low rating (1-3) */
  lowRatingFollowUp?: FollowUp
  /** Follow-up questions shown after a high rating (4-5) */
  highRatingFollowUp?: FollowUp
  allowComment?: boolean
  commentPlaceholder?: string
  metadata?: Record<string, unknown>
  delayMs?: number
  className?: string
}

const RATING_EMOJIS = ["😞", "😕", "😐", "🙂", "🤩"]
const STORAGE_PREFIX = "feedback_done_"

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let sessionId = sessionStorage.getItem("analytics_session_id")
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem("analytics_session_id", sessionId)
  }
  return sessionId
}

export function FeedbackPrompt({
  promptId,
  feedbackType,
  title,
  subtitle,
  mode,
  options = [],
  lowRatingFollowUp,
  highRatingFollowUp,
  allowComment = false,
  commentPlaceholder = "Quer nos contar mais? (opcional)",
  metadata,
  delayMs = 0,
  className = "",
}: FeedbackPromptProps) {
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<"input" | "followup" | "submitted">("input")
  const [rating, setRating] = useState<number | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const mountedRef = useRef(false)
  const { track } = useAnalytics()

  // Check localStorage and show after delay
  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true

    const key = STORAGE_PREFIX + promptId
    if (localStorage.getItem(key)) return

    if (delayMs > 0) {
      const timer = setTimeout(() => setVisible(true), delayMs)
      return () => clearTimeout(timer)
    } else {
      setVisible(true)
    }
  }, [promptId, delayMs])

  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_PREFIX + promptId, "dismissed")
    setVisible(false)
    track("feedback_dismissed", { promptId, feedbackType })
  }, [promptId, feedbackType, track])

  const toggleOption = useCallback((value: string) => {
    setSelectedOptions((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }, [])

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    const allOptions = [...selectedOptions]

    await submitFeedback({
      promptId,
      feedbackType,
      rating: rating ?? undefined,
      selectedOptions: allOptions.length > 0 ? allOptions : undefined,
      comment: comment.trim() || undefined,
      pageUrl: window.location.pathname,
      sessionId: getSessionId(),
      metadata,
    })

    localStorage.setItem(STORAGE_PREFIX + promptId, "submitted")
    track("feedback_submitted", {
      promptId,
      feedbackType,
      rating,
      optionCount: allOptions.length,
      hasComment: !!comment.trim(),
    })

    setPhase("submitted")
    setSubmitting(false)

    setTimeout(() => setVisible(false), 2500)
  }, [promptId, feedbackType, rating, selectedOptions, comment, metadata, track])

  const handleRatingSelect = useCallback(
    (value: number) => {
      setRating(value)
      // If we have follow-up questions, show them
      const followUp = value <= 3 ? lowRatingFollowUp : highRatingFollowUp
      if (followUp || mode === "rating_comment") {
        setPhase("followup")
      } else {
        // No follow-up — submit immediately
        setRating(value)
      }
    },
    [lowRatingFollowUp, highRatingFollowUp, mode]
  )

  if (!visible) return null

  const activeFollowUp =
    rating !== null ? (rating <= 3 ? lowRatingFollowUp : highRatingFollowUp) : null

  return (
    <div
      className={`transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${className}`}
    >
      <Card className="border border-muted bg-muted/30">
        <CardContent className="p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium">{title}</p>
                {subtitle && (
                  <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 -m-1"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Submitted state */}
          {phase === "submitted" && (
            <div className="flex items-center justify-center gap-2 py-3 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Obrigado pelo feedback!</span>
            </div>
          )}

          {/* Options mode (pre-purchase objections) */}
          {phase === "input" && mode === "options" && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      selectedOptions.includes(opt.value)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {allowComment && (
                <Textarea
                  rows={2}
                  maxLength={500}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={commentPlaceholder}
                  className="text-sm resize-none"
                />
              )}
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting || (selectedOptions.length === 0 && !comment.trim())}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                Enviar
              </Button>
            </div>
          )}

          {/* Rating mode (emoji scale) */}
          {phase === "input" && (mode === "rating" || mode === "rating_comment") && (
            <div className="flex items-center justify-center gap-3 py-1">
              {RATING_EMOJIS.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => handleRatingSelect(i + 1)}
                  className={`text-2xl transition-transform hover:scale-125 ${
                    rating === i + 1 ? "scale-125" : "opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`Nota ${i + 1}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Follow-up phase (after rating) */}
          {phase === "followup" && (
            <div className="space-y-3">
              {/* Show selected rating */}
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                <span>Sua nota:</span>
                <span className="text-lg">{rating ? RATING_EMOJIS[rating - 1] : ""}</span>
              </div>

              {/* Follow-up question with options */}
              {activeFollowUp && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">{activeFollowUp.question}</p>
                  <div className="flex flex-wrap gap-2">
                    {activeFollowUp.options.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => toggleOption(opt.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                          selectedOptions.includes(opt.value)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted-foreground/30 text-muted-foreground hover:border-foreground/50 hover:text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Always show comment textarea in follow-up */}
              <Textarea
                rows={2}
                maxLength={500}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  rating && rating <= 3
                    ? "O que podemos melhorar? (opcional)"
                    : "Quer nos contar mais? (opcional)"
                }
                className="text-sm resize-none"
              />

              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : null}
                Enviar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
