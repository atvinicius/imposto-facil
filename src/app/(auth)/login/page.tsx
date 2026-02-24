"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle, Clock, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { loginWithMagicLink } from "../actions"
import { GoogleButton } from "@/components/auth/google-button"

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"
  const callbackError = searchParams.get("error")
  const [error, setError] = useState<string | null>(
    callbackError === "auth_callback_error" || callbackError === "verification_error"
      ? "O link expirou ou é inválido. Solicite um novo link abaixo."
      : null
  )
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")
  const [resendCountdown, setResendCountdown] = useState(0)
  const [resending, setResending] = useState(false)
  const [defaultEmail, setDefaultEmail] = useState("")

  useEffect(() => {
    if (callbackError === "auth_callback_error" || callbackError === "verification_error") {
      const stored = localStorage.getItem("impostofacil_pending_email")
      if (stored) setDefaultEmail(stored)
    }
  }, [callbackError])

  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = setInterval(() => {
      setResendCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCountdown])

  async function handleResend() {
    setResending(true)
    try {
      const formData = new FormData()
      formData.set("email", sentEmail)
      formData.set("redirect", redirectTo)
      const result = await loginWithMagicLink(formData)
      if (result?.success) {
        setResendCountdown(60)
      } else {
        setResendCountdown(60)
      }
    } catch {
      // silently fail
    } finally {
      setResending(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)

    const email = formData.get("email") as string
    if (!email?.trim()) {
      setError("Informe seu email")
      setLoading(false)
      return
    }

    formData.set("redirect", redirectTo)

    try {
      const result = await loginWithMagicLink(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSentEmail(email)
        setMagicLinkSent(true)
        setResendCountdown(60)
        localStorage.setItem("impostofacil_pending_email", email)
      }
    } catch {
      setError("Erro ao enviar link. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (magicLinkSent) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-5">
          <div className="mx-auto w-fit rounded-full bg-green-100 dark:bg-green-950/30 p-4">
            <Mail className="h-8 w-8 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Link enviado!</h2>
            <p className="text-muted-foreground text-sm">
              Enviamos um link de acesso para <strong>{sentEmail}</strong>.
            </p>
          </div>
          <ul className="text-sm text-muted-foreground text-left space-y-2">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span>Verifique a caixa de entrada de <strong>{sentEmail}</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
              <span>Olhe na pasta <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
              <span>No Gmail, verifique a aba <strong>Promoções</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-muted-foreground/50 mt-0.5 shrink-0" />
              <span>O link expira em 1 hora</span>
            </li>
          </ul>
          <Button
            variant="outline"
            size="sm"
            disabled={resendCountdown > 0 || resending}
            onClick={handleResend}
          >
            {resending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Reenviando...
              </>
            ) : resendCountdown > 0 ? (
              `Reenviar link (${resendCountdown}s)`
            ) : (
              "Reenviar link"
            )}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta com um link por email
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              key={defaultEmail}
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              defaultValue={defaultEmail}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar link de acesso
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Enviaremos um link para entrar sem senha
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          <GoogleButton mode="login" next={redirectTo !== "/dashboard" ? redirectTo : undefined} />
          <p className="text-sm text-muted-foreground text-center">
            Ainda nao tem conta?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Criar conta
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

function LoginSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto w-full">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
