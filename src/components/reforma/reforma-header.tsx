const RISK_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  baixo:   { bg: "bg-green-100",  text: "text-green-800",  label: "Risco Baixo" },
  medio:   { bg: "bg-yellow-100", text: "text-yellow-800", label: "Risco Moderado" },
  alto:    { bg: "bg-orange-100", text: "text-orange-800", label: "Risco Alto" },
  critico: { bg: "bg-red-100",    text: "text-red-800",    label: "Risco Critico" },
}

interface ReformaHeaderProps {
  title: string
  subtitle: string
  riskLevel?: string
}

export function ReformaHeader({ title, subtitle, riskLevel }: ReformaHeaderProps) {
  const risk = riskLevel ? RISK_STYLES[riskLevel] : null

  return (
    <header className="mb-8">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
        {title}
      </h1>
      <p className="text-lg text-muted-foreground mb-4">{subtitle}</p>
      {risk && (
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${risk.bg} ${risk.text}`}>
          {risk.label}
        </span>
      )}
    </header>
  )
}
