import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle,
  Clock,
  Lock,
  MessageCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { NewsletterSection } from "@/components/landing/newsletter-section"

const FAQ_ITEMS = [
  {
    question: "É diferente do BotRTC e do simulador da Receita?",
    answer:
      "Sim. O BotRTC responde perguntas genéricas. O simulador da Receita mostra alíquotas. O ImpostoFácil cruza o perfil da sua empresa (regime, setor, faturamento, UF) para gerar um diagnóstico personalizado com alertas, checklist de ações e projeção ano a ano.",
  },
  {
    question: "Preciso de um contador ainda?",
    answer:
      "Sim, para ações formais. O ImpostoFácil te prepara para a conversa com seu contador: você chega sabendo o impacto estimado, os riscos e as ações prioritárias. O relatório PDF pode ser compartilhado diretamente com ele.",
  },
  {
    question: "Quanto custa?",
    answer:
      "O simulador e o diagnóstico básico são gratuitos. O Diagnóstico Completo (com checklist, projeção ano a ano e análise de regime) está com preço de lançamento de R$49 — pagamento único, sem assinatura. Uma fração do custo de uma consultoria tributária (R$500-2.000+).",
  },
  {
    question: "O simulador assume que eu pago 100% dos impostos?",
    answer:
      "Não. Nosso simulador usa dados da Receita Federal sobre a arrecadação real por setor — a diferença entre o que a lei exige e o que é efetivamente pago. Com a reforma, a cobrança automática de impostos vai diminuir essa diferença. Por isso, muitas empresas terão um impacto maior do que a simples mudança de alíquotas sugere. No diagnóstico, mostramos os dois impactos separados: mudança de alíquota e cobrança mais rigorosa.",
  },
  {
    question: "Meus dados são seguros?",
    answer:
      "Sim. Usamos Supabase (infraestrutura PostgreSQL) com autenticação segura. Não compartilhamos seus dados com terceiros. O conteúdo é baseado na EC 132/2023 e LC 214/2025.",
  },
]

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "ImpostoFácil",
      url: "https://impostofacil.com.br",
      description:
        "Simulador gratuito + diagnóstico tributário personalizado para empresas brasileiras se prepararem para a reforma tributária (EC 132/2023).",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        { "@type": "Offer", price: "0", priceCurrency: "BRL", name: "Diagnóstico Básico" },
        { "@type": "Offer", price: "49", priceCurrency: "BRL", name: "Diagnóstico Completo" },
      ],
    },
    {
      "@type": "Organization",
      name: "ImpostoFácil",
      url: "https://impostofacil.com.br",
      description: "Plataforma de orientação sobre a reforma tributária brasileira.",
    },
  ],
}

