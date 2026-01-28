export const NIVEL_EXPERIENCIA_OPTIONS = [
  { value: "iniciante", label: "Iniciante", description: "Tenho pouco conhecimento sobre tributação" },
  { value: "intermediario", label: "Intermediário", description: "Entendo o básico de impostos e tributos" },
  { value: "avancado", label: "Avançado", description: "Tenho experiência profissional na área tributária" },
] as const

export const UF_OPTIONS = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
] as const

export const SETOR_OPTIONS = [
  { value: "comercio", label: "Comércio" },
  { value: "industria", label: "Indústria" },
  { value: "servicos", label: "Serviços" },
  { value: "agronegocio", label: "Agronegócio" },
  { value: "tecnologia", label: "Tecnologia" },
  { value: "saude", label: "Saúde" },
  { value: "educacao", label: "Educação" },
  { value: "construcao", label: "Construção Civil" },
  { value: "financeiro", label: "Financeiro" },
  { value: "outro", label: "Outro" },
] as const

export const PORTE_EMPRESA_OPTIONS = [
  { value: "mei", label: "MEI", description: "Microempreendedor Individual" },
  { value: "me", label: "ME", description: "Microempresa" },
  { value: "epp", label: "EPP", description: "Empresa de Pequeno Porte" },
  { value: "medio", label: "Médio Porte", description: "Empresa de médio porte" },
  { value: "grande", label: "Grande Porte", description: "Empresa de grande porte" },
] as const

export const REGIME_TRIBUTARIO_OPTIONS = [
  { value: "simples", label: "Simples Nacional", description: "Regime simplificado para micro e pequenas empresas" },
  { value: "lucro_presumido", label: "Lucro Presumido", description: "Base de cálculo presumida pela Receita Federal" },
  { value: "lucro_real", label: "Lucro Real", description: "Tributação sobre o lucro efetivo da empresa" },
  { value: "nao_sei", label: "Não sei", description: "Ainda não tenho certeza do meu regime" },
] as const

export const INTERESSES_OPTIONS = [
  { value: "ibs", label: "IBS", description: "Imposto sobre Bens e Serviços (estadual/municipal)" },
  { value: "cbs", label: "CBS", description: "Contribuição sobre Bens e Serviços (federal)" },
  { value: "is", label: "Imposto Seletivo", description: "Imposto sobre produtos prejudiciais à saúde/meio ambiente" },
  { value: "transicao", label: "Período de Transição", description: "Cronograma e regras da transição 2026-2033" },
  { value: "creditos", label: "Créditos Tributários", description: "Como funcionará o sistema de créditos" },
  { value: "simples_nacional", label: "Simples Nacional", description: "Impactos da reforma no Simples" },
  { value: "setor_servicos", label: "Setor de Serviços", description: "Impactos específicos para serviços" },
  { value: "exportacao", label: "Exportação", description: "Tratamento tributário de exportações" },
] as const

export type NivelExperiencia = typeof NIVEL_EXPERIENCIA_OPTIONS[number]["value"]
export type UF = typeof UF_OPTIONS[number]["value"]
export type Setor = typeof SETOR_OPTIONS[number]["value"]
export type PorteEmpresa = typeof PORTE_EMPRESA_OPTIONS[number]["value"]
export type RegimeTributario = typeof REGIME_TRIBUTARIO_OPTIONS[number]["value"]
export type Interesse = typeof INTERESSES_OPTIONS[number]["value"]
