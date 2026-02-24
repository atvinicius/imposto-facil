import type { Tables } from "@/types/database"

interface ChecklistProgressData {
  completed: string[]
  updated_at: string | null
}

export interface ReadinessBreakdown {
  profile: number
  diagnosticViewed: number
  diagnosticPurchased: number
  checklistDone: number
}

export interface ReadinessResult {
  total: number
  breakdown: ReadinessBreakdown
  nextSteps: string[]
  label: string
}

const PROFILE_FIELDS: (keyof Tables<"user_profiles">)[] = [
  "nome",
  "uf",
  "setor",
  "regime_tributario",
  "porte_empresa",
]

const LABELS: { min: number; label: string }[] = [
  { min: 80, label: "Excelente" },
  { min: 60, label: "Bom" },
  { min: 40, label: "Moderado" },
  { min: 20, label: "Inicial" },
  { min: 0, label: "Crítico" },
]

export function calculateReadinessScore(
  profile: Tables<"user_profiles">,
  totalChecklistItems = 15
): ReadinessResult {
  // Profile completeness (40%): 8% each for 5 fields
  const filledFields = PROFILE_FIELDS.filter((f) => {
    const val = profile[f]
    return val !== null && val !== undefined && val !== ""
  }).length
  const profileScore = Math.round((filledFields / PROFILE_FIELDS.length) * 40)

  // Diagnostic viewed (20%): has simulator_result
  const diagnosticViewed = profile.simulator_result ? 20 : 0

  // Diagnostic purchased (20%): has diagnostico_purchased_at
  const diagnosticPurchased = profile.diagnostico_purchased_at ? 20 : 0

  // Checklist done (20%): % of completed items
  const progress = (profile.checklist_progress as ChecklistProgressData | null) ?? {
    completed: [],
    updated_at: null,
  }
  const checklistRatio =
    totalChecklistItems > 0
      ? Math.min(progress.completed.length / totalChecklistItems, 1)
      : 0
  const checklistDone = Math.round(checklistRatio * 20)

  const total = profileScore + diagnosticViewed + diagnosticPurchased + checklistDone

  // Generate next steps
  const nextSteps: string[] = []
  if (profileScore < 40) {
    const missing = PROFILE_FIELDS.filter((f) => !profile[f] || profile[f] === "")
    if (missing.length > 0) {
      nextSteps.push("Complete seu perfil com dados da empresa")
    }
  }
  if (!diagnosticViewed) {
    nextSteps.push("Gere seu diagnóstico tributário no simulador")
  }
  if (diagnosticViewed && !diagnosticPurchased) {
    nextSteps.push("Desbloqueie o diagnóstico completo por R$49")
  }
  if (diagnosticPurchased && checklistRatio < 1) {
    nextSteps.push("Complete as ações do checklist de adequação")
  }

  const label = LABELS.find((l) => total >= l.min)?.label ?? "Crítico"

  return {
    total,
    breakdown: {
      profile: profileScore,
      diagnosticViewed,
      diagnosticPurchased,
      checklistDone,
    },
    nextSteps,
    label,
  }
}