export default function LandingPage() {
  return (
    <div className="landing-root relative min-h-screen overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="landing-backdrop" aria-hidden />
      <div className="landing-grid" aria-hidden />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/40 bg-background/75 backdrop-blur-lg">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Logo />

          <nav className="hidden items-center gap-8 text-sm md:flex">
            <Link href="/simulador" className="text-muted-foreground transition-colors hover:text-foreground">
              Simulador
            </Link>
            <Link href="/guias" className="text-muted-foreground transition-colors hover:text-foreground">
              Guias
            </Link>
            <Link href="#como-funciona" className="text-muted-foreground transition-colors hover:text-foreground">
              Como funciona
            </Link>
            <Link href="#precos" className="text-muted-foreground transition-colors hover:text-foreground">
              Preços
            </Link>
            <Link href="#faq" className="text-muted-foreground transition-colors hover:text-foreground">
              FAQ
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/login">Já tenho conta</Link>
            </Button>
            <Button asChild>
              <Link href="/simulador">
                Simular impacto
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="container relative mx-auto px-4 pb-16 pt-14 sm:pt-20 lg:pb-24">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="landing-reveal space-y-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-50 px-4 py-1.5 text-xs font-medium text-amber-800">
                <Clock className="h-3.5 w-3.5" />
                A reforma tributária já começou em 2026
              </span>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-[3.5rem]">
                  Descubra em 2 minutos quanto a reforma tributária vai custar para sua empresa
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
                  Responda algumas perguntas sobre sua empresa e receba um diagnóstico tributário personalizado com alertas, ações e projeção de impacto até 2033.
                </p>
              </div>

              <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/simulador">
                    Simular impacto agora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                  <Link href="/login">Já tenho conta</Link>
                </Button>
              </div>

              <p className="text-sm text-slate-500">Gratuito. Sem cadastro para simular.</p>
            </div>

            {/* Diagnostic preview mockup */}
            <div className="landing-reveal landing-reveal-delay-1 hidden md:block rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-40px_rgba(6,24,44,0.6)] backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Diagnóstico Tributário</p>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                  Risco: Alto
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 mb-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Impacto estimado</p>
                <p className="mt-1 text-2xl font-bold text-red-600">+R$ 47.000/ano</p>
                <p className="text-xs text-slate-500 mt-1">Aumento de 68% na carga tributária</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 rounded-xl bg-amber-50 p-3">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-800">Setor de serviços em Lucro Presumido: grupo de maior impacto</p>
                </div>
                <div className="flex items-start gap-2 rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-slate-700">Atualizar NF-e para campos IBS e CBS</p>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4 text-center">
                <Lock className="h-5 w-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">+15 ações, projeção 2026-2033 e análise de regime</p>
                <p className="text-xs font-medium text-slate-700 mt-1">Disponível no diagnóstico completo</p>
              </div>
            </div>
          </div>
        </section>

        {/* Problem amplification */}
        <section className="container mx-auto px-4 pb-16 lg:pb-24">
          <div className="landing-reveal mb-8 flex flex-col gap-3 sm:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-700">O problema é real</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Três perguntas que todo empresário deveria se fazer agora
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article className="landing-reveal landing-reveal-delay-1 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
              <div className="mb-4 rounded-xl bg-red-50 p-3 w-fit">
                <BarChart3 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Vai pagar mais ou menos?</h3>
              <p className="text-sm text-slate-600 mb-3">
                Serviços em Lucro Presumido: até +200% de carga tributária. Indústria com insumos: pode pagar menos. Depende do perfil.
              </p>
              <p className="text-xs font-medium text-red-600">A média nacional esconde a sua realidade.</p>
            </article>

            <article className="landing-reveal landing-reveal-delay-2 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
              <div className="mb-4 rounded-xl bg-amber-50 p-3 w-fit">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Quando precisa agir?</h3>
              <p className="text-sm text-slate-600 mb-3">
                2026 é ano de teste. Split payment começa em 2027. Créditos de ICMS precisam ser recuperados antes da extinção.
              </p>
              <p className="text-xs font-medium text-amber-600">A janela de preparação está fechando.</p>
            </article>

            <article className="landing-reveal rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
              <div className="mb-4 rounded-xl bg-slate-100 p-3 w-fit">
                <MessageCircle className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Seu contador tem respostas?</h3>
              <p className="text-sm text-slate-600 mb-3">
                A maioria dos contadores ainda está aprendendo as novas regras. Consultoria especializada custa R$500-2.000+.
              </p>
              <p className="text-xs font-medium text-slate-600">Chegue preparado na próxima conversa.</p>
            </article>
          </div>
        </section>

        {/* Product preview */}
        <section className="container mx-auto px-4 pb-16 lg:pb-24">
          <div className="landing-reveal rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-950 to-slate-900 p-7 text-white shadow-lg sm:p-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Diagnóstico Tributário</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Um relatório completo para sua empresa
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
                  Baseado no perfil da sua empresa, você recebe um diagnóstico personalizado com tudo que precisa para se preparar.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-200">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                    Impacto estimado em reais (melhor e pior cenário)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                    Alertas específicos para seu setor e regime
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                    Checklist de adequação com 15-20 ações priorizadas
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                    Projeção ano a ano de 2026 a 2033
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                    Análise de regime: vale mudar de tributação?
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                    PDF para compartilhar com seu contador
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 shrink-0" />
                    Diagnóstico interativo: pergunte e receba respostas personalizadas
                  </li>
                </ul>
                <Button asChild size="lg" className="mt-8 bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="/simulador">
                    Veja o seu em 3 minutos
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <span className="text-sm">Nível de risco</span>
                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-300">Crítico</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <span className="text-sm">Impacto estimado</span>
                    <span className="text-sm font-bold text-red-300">+R$ 47.000/ano</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <span className="text-sm">Alertas encontrados</span>
                    <span className="text-sm font-bold">6</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <span className="text-sm">Ações recomendadas</span>
                    <span className="text-sm font-bold">18</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <span className="text-sm">Regime sugerido</span>
                    <span className="text-sm font-bold text-emerald-300">Lucro Real</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/10 p-3">
                    <span className="text-sm">Economia com migração</span>
                    <span className="text-sm font-bold text-emerald-300">R$ 12.400/ano</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="container mx-auto px-4 pb-16 lg:pb-24">
          <div className="landing-reveal mb-8 flex flex-col gap-3 sm:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Como funciona</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              3 passos para saber onde você está
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="landing-reveal landing-reveal-delay-1 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-lg font-bold text-sky-700">
                1
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Responda algumas perguntas</h3>
              <p className="text-sm text-slate-600">
                Regime tributário, setor, faturamento e estado. Menos de 2 minutos, sem cadastro.
              </p>
            </div>

            <div className="landing-reveal landing-reveal-delay-2 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg font-bold text-emerald-700">
                2
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Receba seu diagnóstico grátis</h3>
              <p className="text-sm text-slate-600">
                Impacto estimado, nível de risco, alertas principais e primeiras ações recomendadas. Pergunte o que quiser — o diagnóstico responde com base nos seus dados.
              </p>
            </div>

            <div className="landing-reveal rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-lg font-bold text-violet-700">
                3
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Desbloqueie o relatório completo</h3>
              <p className="text-sm text-slate-600">
                Checklist completo, projeção ano a ano, análise de regime e PDF para seu contador.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="precos" className="container mx-auto px-4 pb-16 lg:pb-24">
          <div className="landing-reveal mb-8 flex flex-col gap-3 sm:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Preços</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Proteção profissional por uma fração do custo
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {/* Free */}
            <article className="landing-reveal landing-reveal-delay-1 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Diagnóstico Básico</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">Grátis</p>
              <p className="mt-1 text-sm text-slate-500">Para sempre</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Simulação completa de impacto
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Nível de risco personalizado
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  3 alertas principais
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  2 ações recomendadas
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Cronograma de datas importantes
                </li>
              </ul>
              <Button asChild className="mt-6 w-full" variant="outline">
                <Link href="/simulador">Começar grátis</Link>
              </Button>
            </article>

            {/* Diagnóstico Completo */}
            <article className="landing-reveal landing-reveal-delay-2 rounded-3xl border-2 border-primary bg-white/90 p-6 shadow-lg relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground">
                Mais popular
              </span>
              <p className="text-sm font-medium text-slate-500">Diagnóstico Completo</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-lg text-slate-400 line-through">R$97</span>
                <span className="text-4xl font-bold text-slate-900">R$49</span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                  Preço de lançamento
                </span>
                <span className="text-sm text-slate-500">Pagamento único</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Tudo do plano grátis
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Todos os alertas com explicações
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Checklist completo de adequação (15-20 itens)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Projeção ano a ano (2026-2033)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Análise de regime tributário
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Exportação em PDF
                </li>
              </ul>
              <Button asChild className="mt-6 w-full">
                <Link href="/simulador">
                  Simular e desbloquear
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="mt-3 text-center text-xs text-slate-500">Economia de R$48 · Garantia de 7 dias</p>
            </article>

            {/* Pro */}
            <article className="landing-reveal rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-1 text-xs font-medium text-white">
                Em breve
              </span>
              <p className="text-sm font-medium text-slate-500">Pro</p>
              <p className="mt-2 text-4xl font-bold text-slate-900">R$199<span className="text-lg font-normal text-slate-500">/mês</span></p>
              <p className="mt-1 text-sm text-slate-500">Gestão tributária contínua com IA</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Tudo do Diagnóstico Completo
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Diagnóstico recalculado a cada mudança regulatória
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Alertas em tempo real de novas leis e regulamentos
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Simulador de cenários: troca de regime, crescimento, novos produtos
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Perguntas ilimitadas sobre seu diagnóstico com modelos prioritários
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Painel de prazos e obrigações com lembretes automáticos
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Relatórios executivos mensais para sócios e contador
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Benchmark: compare seu impacto com empresas do mesmo setor e porte
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Análise de créditos tributários e oportunidades de recuperação
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  Suporte prioritário por chat
                </li>
              </ul>
              <Button className="mt-6 w-full" variant="outline" disabled>
                Lista de espera
              </Button>
              <p className="mt-3 text-center text-xs text-slate-500">Menos que 1h de consultoria tributária por mês</p>
            </article>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container mx-auto px-4 pb-16 lg:pb-24">
          <div className="landing-reveal mb-8 flex flex-col gap-3 sm:max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">FAQ</p>
            <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-3 max-w-3xl">
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

        {/* Newsletter */}
        <NewsletterSection />

        {/* Final CTA */}
        <section className="container mx-auto px-4 pb-20">
          <div className="landing-reveal landing-reveal-delay-2 relative overflow-hidden rounded-3xl border border-slate-200/70 bg-gradient-to-r from-sky-900 via-slate-900 to-emerald-900 p-8 text-white shadow-2xl sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-cyan-400/20 blur-3xl" aria-hidden />
            <div className="relative text-center max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                A reforma não espera. Simule agora.
              </h2>
              <p className="text-sm leading-6 text-slate-200 sm:text-base">
                Em menos de 3 minutos, descubra o impacto na sua empresa e receba um plano de ação personalizado.
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                  <Link href="/simulador">
                    Simular impacto agora
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                  <Link href="/login">Já tenho conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/70 bg-white/75">
        <div className="container mx-auto px-4 py-8">
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs leading-5 text-amber-950">
            O ImpostoFácil é uma ferramenta educacional. As informações e simulações apresentadas
            têm caráter informativo e não substituem a orientação de um contador ou advogado tributarista.
            Conteúdo baseado na EC 132/2023 e LC 214/2025.
          </p>
          <div className="flex flex-col gap-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 ImpostoFácil. Todos os direitos reservados.</p>
            <div className="flex items-center gap-5">
              <Link href="/reforma" className="transition-colors hover:text-slate-900">
                Impacto por Setor
              </Link>
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
