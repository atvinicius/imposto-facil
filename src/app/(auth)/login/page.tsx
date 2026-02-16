"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2, Mail } from "lucide-react"
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
import { login, loginWithMagicLink } from "../actions"
import { GoogleButton } from "@/components/auth/google-button"

function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/dashboard"
  const callbackError = searchParams.get("error")
  const [error, setError] = useState<string | null>(
    callbackError === "auth_callback_error" || callbackError === "verification_error"
      ? "O link expirou ou é inválido. Solicite um novo link abaixo ou entre com senha."
      : null
  )
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [sentEmail, setSentEmail] = useState("")

  async function handleMagicLink(formData: FormData) {
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
      }
    } catch {
      setError("Erro ao enviar link. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordLogin(formData: FormData) {
    setLoading(true)
    setError(null)

    const result = await login(formData)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Entrar</CardTitle>
        <CardDescription>
          Acesse sua conta com um link por email ou com senha
        </CardDescription>
      </CardHeader>
      <form>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {magicLinkSent && (
            <div className="bg-green-500/10 text-green-700 dark:text-green-400 text-sm p-3 rounded-md flex items-start gap-2">
              <Mail className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Link enviado!</p>
                <p className="text-xs mt-1">
                  Verifique sua caixa de entrada em <strong>{sentEmail}</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              formAction={handleMagicLink}
              className="w-full"
              disabled={loading}
            >
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou entre com senha</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/reset-password"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
            />
          </div>
          <input type="hidden" name="redirect" value={redirectTo} />
          <Button
            type="submit"
            formAction={handlePasswordLogin}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar com senha"}
          </Button>
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
