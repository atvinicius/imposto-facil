import { ChatContainer } from "@/components/chat/chat-container"

export default function AssistentePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assistente Virtual</h1>
        <p className="text-muted-foreground mt-2">
          Tire suas duvidas sobre a reforma tributaria brasileira
        </p>
      </div>

      <ChatContainer />
    </div>
  )
}
