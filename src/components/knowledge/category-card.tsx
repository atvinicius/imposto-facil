import Link from "next/link"
import { ChevronRight, BookOpen, FileText, Clock, AlertTriangle, BookMarked, Building2, Scale, HelpCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { CategoryKey } from "@/lib/content"

const categoryIcons: Record<CategoryKey, React.ReactNode> = {
  ibs: <BookOpen className="h-5 w-5" />,
  cbs: <FileText className="h-5 w-5" />,
  is: <AlertTriangle className="h-5 w-5" />,
  transicao: <Clock className="h-5 w-5" />,
  glossario: <BookMarked className="h-5 w-5" />,
  setores: <Building2 className="h-5 w-5" />,
  regimes: <Scale className="h-5 w-5" />,
  faq: <HelpCircle className="h-5 w-5" />,
}

interface CategoryCardProps {
  categoryKey: CategoryKey
  name: string
  description: string
  articleCount: number
}

export function CategoryCard({ categoryKey, name, description, articleCount }: CategoryCardProps) {
  return (
    <Link href={`/conhecimento/${categoryKey}`}>
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {categoryIcons[categoryKey]}
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center justify-between">
                {name}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {articleCount} {articleCount === 1 ? "artigo" : "artigos"}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
