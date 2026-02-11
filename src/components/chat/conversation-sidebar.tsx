"use client"

import { Plus, Trash2, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Conversation } from "@/hooks/use-conversations"

interface ConversationSidebarProps {
  conversations: Conversation[]
  activeConversationId?: string
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  isLoading: boolean
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return "agora"
  if (diffMin < 60) return `ha ${diffMin}min`
  if (diffHours < 24) return `ha ${diffHours}h`
  if (diffDays < 7) return `ha ${diffDays}d`
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isLoading,
}: ConversationSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onNewConversation}
        >
          <Plus className="h-4 w-4" />
          Nova conversa
        </Button>
      </div>
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            Carregando...
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            Nenhuma conversa ainda
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-2 text-sm cursor-pointer transition-colors",
                  activeConversationId === conv.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                onClick={() => onSelectConversation(conv.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="truncate">{conv.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(conv.updated_at)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteConversation(conv.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

export function ConversationSidebarDesktop(props: ConversationSidebarProps) {
  return (
    <aside className="hidden md:flex w-64 border-r flex-col h-full">
      <ConversationList {...props} />
    </aside>
  )
}

export function ConversationSidebarMobile({
  trigger,
  ...props
}: ConversationSidebarProps & { trigger: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle>Conversas</SheetTitle>
        </SheetHeader>
        <ConversationList {...props} />
      </SheetContent>
    </Sheet>
  )
}
