/**
 * Display name, slug, and preposition mappings for programmatic SEO pages.
 */

import type { Setor, RegimeTributario } from "@/lib/simulator/types"

// ---------------------------------------------------------------------------
// Sectors (excluding "outro")
// ---------------------------------------------------------------------------

export const SEO_SETORES = [
  "comercio", "industria", "servicos", "agronegocio", "tecnologia",
  "saude", "educacao", "construcao", "financeiro",
] as const satisfies readonly Setor[]

export type SeoSetor = (typeof SEO_SETORES)[number]

export const SETOR_DISPLAY: Record<SeoSetor, { nome: string; preposicao: string; emoji: string; descricao: string }> = {
  comercio:   { nome: "Comercio",           preposicao: "no",  emoji: "🛒", descricao: "Varejo, atacado e distribuicao" },
  industria:  { nome: "Industria",          preposicao: "na",  emoji: "🏭", descricao: "Manufatura e transformacao" },
  servicos:   { nome: "Servicos",           preposicao: "em",  emoji: "💼", descricao: "Prestacao de servicos em geral" },
  agronegocio:{ nome: "Agronegocio",        preposicao: "no",  emoji: "🌾", descricao: "Producao agropecuaria e agroalimentar" },
  tecnologia: { nome: "Tecnologia",         preposicao: "em",  emoji: "💻", descricao: "Software, SaaS e servicos de TI" },
  saude:      { nome: "Saude",              preposicao: "na",  emoji: "🏥", descricao: "Servicos de saude e dispositivos medicos" },
  educacao:   { nome: "Educacao",           preposicao: "na",  emoji: "📚", descricao: "Ensino e servicos educacionais" },
  construcao: { nome: "Construcao Civil",   preposicao: "na",  emoji: "🏗️", descricao: "Construcao, incorporacao e reformas" },
  financeiro: { nome: "Servicos Financeiros", preposicao: "em", emoji: "🏦", descricao: "Bancos, seguradoras e fintechs" },
}

// ---------------------------------------------------------------------------
// Regimes (excluding "nao_sei")
// ---------------------------------------------------------------------------

export const SEO_REGIMES = [
  "simples", "lucro_presumido", "lucro_real",
] as const satisfies readonly RegimeTributario[]

export type SeoRegime = (typeof SEO_REGIMES)[number]

export const REGIME_DISPLAY: Record<SeoRegime, { nome: string; slug: string; descricao: string }> = {
  simples:          { nome: "Simples Nacional",   slug: "simples-nacional",  descricao: "Regime simplificado para micro e pequenas empresas" },
  lucro_presumido:  { nome: "Lucro Presumido",    slug: "lucro-presumido",   descricao: "Regime com base de calculo presumida" },
  lucro_real:       { nome: "Lucro Real",          slug: "lucro-real",        descricao: "Regime com apuracao pelo lucro efetivo" },
}

export const REGIME_SLUG_TO_KEY: Record<string, SeoRegime> = {
  "simples-nacional": "simples",
  "lucro-presumido": "lucro_presumido",
  "lucro-real": "lucro_real",
}

// ---------------------------------------------------------------------------
// Brazilian states (27 UFs)
// ---------------------------------------------------------------------------

export const UF_DISPLAY: Record<string, { nome: string; em: string }> = {
  AC: { nome: "Acre",                em: "no Acre" },
  AL: { nome: "Alagoas",             em: "em Alagoas" },
  AM: { nome: "Amazonas",            em: "no Amazonas" },
  AP: { nome: "Amapa",               em: "no Amapa" },
  BA: { nome: "Bahia",               em: "na Bahia" },
  CE: { nome: "Ceara",               em: "no Ceara" },
  DF: { nome: "Distrito Federal",    em: "no Distrito Federal" },
  ES: { nome: "Espirito Santo",      em: "no Espirito Santo" },
  GO: { nome: "Goias",               em: "em Goias" },
  MA: { nome: "Maranhao",            em: "no Maranhao" },
  MG: { nome: "Minas Gerais",        em: "em Minas Gerais" },
  MS: { nome: "Mato Grosso do Sul",  em: "no Mato Grosso do Sul" },
  MT: { nome: "Mato Grosso",         em: "no Mato Grosso" },
  PA: { nome: "Para",                em: "no Para" },
  PB: { nome: "Paraiba",             em: "na Paraiba" },
  PE: { nome: "Pernambuco",          em: "em Pernambuco" },
  PI: { nome: "Piaui",               em: "no Piaui" },
  PR: { nome: "Parana",              em: "no Parana" },
  RJ: { nome: "Rio de Janeiro",      em: "no Rio de Janeiro" },
  RN: { nome: "Rio Grande do Norte", em: "no Rio Grande do Norte" },
  RO: { nome: "Rondonia",            em: "em Rondonia" },
  RR: { nome: "Roraima",             em: "em Roraima" },
  RS: { nome: "Rio Grande do Sul",   em: "no Rio Grande do Sul" },
  SC: { nome: "Santa Catarina",      em: "em Santa Catarina" },
  SE: { nome: "Sergipe",             em: "em Sergipe" },
  SP: { nome: "Sao Paulo",           em: "em Sao Paulo" },
  TO: { nome: "Tocantins",           em: "no Tocantins" },
}

export const ALL_UFS = Object.keys(UF_DISPLAY) as string[]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isValidSetor(s: string): s is SeoSetor {
  return (SEO_SETORES as readonly string[]).includes(s)
}

export function isValidUf(uf: string): boolean {
  return uf.toUpperCase() in UF_DISPLAY
}

export function isValidRegimeSlug(slug: string): boolean {
  return slug in REGIME_SLUG_TO_KEY
}
