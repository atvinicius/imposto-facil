"use client"

import { useState, useEffect, useCallback } from "react"

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations")
      if (!res.ok) return
      const data = await res.json()
      setConversations(data)
    } catch {
      // Silently fail — conversations list is non-critical
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const deleteConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" })
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id))
      }
    } catch {
      // Silently fail
    }
  }, [])

  return {
    conversations,
    isLoading,
    fetchConversations,
    deleteConversation,
  }
}
