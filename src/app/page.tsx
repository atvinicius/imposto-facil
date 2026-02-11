import Link from "next/link"
import {
  ArrowRight,
  BarChart,
  BookOpen,
  Calculator,
  CheckCircle,
  ChevronRight,
  FileText,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  User,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { categories, getAllArticles } from "@/lib/content"

interface Capability {
  title: string
  description: string
  bullets: string[]
  href: string
  cta: string
  icon: LucideIcon
}

const CAPABILITIES: Capability[] = [
  {
    title: "Assistente Tributário com IA",
    description:
      "Converse em linguagem simples sobre IBS, CBS, Imposto Seletivo e regras de transição.",
    bullets: [
      "Perguntas e respostas em formato de chat",
      "Modelos de IA selecionáveis no painel",
      "Fluxo direto para dúvidas práticas do dia a dia",
    ],
    href: "/signup",
    cta: "Criar conta para usar o assistente",
    icon: MessageCircle,
  },
  {
    title: "Simulador de Impacto",
    description:
      "Faça um diagnóstico inicial com base em regime, setor, faturamento e estado da empresa.",
    bullets: [
      "Questionário guiado em 4 etapas",
      "Estimativa de impacto anual e nível de risco",
      "Alertas e datas importantes para ação",
    ],
    href: "/simulador",
    cta: "Rodar simulação gratuita",
    icon: Calculator,
  },
  {
    title: "Base de Conhecimento",
    description:
      "Acesse conteúdos estruturados para estudar a reforma tributária com mais clareza.",
    bullets: [
      "Busca por temas e termos-chave",
      "Navegação por categorias",
      "Conteúdo organizado para consultas rápidas",
    ],
    href: "/conhecimento",
    cta: "Explorar base de conhecimento",
    icon: BookOpen,
  },
  {
    title: "Personalização por Perfil",
    description:
      "Cadastre o contexto da empresa para orientar recomendações mais relevantes.",
    bullets: [
      "Onboarding com dados fiscais essenciais",
      "Segmentação por UF, setor e regime tributário",
      "Prioridades práticas no dashboard",
    ],
    href: "/signup",
    cta: "Configurar perfil da empresa",
    icon: User,
  },
]

const TIMELINE = [
  {
    year: "2026",
    title: "Ano de teste",
    description: "Período de adaptação com destaque de CBS/IBS nas operações.",
  },
  {
    year: "2027",
    title: "Virada operacional",
    description:
      "Entrada efetiva da CBS e mudanças que exigem revisão de processos internos.",
  },
  {
    year: "2029",
    title: "Fase intermediária",
    description: "Avanço da substituição gradual de tributos legados.",
  },
  {
    year: "2033",
    title: "Novo sistema consolidado",
    description: "Conclusão da transição para o novo modelo de tributação sobre consumo.",
  },
]

const FAQ_ITEMS = [
  {
    question: "Para quem o ImpostoFácil foi construído?",
    answer:
      "Para donos de pequenas e médias empresas (MEI, ME, EPP) que precisam entender como a reforma tributária afeta seu negócio, sem depender de linguagem técnica.",
  },
  {
    question: "Preciso começar agora ou posso esperar?",
    answer:
      "2026 já é o ano de testes da reforma (CBS 0,9% + IBS 0,1%). A partir de 2027, a CBS entra em vigor efetivamente. Quanto antes você entender os impactos, melhor preparado estará.",
  },
  {
    question: "O simulador substitui uma consultoria tributária?",
    answer:
      "Não. O simulador oferece uma estimativa inicial para orientar suas próximas decisões. Para ações formais, valide com seu contador ou advogado tributarista.",
  },
  {
    question: "As informações são confiáveis?",
    answer:
      "O conteúdo é baseado na legislação oficial (EC 132/2023 e LC 214/2025) e revisado periodicamente. Ainda assim, somos uma ferramenta educacional em beta — não substituímos orientação profissional.",
  },
  {
    question: "É realmente gratuito?",
    answer:
      "Sim. O ImpostoFácil está em fase beta e todas as funcionalidades são gratuitas: simulador, assistente com IA e base de conhecimento.",
  },
]

export default function LandingPage() {
  const totalArticles = getAllArticles().length
  const totalCategories = Object.keys(categories).length

  return (
    <div className="landing-root relative min-h-screen overflow-x-clip">
      <div className="landing-backdrop" aria-hidden />
      <div className="landing-grid" aria-hidden />

      <header className="sticky top-0 z-50 border-b border-white/40 bg-background/75 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="rounded-full bg-primary/10 p-1.5 text-primary">
              <ShieldCheck className="h-4 w-4" />
            </span>
            ImpostoFácil
          </Link>

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/simulador" className="text-muted-foreground transition-colors hover:text-foreground">
              Simulador
            </Link>
            <Link href="#funcionalidades" className="text-muted-foreground transition-colors hover:text-foreground">
              Funcionalidades
            </Link>
            <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Criar conta grátis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="container relative mx-auto px-4 pb-16 pt-14 sm:pt-20 lg:pb-24">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="landing-reveal space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Beta — Ferramenta educacional gratuita
              </span>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Entenda como a reforma tributária afeta a sua empresa
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                  O ImpostoFácil é uma ferramenta gratuita com simulador de impacto, assistente com IA e
                  base de conhecimento para ajudar donos de pequenas empresas a entender o novo sistema
                  tributário (IBS, CBS e IS) sem juridiquês.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button size="lg" asChild>
                  <Link href="/simulador">
                    Fazer simulação agora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/signup">Criar conta grátis</Link>
                </Button>
              </div>

              <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Diagnóstico rápido</p>
                  <p className="mt-1 text-slate-600">Fluxo guiado para mapear impacto inicial.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Conteúdo organizado</p>
                  <p className="mt-1 text-slate-600">Consulta prática por temas prioritários.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Acompanhamento contínuo</p>
                  <p className="mt-1 text-slate-600">Trilhe o plano de transição sem improviso.</p>
                </div>
              </div>
            </div>

            <div className="landing-reveal landing-reveal-delay-1 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-40px_rgba(6,24,44,0.6)] backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Painel de prontidão</p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Comece em menos de 3 min
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Trilhas ativas</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{totalCategories}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Artigos disponíveis</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">{totalArticles}</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Etapas do simulador</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">4</p>
                </div>
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Janela de transição</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-900">2026-2033</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4">
                <p className="text-sm font-medium text-slate-800">O que você resolve no primeiro acesso</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
                    Entender o risco fiscal da sua empresa por perfil tributário.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
                    Identificar próximos passos de curto prazo para 2026/2027.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
                    Organizar decisões com base em conteúdo técnico estruturado.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="container mx-auto px-4 pb-16 lg:pb-24">
          <div className="landing-reveal landing-reveal-delay-2 mb-8 flex flex-col gap-3 sm:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Funcionalidades centrais</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Ferramentas práticas para sair da teoria e executar
            </h2>
            <p className="text-slate-600">
              Simulador de impacto, assistente com IA, base de conhecimento e perfil personalizado — tudo gratuito.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {CAPABILITIES.map((item, index) => {
              const Icon = item.icon

              return (
                <article
                  key={item.title}
                  className={`landing-reveal rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1 ${
                    index % 2 === 0 ? "landing-reveal-delay-1" : "landing-reveal-delay-2"
                  }`}
                >
                  <div className="mb-5 flex items-center gap-3">
                    <span className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-xl font-semibold text-slate-900">{item.title}</h3>
                  </div>

                  <p className="text-sm leading-6 text-slate-600">{item.description}</p>

                  <ul className="mt-4 space-y-2 text-sm text-slate-700">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-600" />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  <Button variant="ghost" asChild className="mt-5 h-auto px-0 text-sm text-slate-900">
                    <Link href={item.href}>
                      {item.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </article>
              )
            })}
          </div>
        </section>

        <section id="processo" className="container mx-auto px-4 pb-16 lg:pb-24">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="landing-reveal rounded-3xl border border-slate-200/80 bg-slate-950 p-7 text-slate-100 shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Método em 3 etapas</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Planejamento tributário orientado por execução</h2>
              <div className="mt-7 space-y-5">
                <div className="flex gap-3">
                  <BarChart className="mt-0.5 h-5 w-5 text-sky-300" />
                  <div>
                    <p className="font-medium">1. Mapeie impacto real</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Rode o simulador para criar uma visão inicial de risco e priorizar esforços.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MessageCircle className="mt-0.5 h-5 w-5 text-sky-300" />
                  <div>
                    <p className="font-medium">2. Tire dúvidas operacionais</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Use o assistente para validar cenários, terminologia e próximos movimentos.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-sky-300" />
                  <div>
                    <p className="font-medium">3. Estruture o plano interno</p>
                    <p className="mt-1 text-sm text-slate-300">
                      Transforme o aprendizado em cronograma e tarefas para seu time financeiro.
                    </p>
                  </div>
                </div>
              </div>
              <Button asChild size="lg" className="mt-8 bg-white text-slate-900 hover:bg-slate-100">
                <Link href="/simulador">
                  Iniciar simulação
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="landing-reveal landing-reveal-delay-1 rounded-3xl border border-slate-200/80 bg-white/90 p-7 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Linha do tempo crítica</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Marcos para monitorar de 2026 a 2033</h3>
              <ul className="mt-7 space-y-4">
                {TIMELINE.map((item) => (
                  <li key={item.year} className="flex gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                    <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-slate-800 shadow-sm">
                      {item.year}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href="/conhecimento/transicao/cronograma" className="group rounded-2xl border border-slate-200 p-4 transition-colors hover:border-slate-400">
                  <p className="text-sm font-medium text-slate-900">Ver cronograma completo</p>
                  <p className="mt-1 text-sm text-slate-600">Acessar conteúdo de transição</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-900">
                    Abrir artigo
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
                <Link href="/signup" className="group rounded-2xl border border-slate-200 p-4 transition-colors hover:border-slate-400">
                  <p className="text-sm font-medium text-slate-900">Montar plano no dashboard</p>
                  <p className="mt-1 text-sm text-slate-600">Centralizar decisões por perfil</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-slate-900">
                    Criar conta
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="container mx-auto px-4 pb-16 lg:pb-24">
          <div className="landing-reveal mb-8 flex flex-col gap-3 sm:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">FAQ</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Perguntas comuns antes de começar
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => (
              <details
                key={item.question}
                className={`landing-reveal rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-sm ${
                  index % 2 === 0 ? "landing-reveal-delay-1" : "landing-reveal-delay-2"
                }`}
              >
                <summary className="cursor-pointer list-none pr-8 text-base font-medium text-slate-900">
                  {item.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <div className="landing-reveal landing-reveal-delay-2 relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-r from-sky-900 via-slate-900 to-emerald-900 p-8 text-white shadow-2xl sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
            <div className="relative grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-200">Pronto para sair do modo reativo?</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Comece hoje com um plano de transição tributária mais claro
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base">
                  Entre no ImpostoFácil, execute sua primeira simulação e organize as decisões críticas de 2026 a 2033 com mais previsibilidade.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-start">
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="/signup">
                    Criar conta grátis
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Link href="/simulador">Testar simulador primeiro</Link>
                </Button>
                <p className="text-xs text-slate-300">Sem cartão de crédito para começar.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white/75">
        <div className="container mx-auto px-4 py-8">
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs leading-5 text-amber-800">
            O ImpostoFácil é uma ferramenta educacional em fase beta. As informações e simulações apresentadas
            têm caráter informativo e não substituem a orientação de um contador ou advogado tributarista.
            Conteúdo baseado na EC 132/2023 e LC 214/2025.
          </p>
          <div className="flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 ImpostoFácil. Todos os direitos reservados.</p>
            <div className="flex items-center gap-5">
              <Link href="/termos" className="transition-colors hover:text-slate-900">
                Termos
              </Link>
              <Link href="/privacidade" className="transition-colors hover:text-slate-900">
                Privacidade
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
