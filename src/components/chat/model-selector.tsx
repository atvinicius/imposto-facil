"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Sparkles, Zap, DollarSign, Code2, Cpu } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CuratedModel, ModelCategory } from "@/lib/openrouter/models"
import { DEFAULT_MODEL } from "@/lib/openrouter/models"

interface ModelSelectorProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
}

const categoryConfig: Record<
  ModelCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  recommended: {
    label: "Recomendados",
    icon: <Sparkles className="h-3 w-3" />,
    color: "text-yellow-500",
  },
  smartest: {
    label: "Mais Inteligentes",
    icon: <Cpu className="h-3 w-3" />,
    color: "text-purple-500",
  },
  fastest: {
    label: "Mais Rapidos",
    icon: <Zap className="h-3 w-3" />,
    color: "text-blue-500",
  },
  cheapest: {
    label: "Mais Economicos",
    icon: <DollarSign className="h-3 w-3" />,
    color: "text-green-500",
  },
  "open-source": {
    label: "Codigo Aberto",
    icon: <Code2 className="h-3 w-3" />,
    color: "text-orange-500",
  },
  "long-context": {
    label: "Contexto Longo",
    icon: <Cpu className="h-3 w-3" />,
    color: "text-cyan-500",
  },
}

export function ModelSelector({
  value,
  onValueChange,
  disabled,
}: ModelSelectorProps) {
  const [models, setModels] = useState<CuratedModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/models")
        if (!response.ok) throw new Error("Failed to fetch models")
        const data = await response.json()
        setModels(data.models)
      } catch (err) {
        console.error("Error fetching models:", err)
        setError("Erro ao carregar modelos")
      } finally {
        setIsLoading(false)
      }
    }

    fetchModels()
  }, [])

  const selectedModel = models.find((m) => m.id === value)
  const displayName = selectedModel?.name || value.split("/").pop() || "Selecionar modelo"

  // Group models by category
  const groupedModels = models.reduce(
    (acc, model) => {
      if (!acc[model.category]) {
        acc[model.category] = []
      }
      acc[model.category].push(model)
      return acc
    },
    {} as Record<ModelCategory, CuratedModel[]>
  )

  // Order categories
  const categoryOrder: ModelCategory[] = [
    "recommended",
    "smartest",
    "fastest",
    "cheapest",
    "open-source",
    "long-context",
  ]

  if (error) {
    return (
      <div className="text-xs text-muted-foreground px-2 py-1">
        {error}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md border border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground transition-colors",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-1 focus:ring-ring"
        )}
      >
        {isLoading ? (
          <span className="text-muted-foreground">Carregando...</span>
        ) : (
          <>
            <span className="max-w-[150px] truncate">{displayName}</span>
            {selectedModel && (
              <span className="text-xs text-muted-foreground">
                {selectedModel.provider}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1 z-50 w-80 max-h-96 overflow-auto rounded-md border bg-popover p-1 shadow-md">
            {categoryOrder.map((category) => {
              const categoryModels = groupedModels[category]
              if (!categoryModels?.length) return null

              const config = categoryConfig[category]

              return (
                <div key={category} className="mb-2 last:mb-0">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium",
                      config.color
                    )}
                  >
                    {config.icon}
                    {config.label}
                  </div>
                  {categoryModels.map((model) => (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        onValueChange(model.id)
                        setIsOpen(false)
                      }}
                      className={cn(
                        "flex flex-col w-full text-left px-2 py-2 rounded-sm text-sm",
                        "hover:bg-accent hover:text-accent-foreground transition-colors",
                        value === model.id && "bg-accent"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.provider}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {model.description}
                      </span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export { DEFAULT_MODEL }
