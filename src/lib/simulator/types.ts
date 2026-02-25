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

export type TipoCustoPrincipal = "materiais" | "servicos" | "folha" | "misto"

export type PerfilClientes = "b2b" | "b2c" | "misto"

export interface EnhancedProfile {
  fatorR?: number          // 0-100: payroll/revenue ratio
  pctB2B?: number          // 0-100: % of sales to other businesses
  tipoCusto?: TipoCustoPrincipal
  pctInterestadual?: number // 0-100: % interstate sales
  temIncentivoICMS?: "sim" | "nao" | "nao_sei"
  numFuncionarios?: string  // bracket
  exportaServicos?: boolean
}

export interface SimuladorInput {
  regime: RegimeTributario
  setor: Setor
  faturamento: FaixaFaturamento
  uf: string
  // New fields collected upfront in the expanded simulator
  faturamentoExato?: number       // exact annual revenue in R$
  fatorR?: number                 // 0-100: payroll/revenue ratio
  tipoCusto?: TipoCustoPrincipal
  perfilClientes?: PerfilClientes // b2b, b2c, or misto
  pctB2B?: number                 // 0-100: derived from perfilClientes
  // Adaptive simulator fields
  temIncentivoICMS?: "sim" | "nao" | "nao_sei"
  exportaServicos?: boolean
  enhanced?: EnhancedProfile      // legacy progressive profiling (kept for compatibility)
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

  // Metodologia e fontes da simulação
  metodologia: {
    resumo: string
    confianca: "alta" | "media" | "baixa"
    fontes: string[]
    limitacoes: string[]
    ultimaAtualizacao: string
  }

  // Confidence score (0-100) based on data completeness
  confiancaPerfil: number

  // Formalization pressure from tax reform enforcement
  efetividadeTributaria: {
    fatorEfetividade: number                              // 0-1, sector avg effectiveness
    cargaEfetivaAtualPct: number                          // effective % of revenue as tax
    cargaLegalAtualPct: number                            // statutory % of revenue as tax
    impactoMudancaAliquota: number                        // R$/year from rate changes only
    impactoFormalizacao: number                           // R$/year from formalization pressure
    impactoTotalEstimado: number                          // combined R$/year
    pressaoFormalizacao: "baixa" | "moderada" | "alta" | "muito_alta"
  }

  // State-specific ICMS adjustment (goods sectors, non-Simples only)
  ajusteIcmsUf?: {
    ufAliquota: number           // state modal ICMS rate (e.g., 23)
    referenciaAliquota: number   // national reference (19)
    margemEstimada: number       // sector gross margin (e.g., 0.30)
    ajustePp: number             // adjustment in pp applied to CARGA_ATUAL
    direcao: "favoravel" | "desfavoravel" | "neutro"
    fonteUf: string              // legislative source
  }

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
