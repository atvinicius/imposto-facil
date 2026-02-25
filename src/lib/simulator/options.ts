import type {
  Setor,
  RegimeTributario,
  FaixaFaturamento,
  TipoCustoPrincipal,
  PerfilClientes,
} from "./types"

export const SETOR_OPTIONS: { value: Setor; label: string; emoji: string }[] = [
  { value: "servicos", label: "Serviços", emoji: "💼" },
  { value: "comercio", label: "Comércio", emoji: "🛒" },
  { value: "industria", label: "Indústria", emoji: "🏭" },
  { value: "tecnologia", label: "Tecnologia / SaaS", emoji: "💻" },
  { value: "saude", label: "Saúde", emoji: "🏥" },
  { value: "educacao", label: "Educação", emoji: "📚" },
  { value: "agronegocio", label: "Agronegócio", emoji: "🌾" },
  { value: "construcao", label: "Construção Civil", emoji: "🏗️" },
  { value: "financeiro", label: "Serviços Financeiros", emoji: "🏦" },
  { value: "outro", label: "Outro", emoji: "📦" },
]

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
]

export const REGIME_OPTIONS: { value: RegimeTributario; label: string; description: string }[] = [
  { value: "simples", label: "Simples Nacional", description: "Regime simplificado para micro e pequenas empresas" },
  { value: "lucro_presumido", label: "Lucro Presumido", description: "Base de cálculo presumida pela Receita" },
  { value: "lucro_real", label: "Lucro Real", description: "Tributação sobre o lucro efetivo" },
  { value: "nao_sei", label: "Não tenho certeza", description: "Vamos estimar com base no seu perfil" },
]

export const CUSTO_OPTIONS: { value: TipoCustoPrincipal; label: string; description: string }[] = [
  { value: "materiais", label: "Materiais / Insumos", description: "Matéria-prima, mercadorias, produtos" },
  { value: "servicos", label: "Serviços terceirizados", description: "Consultorias, freelancers, TI" },
  { value: "folha", label: "Folha de pagamento", description: "Salários, encargos, benefícios" },
  { value: "misto", label: "Misto / Equilibrado", description: "Custos bem distribuídos" },
]

export const PERFIL_CLIENTES_OPTIONS: { value: PerfilClientes; label: string; description: string }[] = [
  { value: "b2b", label: "Empresas (B2B)", description: "Vendo principalmente para outras empresas" },
  { value: "b2c", label: "Consumidores (B2C)", description: "Vendo para pessoas físicas" },
  { value: "misto", label: "Ambos", description: "Vendo para empresas e consumidores" },
]

export function deriveFaixaFaturamento(valor: number): FaixaFaturamento {
  if (valor <= 81_000) return "ate_81k"
  if (valor <= 360_000) return "81k_360k"
  if (valor <= 4_800_000) return "360k_4.8m"
  if (valor <= 78_000_000) return "4.8m_78m"
  return "acima_78m"
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR")
}

export function parseCurrencyInput(raw: string): number {
  const digits = raw.replace(/\D/g, "")
  return digits ? parseInt(digits, 10) : 0
}

/** Reverse-map a numeric pctB2B from the DB to a PerfilClientes enum */
export function pctB2BtoPerfilClientes(pctB2B: number | null | undefined): PerfilClientes {
  if (pctB2B == null) return "misto"
  if (pctB2B >= 70) return "b2b"
  if (pctB2B <= 30) return "b2c"
  return "misto"
}
