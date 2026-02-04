export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length: number
  architecture: {
    modality: string
    input_modalities?: string[]
    output_modalities?: string[]
  }
  pricing: {
    prompt: string
    completion: string
  }
  top_provider?: {
    context_length: number
    max_completion_tokens?: number
    is_moderated?: boolean
  }
}

export interface CuratedModel {
  id: string
  name: string
  provider: string
  description: string
  category: ModelCategory
  contextLength: number
  costPer1kTokens: number // Combined prompt + completion cost
}

export type ModelCategory =
  | "recommended"
  | "cheapest"
  | "smartest"
  | "fastest"
  | "open-source"
  | "long-context"

interface ModelsCache {
  models: CuratedModel[]
  timestamp: number
}

const CACHE_TTL = 1000 * 60 * 60 // 1 hour
let modelsCache: ModelsCache | null = null

// Provider extraction from model ID
function extractProvider(modelId: string): string {
  const providerMap: Record<string, string> = {
    anthropic: "Anthropic",
    openai: "OpenAI",
    google: "Google",
    "meta-llama": "Meta",
    mistralai: "Mistral",
    qwen: "Qwen",
    deepseek: "DeepSeek",
    cohere: "Cohere",
    "x-ai": "xAI",
    perplexity: "Perplexity",
    "moonshot-ai": "Kimi",
    "01-ai": "Yi",
  }

  const prefix = modelId.split("/")[0]
  return providerMap[prefix] || prefix.charAt(0).toUpperCase() + prefix.slice(1)
}

// Check if model is open source based on provider/name
function isOpenSource(model: OpenRouterModel): boolean {
  const openSourceProviders = [
    "meta-llama",
    "qwen",
    "deepseek",
    "mistralai",
    "01-ai",
  ]
  const provider = model.id.split("/")[0]
  return openSourceProviders.includes(provider)
}

// Calculate cost per 1k tokens (prompt + completion average)
function calculateCost(pricing: { prompt: string; completion: string }): number {
  const promptCost = parseFloat(pricing.prompt) || 0
  const completionCost = parseFloat(pricing.completion) || 0
  // Cost per token * 1000
  return (promptCost + completionCost) * 1000
}

// Filter for chat-capable models
function isChatModel(model: OpenRouterModel): boolean {
  const modality = model.architecture?.modality || ""
  return modality.includes("text") && modality.includes("->text")
}

// Known flagship/smart models
const FLAGSHIP_MODELS = [
  "anthropic/claude-opus-4",
  "anthropic/claude-sonnet-4",
  "openai/gpt-4o",
  "openai/o1",
  "openai/o3-mini",
  "google/gemini-2.0-flash",
  "google/gemini-2.5-pro-preview",
  "deepseek/deepseek-r1",
  "x-ai/grok-2",
]

// Known fast models (optimized for speed)
const FAST_MODELS = [
  "anthropic/claude-3-haiku",
  "anthropic/claude-3.5-haiku",
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash",
  "mistralai/mistral-small",
  "deepseek/deepseek-chat",
]

export async function fetchOpenRouterModels(): Promise<OpenRouterModel[]> {
  const response = await fetch("https://openrouter.ai/api/v1/models", {
    headers: {
      "Content-Type": "application/json",
    },
    next: { revalidate: 3600 }, // Cache for 1 hour in Next.js
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`)
  }

  const data = await response.json()
  return data.data as OpenRouterModel[]
}

export async function getCuratedModels(): Promise<CuratedModel[]> {
  // Check cache
  if (modelsCache && Date.now() - modelsCache.timestamp < CACHE_TTL) {
    return modelsCache.models
  }

  const allModels = await fetchOpenRouterModels()

  // Filter to chat-capable models with valid pricing
  const chatModels = allModels.filter(
    (m) =>
      isChatModel(m) &&
      m.pricing?.prompt &&
      m.pricing?.completion &&
      parseFloat(m.pricing.prompt) > 0
  )

  const curated: CuratedModel[] = []
  const addedIds = new Set<string>()

  const addModel = (
    model: OpenRouterModel,
    category: ModelCategory,
    customDescription?: string
  ) => {
    if (addedIds.has(model.id)) return
    addedIds.add(model.id)

    curated.push({
      id: model.id,
      name: model.name.replace(/^[^:]+:\s*/, ""), // Remove provider prefix
      provider: extractProvider(model.id),
      description: customDescription || model.description || "",
      category,
      contextLength: model.context_length,
      costPer1kTokens: calculateCost(model.pricing),
    })
  }

  // 1. Recommended: Top flagship models from major providers
  const recommendedIds = [
    "anthropic/claude-sonnet-4",
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o",
  ]
  for (const id of recommendedIds) {
    const model = chatModels.find((m) => m.id === id)
    if (model) addModel(model, "recommended", "Recomendado para uso geral")
  }

  // 2. Smartest: Flagship reasoning models
  for (const id of FLAGSHIP_MODELS) {
    const model = chatModels.find((m) => m.id === id)
    if (model && !addedIds.has(model.id)) {
      addModel(model, "smartest", "Alta capacidade de raciocinio")
    }
  }

  // 3. Fastest: Speed-optimized models
  for (const id of FAST_MODELS) {
    const model = chatModels.find((m) => m.id === id)
    if (model && !addedIds.has(model.id)) {
      addModel(model, "fastest", "Otimizado para velocidade")
    }
  }

  // 4. Cheapest: Sort by cost and get top 3
  const sortedByCost = [...chatModels]
    .filter((m) => !addedIds.has(m.id))
    .sort((a, b) => calculateCost(a.pricing) - calculateCost(b.pricing))
    .slice(0, 3)

  for (const model of sortedByCost) {
    addModel(model, "cheapest", "Mais economico")
  }

  // 5. Open Source: Best open source models
  const openSourceModels = chatModels
    .filter((m) => isOpenSource(m) && !addedIds.has(m.id))
    .sort((a, b) => b.context_length - a.context_length)
    .slice(0, 3)

  for (const model of openSourceModels) {
    addModel(model, "open-source", "Codigo aberto")
  }

  // 6. Long Context: Models with largest context windows
  const longContextModels = chatModels
    .filter((m) => m.context_length >= 100000 && !addedIds.has(m.id))
    .sort((a, b) => b.context_length - a.context_length)
    .slice(0, 2)

  for (const model of longContextModels) {
    addModel(
      model,
      "long-context",
      `Contexto de ${Math.round(model.context_length / 1000)}k tokens`
    )
  }

  // Cache the results
  modelsCache = {
    models: curated.slice(0, 15), // Limit to 15 models
    timestamp: Date.now(),
  }

  return modelsCache.models
}

export function isValidModel(modelId: string): boolean {
  // Allow any model ID that follows the provider/model format
  return /^[\w-]+\/[\w.-]+$/.test(modelId)
}

export const DEFAULT_MODEL = "anthropic/claude-sonnet-4"
