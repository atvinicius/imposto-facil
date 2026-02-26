"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { Lock, Sparkles } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { ModelSelector, DEFAULT_MODEL } from "./model-selector"
import { ChatWelcome, type DiagnosticSummary } from "./chat-welcome"
import { FollowUpSuggestions } from "./follow-up-suggestions"
import { AssistantAvatar } from "./assistant-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import type { useChat, Message } from "@/hooks/use-chat"

const FAKE_RESPONSE = `Com base no seu perfil e nos dados do diagnóstico, o impacto estimado da reforma tributária para a sua empresa envolve diversos fatores importantes. Primeiro, é preciso considerar a transição gradual das alíquotas entre 2026 e 2033, que afeta diretamente o seu setor. Além disso, a mudança no regime de créditos tributários pode representar uma oportunidade significativa de economia, dependendo da sua cadeia de fornecedores. Outro ponto relevante é o cronograma de adaptação dos sistemas fiscais, que exige planejamento antecipado para evitar custos extras com adequação de última hora.`

interface ChatContainerProps {
  chat: ReturnType<typeof useChat>
  diagnosticSummary?: DiagnosticSummary | null
  isPaid?: boolean
}

export function ChatContainer({ chat, diagnosticSummary, isPaid = false }: ChatContainerProps) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const { messages, isLoading, error, sendMessage, suggestions } = chat
  const scrollRef = useRef<HTMLDivElement>(null)

  // Paywall state for free users
  const [paywallMessages, setPaywallMessages] = useState<Message[]>([])
  const [paywallTriggered, setPaywallTriggered] = useState(false)
  const [showingTyping, setShowingTyping] = useState(false)
  const paywallTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (paywallTimeoutRef.current) clearTimeout(paywallTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, paywallMessages, paywallTriggered])

  const handleSendMessage = useCallback(
    (content: string) => {
      if (isPaid) {
        sendMessage(content)
        return
      }

      // Free user: fake the interaction
      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: content.trim(),
      }
      setPaywallMessages([userMsg])
      setShowingTyping(true)

      // Simulate typing delay, then show blurred response + paywall
      paywallTimeoutRef.current = setTimeout(() => {
        const fakeMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: FAKE_RESPONSE,
        }
        setPaywallMessages([userMsg, fakeMsg])
        setShowingTyping(false)
        setPaywallTriggered(true)
      }, 1200)
    },
    [isPaid, sendMessage]
  )

  const displayMessages = isPaid ? messages : paywallMessages
  const showWelcome = displayMessages.length === 0 && !showingTyping

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between pb-3 mb-3 border-b">
        <span className="text-sm text-muted-foreground">Modelo:</span>
        <ModelSelector
          value={selectedModel}
          onValueChange={setSelectedModel}
          disabled={isLoading}
        />
      </div>
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        {showWelcome ? (
          <ChatWelcome onSendMessage={handleSendMessage} diagnosticSummary={diagnosticSummary} />
        ) : (
          <div className="space-y-0">
            {displayMessages.map((message, index) => {
              const isBlurredFake =
                !isPaid && paywallTriggered && message.role === "assistant" && index === displayMessages.length - 1

              if (isBlurredFake) {
                return (
                  <div key={message.id} className="relative">
                    <div
                      className="select-none pointer-events-none"
                      style={{ filter: "blur(6px)" }}
                      aria-hidden="true"
                    >
                      <ChatMessage message={message} />
                    </div>
                  </div>
                )
              }

              return <ChatMessage key={message.id} message={message} />
            })}
            {(isLoading && messages[messages.length - 1]?.content === "") || showingTyping ? (
              <div className="flex gap-3 py-4">
                <AssistantAvatar size="sm" className="shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Paywall overlay card */}
        {paywallTriggered && !isPaid && (
          <div className="my-4 rounded-xl border-2 border-teal-200 bg-gradient-to-b from-teal-50 to-white dark:from-teal-950/40 dark:to-background dark:border-teal-800 p-6 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900">
              <Lock className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-lg font-semibold mb-1">
              O assistente de IA é exclusivo do Diagnóstico Completo
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
              Desbloqueie o assistente de IA personalizado que responde com base no seu perfil,
              diagnóstico e dados da reforma tributária.
            </p>
            <Link href="/checkout">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white gap-2 mb-2">
                <Sparkles className="h-4 w-4" />
                Desbloquear por R$49
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Acesso vitalício ao assistente + diagnóstico completo
            </p>
          </div>
        )}
      </ScrollArea>

      {isPaid && (
        <FollowUpSuggestions
          suggestions={suggestions}
          onSelect={handleSendMessage}
          isLoading={isLoading}
        />
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error.message}
        </div>
      )}

      <div className="pt-4 border-t">
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading || showingTyping}
          disabled={paywallTriggered && !isPaid}
        />
      </div>
    </div>
  )
}
