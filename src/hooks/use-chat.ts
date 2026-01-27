"use client"

import { useState, useCallback, useRef } from "react"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: { title: string; category: string; path: string }[]
}

export interface UseChatOptions {
  conversationId?: string
  onError?: (error: Error) => void
}

export function useChat(options: UseChatOptions = {}) {
  const { conversationId, onError } = options
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

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
            conversationId,
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
    [messages, conversationId, isLoading, onError]
  )

  const stop = useCallback(() => {
    abortControllerRef.current?.abort()
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    stop,
    clearMessages,
  }
}
