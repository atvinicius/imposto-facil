interface CategoryConfig {
  label: string
  bgClass: string
  textClass: string
  borderClass: string
}

const categoryMap: Record<string, CategoryConfig> = {
  ibs: {
    label: "IBS",
    bgClass: "bg-blue-50 dark:bg-blue-950",
    textClass: "text-blue-700 dark:text-blue-300",
    borderClass: "border-blue-200 dark:border-blue-800",
  },
  cbs: {
    label: "CBS",
    bgClass: "bg-purple-50 dark:bg-purple-950",
    textClass: "text-purple-700 dark:text-purple-300",
    borderClass: "border-purple-200 dark:border-purple-800",
  },
  is: {
    label: "Imposto Seletivo",
    bgClass: "bg-amber-50 dark:bg-amber-950",
    textClass: "text-amber-700 dark:text-amber-300",
    borderClass: "border-amber-200 dark:border-amber-800",
  },
  transicao: {
    label: "Transição",
    bgClass: "bg-emerald-50 dark:bg-emerald-950",
    textClass: "text-emerald-700 dark:text-emerald-300",
    borderClass: "border-emerald-200 dark:border-emerald-800",
  },
  glossario: {
    label: "Glossário",
    bgClass: "bg-gray-50 dark:bg-gray-950",
    textClass: "text-gray-700 dark:text-gray-300",
    borderClass: "border-gray-200 dark:border-gray-800",
  },
}

const defaultConfig: CategoryConfig = {
  label: "Referência",
  bgClass: "bg-gray-50 dark:bg-gray-950",
  textClass: "text-gray-700 dark:text-gray-300",
  borderClass: "border-gray-200 dark:border-gray-800",
}

export function getCategoryConfig(category: string): CategoryConfig {
  return categoryMap[category] || defaultConfig
}
