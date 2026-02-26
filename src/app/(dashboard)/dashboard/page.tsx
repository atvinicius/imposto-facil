import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BookOpen,
  Calculator,
  ClipboardCheck,
  Clock,
  FileText,
  LineChart,
  MessageCircle,
  Target,
} from "lucide-react"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getUser, getUserProfile } from "@/lib/supabase/server"
import { categories, getArticlesByCategory } from "@/lib/content"
import { calculateReadinessScore } from "@/lib/readiness/score"
import type { SimuladorResult } from "@/lib/simulator/types"
import { ReadinessScoreCard } from "./readiness-score"

export default async function DashboardPage() {
  const user = await getUser()
  const profile = await getUserProfile()

  const totalArticles = Object.keys(categories).reduce(
    (sum, cat) => sum + getArticlesByCategory(cat).length,
    0
  )

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Bom dia"
    if (hour < 18) return "Boa tarde"
    return "Boa noite"
  }

  const firstName = profile?.nome || user?.email?.split("@")[0]
  const hasSimulatorData = Boolean(
    profile?.setor && profile?.faturamento && profile?.uf
  )
  const readinessScore = profile ? calculateReadinessScore(profile) : null

  const tools = [
    {
      title: "Diagnóstico Tributário",
      description: hasSimulatorData
        ? "Seu diagnóstico personalizado está pronto para consulta."
        : "Descubra como a reforma impacta sua empresa.",
      href: "/diagnostico",
      cta: hasSimulatorData ? "Ver diagnóstico" : "Gerar diagnóstico",
      icon: ClipboardCheck,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Tire Dúvidas",
      description:
        "Pergunte sobre seu diagnóstico, prazos e ações recomendadas.",
      href: "/assistente",
      cta: "Fazer uma pergunta",
      icon: MessageCircle,
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      title: "Base de Conhecimento",
      description: `${totalArticles} artigos sobre IBS, CBS e Imposto Seletivo.`,
      href: "/conhecimento",
      cta: "Explorar artigos",
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: hasSimulatorData ? "Recalcular Diagnóstico" : "Simulador de Impacto",
      description: hasSimulatorData
        ? "Atualize seus dados e veja como o impacto muda."
        : "Simule o impacto da reforma na sua empresa em menos de 2 minutos.",
      href: hasSimulatorData ? "/diagnostico" : "/simulador",
      cta: hasSimulatorData ? "Recalcular" : "Abrir simulador",
      icon: Calculator,
      color: "text-amber-700",
      bg: "bg-amber-50",
    },
  ]

  const comingSoon = [
    {
      title: "Alertas por E-mail",
      description:
        "Receba notificações sobre prazos e mudanças importantes da reforma.",
      icon: Bell,
    },
    {
      title: "Painel de Evolução",
      description:
        "Acompanhe a evolução do impacto tributário ano a ano com gráficos.",
      icon: LineChart,
    },
  ]

  return (
    <div className="dashboard-enter space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {greeting()}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Acompanhe a reforma tributária e prepare sua empresa.
        </p>
      </div>

      {/* Readiness Score */}
      {readinessScore && <ReadinessScoreCard score={readinessScore} />}

      {/* Alert banners */}
      {hasSimulatorData && (
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-100 p-2">
                <ClipboardCheck className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="font-medium text-sm">
                  Seu Diagnóstico Tributário está pronto
                </p>
                <p className="text-sm text-muted-foreground">
                  Veja alertas, ações recomendadas e projeções personalizadas.
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/diagnostico">
                Ver diagnóstico
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {!hasSimulatorData && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2">
                <Calculator className="h-5 w-5 text-amber-700" />
              </div>
              <div>
                <p className="font-medium text-sm">Simule o impacto da reforma</p>
                <p className="text-sm text-muted-foreground">
                  Em menos de 2 minutos, descubra como a reforma afeta sua empresa.
                </p>
              </div>
            </div>
            <Button asChild size="sm">
              <Link href="/simulador">
                Simular agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Priority insights — shown when user has simulator data */}
      {hasSimulatorData && profile?.simulator_result && (() => {
        const sim = profile.simulator_result as unknown as SimuladorResult
        const pressao = sim.efetividadeTributaria?.pressaoFormalizacao
        const isPaid = profile.subscription_tier === "diagnostico" || profile.subscription_tier === "pro"
        const confianca = sim.confiancaPerfil

        // Only show if there's something urgent to say
        if (!pressao || pressao === "baixa") return null

        return (
          <div className="space-y-3">
            {/* Formalization pressure warning */}
            {(pressao === "alta" || pressao === "muito_alta") && (
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-100 p-2">
                      <AlertTriangle className="h-5 w-5 text-amber-700" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Pressão de formalização {pressao === "muito_alta" ? "muito alta" : "alta"} no seu setor
                      </p>
                      <p className="text-sm text-muted-foreground">
                        A cobrança automática a partir de 2027 pode ter impacto maior que a mudança de alíquotas.
                        {!isPaid && " Desbloqueie o diagnóstico para ver o impacto detalhado."}
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant={isPaid ? "outline" : "default"}>
                    <Link href="/diagnostico">
                      {isPaid ? "Ver detalhes" : "Ver diagnóstico"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Low confidence prompt */}
            {confianca != null && confianca < 50 && (
              <Card className="border-sky-200 bg-sky-50/50">
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-sky-100 p-2">
                      <Target className="h-5 w-5 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        Diagnóstico com precisão de {confianca}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Complete seu perfil no simulador para resultados mais precisos —
                        dados como faturamento exato e estrutura de custos fazem grande diferença.
                      </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/simulador">
                      Atualizar dados
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )
      })()}

      {/* Main tools */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Ferramentas
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href} className="group">
                <Card className="h-full transition-colors hover:border-foreground/20">
                  <CardContent className="flex items-start gap-4 p-4 sm:p-5">
                    <div className={`shrink-0 rounded-lg p-2.5 ${tool.bg}`}>
                      <Icon className={`h-5 w-5 ${tool.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium sm:text-base">{tool.title}</h3>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                        {tool.description}
                      </p>
                      <span className="mt-2 inline-flex items-center text-xs font-medium text-primary group-hover:underline sm:text-sm">
                        {tool.cta}
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Coming soon */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Em breve</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {comingSoon.map((item) => {
            const Icon = item.icon
            return (
              <Card key={item.title} className="border-dashed">
                <CardContent className="p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Em breve
                    </Badge>
                  </div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Reform highlights */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          Destaques da reforma
        </h2>
        <div className="grid gap-3 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <CardContent className="flex items-start gap-4 p-5">
              <div className="shrink-0 rounded-lg bg-red-50 p-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium">Próximo Marco: Janeiro 2027</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  CBS entra em vigor, PIS/Cofins são extintos e inicia a retenção
                  automática de impostos nas transações eletrônicas.
                </p>
                <Button
                  variant="link"
                  asChild
                  className="mt-1 h-auto p-0 text-sm"
                >
                  <Link href="/conhecimento/transicao/cronograma">
                    Ver cronograma completo
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="shrink-0 rounded-lg bg-sky-50 p-2">
                <Clock className="h-4 w-4 text-sky-600" />
              </div>
              <div>
                <h3 className="font-medium">Cronograma de Transição</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Transição de 2026 a 2033, com implementação progressiva dos
                  novos tributos.
                </p>
                <Button
                  variant="link"
                  asChild
                  className="mt-1 h-auto p-0 text-sm"
                >
                  <Link href="/conhecimento/transicao/cronograma">
                    Saiba mais
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <div className="shrink-0 rounded-lg bg-emerald-50 p-2">
                <FileText className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-medium">IBS e CBS</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Os dois novos tributos do IVA Dual que substituem cinco
                  impostos atuais.
                </p>
                <Button
                  variant="link"
                  asChild
                  className="mt-1 h-auto p-0 text-sm"
                >
                  <Link href="/conhecimento/ibs/introducao">Saiba mais</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
