"use client"

import { useEffect, useRef } from "react"
import { MessageCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { useChat } from "@/hooks/use-chat"
import { Skeleton } from "@/components/ui/skeleton"

interface ChatContainerProps {
  conversationId?: string
}

export function ChatContainer({ conversationId }: ChatContainerProps) {
  const { messages, isLoading, error, sendMessage } = useChat({
    conversationId,
  })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="p-4 bg-muted rounded-full mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Bem-vindo ao Assistente ImpostoFacil
            </h3>
            <p className="text-muted-foreground max-w-md">
              Tire suas duvidas sobre a reforma tributaria brasileira, IBS, CBS,
              Imposto Seletivo e muito mais. Estou aqui para ajudar!
            </p>
            <div className="grid gap-2 mt-6 text-sm">
              <p className="text-muted-foreground">Experimente perguntar:</p>
              <button
                onClick={() => sendMessage("O que e o IBS e como ele vai funcionar?")}
                className="text-left px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                O que e o IBS e como ele vai funcionar?
              </button>
              <button
                onClick={() => sendMessage("Qual o cronograma de transicao da reforma tributaria?")}
                className="text-left px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                Qual o cronograma de transicao da reforma tributaria?
              </button>
              <button
                onClick={() => sendMessage("Como minha empresa sera afetada pela reforma?")}
                className="text-left px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                Como minha empresa sera afetada pela reforma?
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-0">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-3 py-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-4">
          {error.message}
        </div>
      )}

      <div className="pt-4 border-t">
        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}
