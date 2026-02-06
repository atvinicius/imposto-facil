import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Building2,
  Clock,
  FileText,
  MessageCircle,
  Sparkles,
  User,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getUser, getUserProfile } from "@/lib/supabase/server"
import { categories, getArticlesByCategory } from "@/lib/content"

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
  const profileCompleted = Boolean(
    profile?.uf && profile?.nivel_experiencia && profile?.regime_tributario
  )

  const actionCards = [
    {
      title: "Assistente Virtual",
      description:
        "Converse com IA para tirar dúvidas práticas sobre regras, prazos e impacto da reforma.",
      href: "/assistente",
      cta: "Iniciar conversa",
      icon: MessageCircle,
      surface:
        "from-sky-500/25 via-cyan-500/15 to-transparent border-sky-400/40",
    },
    {
      title: "Base de Conhecimento",
      description: `Explore ${totalArticles} artigos sobre IBS, CBS, Imposto Seletivo e transição.`,
      href: "/conhecimento",
      cta: "Explorar artigos",
      icon: BookOpen,
      surface:
        "from-emerald-500/25 via-teal-500/15 to-transparent border-emerald-400/40",
    },
    {
      title: "Meu Perfil",
      description:
        "Atualize os dados da empresa para liberar orientações personalizadas e mais precisas.",
      href: "/perfil",
      cta: "Configurar perfil",
      icon: User,
      surface:
        "from-orange-500/20 via-amber-500/10 to-transparent border-orange-400/40",
    },
  ]

  return (
    <div className="relative space-y-6 overflow-hidden pb-2 sm:space-y-8">
      <div className="pointer-events-none absolute -top-20 right-0 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute -left-12 top-60 h-40 w-40 rounded-full bg-emerald-500/10 blur-2xl sm:h-56 sm:w-56" />

      <section className="dashboard-enter relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-slate-950 to-slate-900 p-5 text-white shadow-xl sm:p-8">
        <div className="absolute -right-12 -top-16 h-36 w-36 rounded-full bg-cyan-300/20 blur-2xl sm:h-48 sm:w-48" />
        <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-emerald-400/15 blur-2xl sm:h-44 sm:w-44" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-slate-100">
              <Sparkles className="h-3.5 w-3.5" />
              Painel de acompanhamento
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">
              {greeting()}, {firstName}
            </h1>
            <p className="max-w-xl text-sm text-slate-200 sm:text-base">
              Tenha uma visão rápida da reforma tributária e avance com as
              próximas ações em um único lugar.
            </p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[26rem]">
            <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-200">
                  Artigos disponíveis
                </CardDescription>
                <CardTitle className="text-2xl">{totalArticles}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-200">
                  Status do perfil
                </CardDescription>
                <CardTitle className="text-2xl">
                  {profileCompleted ? "Completo" : "Pendente"}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-white/20 bg-white/10 text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-slate-200">
                  Regime tributário
                </CardDescription>
                <CardTitle className="line-clamp-1 text-lg">
                  {profile?.regime_tributario || "Não informado"}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {!profileCompleted && (
        <Card className="dashboard-enter border-amber-500/40 bg-gradient-to-r from-amber-500/10 to-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" />
              Complete seu perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground sm:max-w-xl">
              Adicione informações da sua empresa para receber recomendações
              específicas para sua realidade fiscal.
            </p>
            <Button asChild className="sm:shrink-0">
              <Link href="/onboarding">
                Completar perfil
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <section className="dashboard-enter space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Ações principais
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Escolha por onde continuar seu fluxo de trabalho.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {actionCards.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className="group">
                <Card className="h-full overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader className="relative">
                    <div
                      className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-r ${item.surface}`}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="rounded-xl border border-border/70 bg-background/90 p-3 shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    <CardTitle className="relative mt-4">{item.title}</CardTitle>
                    <CardDescription className="relative text-sm leading-6">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="h-auto px-0">
                      {item.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="dashboard-enter space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Destaques da reforma
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Conteúdos essenciais para acompanhar os próximos anos.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden border-border/70">
            <CardHeader className="relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 to-cyan-400" />
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Cronograma de Transição</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A transição para o novo sistema tributário ocorre de 2026 a
                2033, com implementação progressiva dos tributos.
              </p>
              <Button variant="link" asChild className="mt-2 h-auto p-0">
                <Link href="/conhecimento/transicao/cronograma">Saiba mais</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-border/70">
            <CardHeader className="relative">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">IBS e CBS</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Conheça os dois novos tributos que formam o IVA Dual e
                substituem cinco impostos atuais.
              </p>
              <Button variant="link" asChild className="mt-2 h-auto p-0">
                <Link href="/conhecimento/ibs/introducao">Saiba mais</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
