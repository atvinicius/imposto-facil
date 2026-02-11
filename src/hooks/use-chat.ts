"use client"

import { useState, useCallback, useRef } from "react"
import { parseSuggestions } from "@/lib/chat/parse-suggestions"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: { title: string; category: string; path: string }[]
}

export interface UseChatOptions {
  conversationId?: string
  model?: string
  onError?: (error: Error) => void
  onConversationCreated?: (id: string) => void
}

export function useChat(options: UseChatOptions = {}) {
  const { model, onError, onConversationCreated } = options
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(
    options.conversationId
  )
  const abortControllerRef = useRef<AbortController | null>(null)
  const creatingConversationRef = useRef(false)

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return

      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)
      setError(null)
      setSuggestions([])

      // Auto-create conversation on first message
      let convId = activeConversationId
      if (!convId && !creatingConversationRef.current) {
        creatingConversationRef.current = true
        try {
          const title = content.trim().slice(0, 80)
          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          })
          if (res.ok) {
            const conv = await res.json()
            convId = conv.id
            setActiveConversationId(conv.id)
            onConversationCreated?.(conv.id)
          }
        } catch {
          // Continue without conversation persistence
        } finally {
          creatingConversationRef.current = false
        }
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      try {
        abortControllerRef.current = new AbortController()

        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            conversationId: convId,
            model,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao enviar mensagem")
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("Stream nao disponivel")
        }

        let sources: Message["sources"]

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") continue

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  setMessages((prev) => {
                    const newMessages = [...prev]
                    const lastMessage = newMessages[newMessages.length - 1]
                    if (lastMessage.role === "assistant") {
                      lastMessage.content += parsed.content
                    }
                    return newMessages
                  })
                }
                if (parsed.sources) {
                  sources = parsed.sources
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }

        // Add sources to the final message
        if (sources) {
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]
            if (lastMessage.role === "assistant") {
              lastMessage.sources = sources
            }
            return newMessages
          })
        }

        // Parse suggestions from the final message
        setMessages((prev) => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage.role === "assistant" && lastMessage.content) {
            const { cleanContent, suggestions: parsed } = parseSuggestions(lastMessage.content)
            lastMessage.content = cleanContent
            if (parsed.length > 0) {
              setSuggestions(parsed)
            }
          }
          return newMessages
        })
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return
        }
        const error = err instanceof Error ? err : new Error("Erro desconhecido")
        setError(error)
        onError?.(error)

        // Remove the empty assistant message on error
        setMessages((prev) => prev.slice(0, -1))
      } finally {
        setIsLoading(false)
        abortControllerRef.current = null
      }
    },
    [messages, activeConversationId, model, isLoading, onError, onConversationCreated]
  )

  const stop = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`)
      if (!res.ok) throw new Error("Erro ao carregar conversa")
      const data = await res.json()

      const loadedMessages: Message[] = (data.messages || []).map(
        (m: { id: string; role: "user" | "assistant"; content: string; sources?: Message["sources"] }) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          sources: m.sources,
        })
      )

      setMessages(loadedMessages)
      setActiveConversationId(id)
      setSuggestions([])
      setError(null)

      // Parse suggestions from the last assistant message
      const lastAssistant = [...loadedMessages].reverse().find((m) => m.role === "assistant")
      if (lastAssistant) {
        const { cleanContent, suggestions: parsed } = parseSuggestions(lastAssistant.content)
        if (parsed.length > 0) {
          lastAssistant.content = cleanContent
          setSuggestions(parsed)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Erro desconhecido")
      setError(error)
      onError?.(error)
    }
  }, [onError])

  const startNewConversation = useCallback(() => {
    setMessages([])
    setActiveConversationId(undefined)
    setSuggestions([])
    setError(null)
  }, [])

  return {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    stop,
    activeConversationId,
    loadConversation,
    startNewConversation,
    suggestions,
  }
}
