"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { StepIndicator } from "@/components/onboarding/step-indicator"
import { saveOnboardingStep, completeOnboarding, skipOnboarding, type OnboardingData } from "./actions"
import {
  NIVEL_EXPERIENCIA_OPTIONS,
  UF_OPTIONS,
  SETOR_OPTIONS,
  PORTE_EMPRESA_OPTIONS,
  REGIME_TRIBUTARIO_OPTIONS,
  INTERESSES_OPTIONS,
} from "./constants"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
  { title: "Sobre Você", description: "Nome e experiência" },
  { title: "Sua Empresa", description: "Localização e setor" },
  { title: "Regime Tributário", description: "Classificação fiscal" },
  { title: "Interesses", description: "Temas da reforma" },
]

interface OnboardingWizardProps {
  initialData?: Partial<OnboardingData>
}

export function OnboardingWizard({ initialData }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<OnboardingData>({
    nome: initialData?.nome || "",
    nivel_experiencia: initialData?.nivel_experiencia || "",
    uf: initialData?.uf || "",
    setor: initialData?.setor || "",
    porte_empresa: initialData?.porte_empresa || "",
    regime_tributario: initialData?.regime_tributario || "",
    interesses: initialData?.interesses || [],
  })

  const updateField = <K extends keyof OnboardingData>(field: K, value: OnboardingData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleInteresse = (interesse: string) => {
    const current = formData.interesses || []
    const updated = current.includes(interesse)
      ? current.filter((i) => i !== interesse)
      : [...current, interesse]
    updateField("interesses", updated)
  }

  const handleNext = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await saveOnboardingStep(formData)
      if (result.error) {
        setError(result.error)
        return
      }
      setCurrentStep((prev) => prev + 1)
    } catch (err) {
      console.error("Error saving step:", err)
      setError("Erro ao salvar. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1)
    setError(null)
  }

  const handleComplete = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await completeOnboarding(formData)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      // If no error, redirect on client side
      router.push("/dashboard")
    } catch (err) {
      console.error("Error completing onboarding:", err)
      setError("Erro ao finalizar. Tente novamente.")
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await skipOnboarding()
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      // If no error, redirect on client side
      router.push("/dashboard")
    } catch (err) {
      console.error("Error skipping onboarding:", err)
      setError("Erro ao pular. Tente novamente.")
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <StepIndicator steps={STEPS} currentStep={currentStep} />

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Conte-nos um pouco sobre você para personalizarmos sua experiência."}
            {currentStep === 1 && "Informações sobre sua empresa nos ajudam a contextualizar as respostas."}
            {currentStep === 2 && "Seu regime tributário atual influencia como a reforma te afetará."}
            {currentStep === 3 && "Selecione os temas que mais te interessam sobre a reforma tributária."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          {currentStep === 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="nome">Como podemos te chamar?</Label>
                <Input
                  id="nome"
                  placeholder="Seu nome"
                  value={formData.nome || ""}
                  onChange={(e) => updateField("nome", e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <Label>Qual seu nível de experiência com tributação?</Label>
                <div className="grid gap-3">
                  {NIVEL_EXPERIENCIA_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => updateField("nivel_experiencia", option.value)}
                      className={cn(
                        "flex flex-col p-4 border rounded-lg cursor-pointer transition-colors",
                        formData.nivel_experiencia === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="uf">Em qual estado sua empresa está localizada?</Label>
                <Select
                  value={formData.uf || ""}
                  onValueChange={(value) => updateField("uf", value)}
                >
                  <SelectTrigger id="uf">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {UF_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setor">Qual o setor de atuação?</Label>
                <Select
                  value={formData.setor || ""}
                  onValueChange={(value) => updateField("setor", value)}
                >
                  <SelectTrigger id="setor">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {SETOR_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Qual o porte da empresa?</Label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PORTE_EMPRESA_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      onClick={() => updateField("porte_empresa", option.value)}
                      className={cn(
                        "flex flex-col p-4 border rounded-lg cursor-pointer transition-colors",
                        formData.porte_empresa === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <Label>Qual o regime tributário atual da sua empresa?</Label>
              <div className="grid gap-3">
                {REGIME_TRIBUTARIO_OPTIONS.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => updateField("regime_tributario", option.value)}
                    className={cn(
                      "flex flex-col p-4 border rounded-lg cursor-pointer transition-colors",
                      formData.regime_tributario === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-muted-foreground">{option.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3">
              <Label>Quais temas da reforma tributária mais te interessam?</Label>
              <p className="text-sm text-muted-foreground">Selecione todos que se aplicam</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {INTERESSES_OPTIONS.map((option) => {
                  const isChecked = (formData.interesses || []).includes(option.value)
                  return (
                    <div
                      key={option.value}
                      onClick={() => toggleInteresse(option.value)}
                      className={cn(
                        "flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors",
                        isChecked
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Checkbox
                        checked={isChecked}
                        className="mt-0.5"
                        onCheckedChange={() => toggleInteresse(option.value)}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{option.label}</span>
                        <span className="text-sm text-muted-foreground">{option.description}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          {currentStep > 0 ? (
            <Button variant="ghost" onClick={handleBack} disabled={isLoading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          ) : (
            <Button variant="ghost" onClick={handleSkip} disabled={isLoading}>
              Pular configuração
            </Button>
          )}
        </div>
        <div>
          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Começar a usar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
