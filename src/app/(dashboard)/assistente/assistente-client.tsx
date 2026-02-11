"use client"

import { useCallback } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatContainer } from "@/components/chat/chat-container"
import {
  ConversationSidebarDesktop,
  ConversationSidebarMobile,
} from "@/components/chat/conversation-sidebar"
import { useChat } from "@/hooks/use-chat"
import { useConversations } from "@/hooks/use-conversations"

export function AssistenteClient() {
  const { conversations, isLoading: convLoading, fetchConversations, deleteConversation } =
    useConversations()

  const handleConversationCreated = useCallback(() => {
    fetchConversations()
  }, [fetchConversations])

  const chat = useChat({
    onConversationCreated: handleConversationCreated,
  })

  const handleSelectConversation = useCallback(
    (id: string) => {
      chat.loadConversation(id)
    },
    [chat]
  )

  const handleNewConversation = useCallback(() => {
    chat.startNewConversation()
  }, [chat])

  const handleDeleteConversation = useCallback(
    (id: string) => {
      deleteConversation(id)
      if (chat.activeConversationId === id) {
        chat.startNewConversation()
      }
    },
    [deleteConversation, chat]
  )

  const sidebarProps = {
    conversations,
    activeConversationId: chat.activeConversationId,
    onSelectConversation: handleSelectConversation,
    onNewConversation: handleNewConversation,
    onDeleteConversation: handleDeleteConversation,
    isLoading: convLoading,
  }

  return (
    <div className="flex h-[calc(100vh-7rem)] -mx-4 sm:-mx-6 lg:-mx-8">
      <ConversationSidebarDesktop {...sidebarProps} />
      <div className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-2 md:hidden">
          <ConversationSidebarMobile
            {...sidebarProps}
            trigger={
              <Button variant="ghost" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <h1 className="text-lg font-semibold">Duda</h1>
        </div>
        <ChatContainer chat={chat} />
      </div>
    </div>
  )
}
