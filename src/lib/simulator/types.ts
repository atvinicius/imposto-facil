// Simulator Types

export type RegimeTributario = "simples" | "lucro_presumido" | "lucro_real" | "nao_sei"
export type Setor = 
  | "comercio" 
  | "industria" 
  | "servicos" 
  | "agronegocio" 
  | "tecnologia" 
  | "saude" 
  | "educacao" 
  | "construcao" 
  | "financeiro" 
  | "outro"

export type PorteEmpresa = "MEI" | "ME" | "EPP" | "MEDIO" | "GRANDE"

export type FaixaFaturamento = 
  | "ate_81k"      // MEI: até R$81.000/ano
  | "81k_360k"     // ME: R$81.000 - R$360.000
  | "360k_4.8m"    // EPP: R$360.000 - R$4.8M
  | "4.8m_78m"     // Médio: R$4.8M - R$78M
  | "acima_78m"    // Grande: acima de R$78M

export interface SimuladorInput {
  regime: RegimeTributario
  setor: Setor
  faturamento: FaixaFaturamento
  uf: string
}

export interface SimuladorResult {
  // Impacto estimado
  impactoAnual: {
    min: number
    max: number
    percentual: number // positivo = paga mais, negativo = paga menos
  }
  
  // Nível de risco/urgência
  nivelRisco: "baixo" | "medio" | "alto" | "critico"
  
  // Principais alertas
  alertas: string[]
  
  // Datas importantes personalizadas
  datasImportantes: {
    data: string
    descricao: string
    urgencia: "info" | "warning" | "danger"
  }[]
  
  // Ações recomendadas (teaser - só mostra 2, resto fica gated)
  acoesRecomendadas: string[]
  
  // Seção gated (só mostra após signup/pagamento)
  gatedContent: {
    checklistCompleto: string[]
    analiseDetalhada: string
    comparativoRegimes: boolean
    projecaoAnual: {
      ano: number
      aliquotaIBS: number
      aliquotaCBS: number
      cargaEstimada: number
      diferencaVsAtual: number
      descricao: string
    }[]
    analiseRegime: {
      regimeAtual: string
      regimeSugerido: string | null
      economiaEstimada: number | null
      justificativa: string
      fatores: string[]
    } | null
  }
}

export interface SimuladorTeaser {
  impactoResumo: string // "Sua empresa pode pagar até R$X a mais por ano"
  nivelRisco: "baixo" | "medio" | "alto" | "critico"
  alertaPrincipal: string
  ctaTexto: string
}
