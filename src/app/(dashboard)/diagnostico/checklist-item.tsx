"use client"

import { useState } from "react"
import { CheckCircle, Circle } from "lucide-react"
import { useAnalytics } from "@/lib/analytics/track"

interface ChecklistItemProps {
  id: string
  label: string
  completed: boolean
  onToggle: (id: string) => Promise<{ error?: string }>
}

export function ChecklistItem({ id, label, completed: initialCompleted, onToggle }: ChecklistItemProps) {
  const [completed, setCompleted] = useState(initialCompleted)
  const [loading, setLoading] = useState(false)
  const { track } = useAnalytics()

  async function handleToggle() {
    if (loading) return

    // Optimistic update
    setCompleted(!completed)
    setLoading(true)

    const result = await onToggle(id)

    if (result?.error) {
      // Revert on error
      setCompleted(completed)
    } else {
      track("checklist_item_toggled", { itemId: id, completed: !completed })
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-start gap-2 text-sm w-full text-left group"
    >
      {completed ? (
        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0 group-hover:text-muted-foreground" />
      )}
      <span className={completed ? "line-through text-muted-foreground" : ""}>
        {label}
      </span>
    </button>
  )
}
