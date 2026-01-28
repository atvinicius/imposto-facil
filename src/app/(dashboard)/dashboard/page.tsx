import Link from "next/link"
import { MessageCircle, BookOpen, User, ArrowRight, Clock, FileText } from "lucide-react"
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting()}, {profile?.nome || user?.email?.split("@")[0]}!
        </h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo ao ImpostoFacil. O que voce gostaria de explorar hoje?
        </p>
      </div>

      {(!profile?.uf || !profile?.nivel_experiencia || !profile?.regime_tributario) && (
        <Card className="border-amber-500/50 bg-amber-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Complete seu perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione informacoes sobre sua empresa para receber orientacoes
              personalizadas sobre a reforma tributaria.
            </p>
            <Button asChild size="sm">
              <Link href="/onboarding">
                Completar perfil
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/assistente">
          <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">Assistente Virtual</CardTitle>
              <CardDescription>
                Tire suas duvidas sobre a reforma tributaria com nosso
                assistente de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 h-auto">
                Iniciar conversa
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/conhecimento">
          <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">Base de Conhecimento</CardTitle>
              <CardDescription>
                Explore {totalArticles} artigos sobre IBS, CBS, Imposto Seletivo
                e mais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 h-auto">
                Explorar artigos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/perfil">
          <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader>
              <div className="p-3 bg-primary/10 rounded-lg w-fit">
                <User className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mt-4">Meu Perfil</CardTitle>
              <CardDescription>
                Configure seu perfil para receber orientacoes personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="p-0 h-auto">
                Configurar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Destaques da Reforma</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Cronograma de Transicao</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                A transicao para o novo sistema tributario ocorrera entre 2026 e
                2033, com implementacao gradual dos novos tributos.
              </p>
              <Button variant="link" asChild className="p-0 h-auto mt-2">
                <Link href="/conhecimento/transicao/cronograma">
                  Saiba mais
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">IBS e CBS</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Os dois novos tributos que formarao o IVA Dual brasileiro,
                substituindo cinco impostos atuais.
              </p>
              <Button variant="link" asChild className="p-0 h-auto mt-2">
                <Link href="/conhecimento/ibs/introducao">Saiba mais</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
