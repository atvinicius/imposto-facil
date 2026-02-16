"use client"

import { Suspense, useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  Shield,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { signup, signupWithMagicLink } from "../actions"
import { GoogleButton } from "@/components/auth/google-button"
import { getStoredSimulatorData, NIVEL_RISCO_LABELS } from "@/lib/simulator"
import { useAnalytics } from "@/lib/analytics/track"

function SimulatorSignupFlow() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sentEmail, setSentEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { track } = useAnalytics()
  const trackedStartRef = useRef(false)

  useEffect(() => {
    if (!trackedStartRef.current) {
      trackedStartRef.current = true
      track("signup_started", { from: "simulador" })
    }
  }, [track])

  const simulatorData = typeof window !== "undefined"
    ? getStoredSimulatorData()
    : null

  async function handleMagicLink(formData: FormData) {
    setLoading(true)
    setError(null)

    const nome = formData.get("nome") as string
    const email = formData.get("email") as string

    if (!nome?.trim()) {
      setError("Informe seu nome")
      setLoading(false)
      return
    }
    if (!email?.trim()) {
      setError("Informe seu email")
      setLoading(false)
      return
    }

    formData.set("from", "simulador")

    try {
      const result = await signupWithMagicLink(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSentEmail(email)
        setSuccess(true)
        track("signup_completed", { from: "simulador", method: "magiclink" })
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.")
      }
    } catch {
      setError("Erro ao enviar link. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSignup(formData: FormData) {
    setLoading(true)
    setError(null)

    const nome = formData.get("nome") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!nome?.trim()) {
      setError("Informe seu nome")
      setLoading(false)
      return
    }
    if (!email?.trim()) {
      setError("Informe seu email")
      setLoading(false)
      return
    }
    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    formData.set("from", "simulador")

    try {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSentEmail(email)
        setSuccess(true)
        track("signup_completed", { from: "simulador", method: "password" })
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.")
      }
    } catch {
      setError("Erro ao criar conta. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const riscoInfo = simulatorData
    ? NIVEL_RISCO_LABELS[simulatorData.teaser.nivelRisco]
    : null

  if (success) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-4">
        <div className="mx-auto w-fit rounded-full bg-green-100 dark:bg-green-950/30 p-4">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Verifique seu email</h1>
        <p className="text-muted-foreground">
          Enviamos um link de acesso para <strong>{sentEmail}</strong>.
          Clique no link para entrar e ver seu diagnóstico tributário completo.
        </p>
        <p className="text-sm text-muted-foreground">
          Não recebeu? Verifique sua caixa de spam ou lixo eletrônico.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-0 md:grid-cols-5 md:min-h-[560px] overflow-hidden rounded-xl border shadow-lg">
      {/* Left panel — dark, shows simulator context */}
      <div className="md:col-span-2 bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6 md:p-8 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    s < 5
                      ? "bg-white/60"
                      : "bg-white animate-pulse"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-slate-400">Etapa 5 de 5 — Criar conta</p>
          </div>

          {/* Risk & Impact */}
          {simulatorData && riscoInfo ? (
            <div className="space-y-4">
              <Badge className={`${riscoInfo.color} text-sm`}>
                Risco: {riscoInfo.label}
              </Badge>
              <p className="text-lg font-semibold leading-snug">
                {simulatorData.teaser.impactoResumo}
              </p>
              <p className="text-sm text-slate-300">
                {simulatorData.teaser.alertaPrincipal}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <TrendingUp className="h-8 w-8 text-slate-400" />
              <p className="text-lg font-semibold">
                Seu diagnóstico tributário está quase pronto
              </p>
            </div>
          )}

          {/* What they'll unlock */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Ao criar sua conta você recebe
            </p>
            <ul className="space-y-2.5">
              {[
                { icon: AlertTriangle, text: "Todos os alertas personalizados" },
                { icon: CheckCircle, text: "Checklist de adequação" },
                { icon: Clock, text: "Cronograma com datas-chave" },
                { icon: TrendingUp, text: "Projeção de impacto 2026-2033" },
              ].map((item) => (
                <li key={item.text} className="flex items-center gap-2 text-sm text-slate-200">
                  <item.icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  {item.text}
                </li>
              ))}
              <li className="flex items-center gap-2 text-sm text-slate-400">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                + análise de regime e PDF (R$29)
              </li>
            </ul>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 pt-6 text-xs text-slate-500">
          <Shield className="h-3.5 w-3.5" />
          Seus dados são protegidos e não são compartilhados.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="md:col-span-3 p-6 md:p-8 flex flex-col justify-center bg-background">
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Crie sua conta</h1>
          <p className="text-sm text-muted-foreground">
            Leva menos de 30 segundos. Seus dados da simulação já estão salvos.
          </p>
        </div>

        <form className="space-y-5">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                name="nome"
                type="text"
                placeholder="Seu nome"
                autoComplete="name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              formAction={handleMagicLink}
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Desbloquear diagnóstico
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Enviaremos um link de acesso para seu email
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {showPassword ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
              </div>
              <Button
                type="submit"
                formAction={handlePasswordSignup}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                {loading ? "Criando conta..." : "Criar conta com senha"}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowPassword(true)}
              className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Prefiro criar com senha
            </button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          <GoogleButton mode="signup" next="/diagnostico" />

          <p className="text-sm text-muted-foreground text-center">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}

function StandardSignupForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [sentEmail, setSentEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { track } = useAnalytics()
  const trackedStartRef = useRef(false)

  useEffect(() => {
    if (!trackedStartRef.current) {
      trackedStartRef.current = true
      track("signup_started", { from: "standard" })
    }
  }, [track])

  async function handleMagicLink(formData: FormData) {
    setLoading(true)
    setError(null)

    const nome = formData.get("nome") as string
    const email = formData.get("email") as string

    if (!nome?.trim()) {
      setError("Informe seu nome")
      setLoading(false)
      return
    }
    if (!email?.trim()) {
      setError("Informe seu email")
      setLoading(false)
      return
    }

    try {
      const result = await signupWithMagicLink(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSentEmail(email)
        setSuccess(true)
        track("signup_completed", { from: "standard", method: "magiclink" })
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.")
      }
    } catch {
      setError("Erro ao enviar link. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  async function handlePasswordSignup(formData: FormData) {
    setLoading(true)
    setError(null)

    const nome = formData.get("nome") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (!nome?.trim()) {
      setError("Informe seu nome")
      setLoading(false)
      return
    }
    if (!email?.trim()) {
      setError("Informe seu email")
      setLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      setLoading(false)
      return
    }
    if (!password || password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const result = await signup(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSentEmail(email)
        setSuccess(true)
        track("signup_completed", { from: "standard", method: "password" })
      } else {
        setError("Ocorreu um erro inesperado. Tente novamente.")
      }
    } catch {
      setError("Erro ao criar conta. Verifique sua conexão e tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto w-full">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <div className="mx-auto w-fit rounded-full bg-green-100 dark:bg-green-950/30 p-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Verifique seu email</h2>
            <p className="text-muted-foreground text-sm">
              Enviamos um link de acesso para <strong>{sentEmail}</strong>.
              Clique no link para entrar e começar a usar o ImpostoFácil.
            </p>
            <p className="text-xs text-muted-foreground">
              Não recebeu? Verifique sua caixa de spam ou lixo eletrônico.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto w-full">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Criar conta</CardTitle>
          <p className="text-sm text-muted-foreground">
            Preencha os dados abaixo para criar sua conta
          </p>
        </CardHeader>
        <form>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" type="text" placeholder="Seu nome" autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="seu@email.com" autoComplete="email" />
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
                ) : "Criar conta"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Enviaremos um link de acesso para seu email
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            {showPassword ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar senha</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" />
                </div>
                <Button
                  type="submit"
                  formAction={handlePasswordSignup}
                  variant="outline"
                  className="w-full"
                  disabled={loading}
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  {loading ? "Criando conta..." : "Criar conta com senha"}
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowPassword(true)}
                className="w-full text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Prefiro criar com senha
              </button>
            )}
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
    </div>
  )
}

function SignupRouter() {
  const searchParams = useSearchParams()
  const fromSimulator = searchParams.get("from") === "simulador"

  if (fromSimulator) {
    return <SimulatorSignupFlow />
  }

  return <StandardSignupForm />
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupRouter />
    </Suspense>
  )
}
