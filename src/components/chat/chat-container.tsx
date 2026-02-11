"use client"

import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"
import { ModelSelector, DEFAULT_MODEL } from "./model-selector"
import { DudaWelcome } from "./duda-welcome"
import { FollowUpSuggestions } from "./follow-up-suggestions"
import { Skeleton } from "@/components/ui/skeleton"
import type { useChat } from "@/hooks/use-chat"

interface ChatContainerProps {
  chat: ReturnType<typeof useChat>
}

export function ChatContainer({ chat }: ChatContainerProps) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
  const { messages, isLoading, error, sendMessage, suggestions } = chat
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

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
        {messages.length === 0 ? (
          <DudaWelcome onSendMessage={sendMessage} />
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

      <FollowUpSuggestions
        suggestions={suggestions}
        onSelect={sendMessage}
        isLoading={isLoading}
      />

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
