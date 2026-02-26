import Link from "next/link"

export function ReformaCta() {
  return (
    <section className="my-12 rounded-lg border border-primary/20 bg-primary/5 p-6 sm:p-8 text-center">
      <h2 className="text-xl sm:text-2xl font-semibold mb-3">
        Estes dados sao medias setoriais. Qual o impacto exato para sua empresa?
      </h2>
      <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
        Use nosso simulador gratuito para calcular o impacto da reforma tributaria
        com base no seu faturamento, regime e estado. Leva menos de 2 minutos.
      </p>
      <Link
        href="/simulador"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
      >
        Simular impacto para minha empresa
      </Link>
    </section>
  )
}
