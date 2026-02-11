"use client"

import { useState } from "react"
import { Mail, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { subscribeNewsletter } from "@/app/actions/newsletter"
import { useAnalytics } from "@/lib/analytics/track"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const { track } = useAnalytics()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setStatus("loading")
    const result = await subscribeNewsletter(email, "landing")

    if (result.success) {
      setStatus("success")
      setMessage("Inscrição confirmada!")
      track("newsletter_subscribed", { source: "landing" })
      setEmail("")
      setTimeout(() => setStatus("idle"), 5000)
    } else {
      setStatus("error")
      setMessage(result.error || "Erro ao se inscrever.")
      setTimeout(() => setStatus("idle"), 5000)
    }
  }

  return (
    <section className="container mx-auto px-4 pb-16 lg:pb-24">
      <div className="landing-reveal rounded-3xl border border-slate-200/80 bg-white/95 p-8 shadow-sm sm:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-4 w-fit rounded-xl bg-sky-50 p-3">
            <Mail className="h-6 w-6 text-sky-600" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Fique atualizado sobre a reforma
          </h2>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            Sem spam, apenas conteúdo relevante sobre as mudanças que afetam sua empresa.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading" || status === "success"}
              className="sm:max-w-xs"
            />
            <Button
              type="submit"
              disabled={status === "loading" || status === "success" || !email.trim()}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Inscrevendo...
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Inscrito!
                </>
              ) : (
                "Inscrever-se"
              )}
            </Button>
          </form>

          {status === "error" && (
            <p className="mt-3 text-sm text-destructive">{message}</p>
          )}
          {status === "success" && (
            <p className="mt-3 text-sm text-green-600">{message}</p>
          )}
        </div>
      </div>
    </section>
  )
}
