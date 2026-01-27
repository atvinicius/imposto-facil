import Link from "next/link"
import { ArrowRight, MessageCircle, BookOpen, User, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            ImpostoFacil
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Criar conta</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl mx-auto">
              Entenda a Reforma Tributaria Brasileira de forma{" "}
              <span className="text-primary">simples</span>
            </h1>
            <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
              Tire suas duvidas sobre IBS, CBS, Imposto Seletivo e as mudancas
              que vao impactar sua empresa. Assistente de IA e base de
              conhecimento atualizada.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Comecar gratuitamente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/conhecimento">Ver base de conhecimento</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Tudo que voce precisa para entender a reforma
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Assistente Virtual</CardTitle>
                  <CardDescription>
                    Tire suas duvidas em tempo real com nosso assistente de IA
                    especializado na reforma tributaria
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Base de Conhecimento</CardTitle>
                  <CardDescription>
                    Artigos detalhados sobre IBS, CBS, Imposto Seletivo,
                    cronograma de transicao e muito mais
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Orientacao Personalizada</CardTitle>
                  <CardDescription>
                    Respostas adaptadas ao seu estado, setor e porte de empresa
                    para orientacao relevante
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* What's Changing Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">
                O que muda com a reforma?
              </h2>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>IBS - Imposto sobre Bens e Servicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Novo tributo de competencia estadual e municipal que
                      substitui ICMS e ISS. Cobranca no destino, nao
                      cumulatividade plena.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>Substitui ICMS e ISS</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>Credito integral sobre insumos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>Aliquota estimada de ~17,7%</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>CBS - Contribuicao sobre Bens e Servicos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Novo tributo federal que substitui PIS, Cofins e parte do
                      IPI. Administrado pela Receita Federal.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>Substitui PIS, Cofins e IPI</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>Simplifica obrigacoes acessorias</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>Aliquota estimada de ~8,8%</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Periodo de Transicao (2026-2033)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Implementacao gradual dos novos tributos com reducao
                      progressiva dos antigos ao longo de 7 anos.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>2026: Inicio da cobranca (aliquotas reduzidas)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>2029-2032: Reducao gradual dos tributos antigos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                        <span>2033: Extincao completa dos tributos substituidos</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prepare sua empresa para a reforma
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Crie sua conta gratuita e comece a entender como as mudancas vao
              impactar seu negocio. Receba orientacoes personalizadas.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/signup">
                Criar conta gratuita
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              2024 ImpostoFacil. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link
                href="/conhecimento"
                className="text-muted-foreground hover:text-foreground"
              >
                Base de Conhecimento
              </Link>
              <Link
                href="/login"
                className="text-muted-foreground hover:text-foreground"
              >
                Entrar
              </Link>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            As informacoes fornecidas sao apenas para fins educacionais e nao
            constituem aconselhamento juridico ou tributario.
          </p>
        </div>
      </footer>
    </div>
  )
}
