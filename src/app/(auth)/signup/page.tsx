"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signup } from "../actions"
import { GoogleButton } from "@/components/auth/google-button"
import { getStoredSimulatorData, NIVEL_RISCO_LABELS } from "@/lib/simulator"

function SignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const fromSimulator = searchParams.get("from") === "simulador"

  const simulatorData = typeof window !== "undefined" && fromSimulator
    ? getStoredSimulatorData()
    : null

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    setSuccess(false)

    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    if (fromSimulator) {
      formData.set("from", "simulador")
    }

    try {
      const result = await signup(formData)

      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.")
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("Erro ao criar conta. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">
          {fromSimulator ? "Crie sua conta para ver seu diagnóstico" : "Criar conta"}
        </CardTitle>
        <CardDescription>
          {fromSimulator
            ? "Seu Diagnóstico Tributário está quase pronto"
            : "Preencha os dados abaixo para criar sua conta"
          }
        </CardDescription>
      </CardHeader>
      <form action={handleSubmit}>
        <CardContent className="space-y-4">
          {fromSimulator && simulatorData && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Resultado da sua simulação</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={NIVEL_RISCO_LABELS[simulatorData.teaser.nivelRisco].color}>
                  Risco: {NIVEL_RISCO_LABELS[simulatorData.teaser.nivelRisco].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{simulatorData.teaser.impactoResumo}</p>
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md space-y-2">
              <p className="font-medium">Quase lá!</p>
              <p>Enviamos um link de confirmação para seu email. Clique no link para ativar sua conta e {fromSimulator ? "ver seu diagnóstico" : "começar a usar o ImpostoFácil"}.</p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              type="text"
              placeholder="Seu nome"
              required
              autoComplete="name"
            />
          </div>
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
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar senha</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading || !!success}>
            {loading ? "Criando conta..." : fromSimulator ? "Criar conta e ver diagnóstico" : "Criar conta"}
          </Button>
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>
          <GoogleButton mode="signup" />
          <p className="text-sm text-muted-foreground text-center">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
