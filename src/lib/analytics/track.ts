"use client"

import { useCallback } from "react"

function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let sessionId = sessionStorage.getItem("analytics_session_id")
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem("analytics_session_id", sessionId)
  }
  return sessionId
}

export function useAnalytics() {
  const track = useCallback(
    (eventName: string, properties: Record<string, unknown> = {}) => {
      try {
        const sessionId = getSessionId()
        fetch("/api/analytics", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event_name: eventName, session_id: sessionId, properties }),
        }).catch(() => {
          // Silent failure — never block UX
        })
      } catch {
        // Silent failure
      }
    },
    []
  )

  return { track }
}
