import { Card, CardContent } from "@/components/ui/card"
import { FaqItem } from "./faq-item"
import { FAQ_ITEMS } from "@/lib/landing-data"

export function FaqSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Perguntas frequentes
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Tire suas dúvidas sobre a reforma e o ImpostoFácil
          </p>

          <Card>
            <CardContent className="pt-6">
              {FAQ_ITEMS.map((item) => (
                <FaqItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
