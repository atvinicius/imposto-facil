"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { updateProfile } from "./actions"

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]

const SETOR_OPTIONS = [
  "Agricultura",
  "Comércio",
  "Construção",
  "Educação",
  "Indústria",
  "Saúde",
  "Serviços",
  "Tecnologia",
  "Transporte",
  "Outro",
]

const PORTE_OPTIONS = [
  { value: "MEI", label: "MEI (Microempreendedor Individual)" },
  { value: "ME", label: "ME (Microempresa)" },
  { value: "EPP", label: "EPP (Empresa de Pequeno Porte)" },
  { value: "MEDIO", label: "Médio Porte" },
  { value: "GRANDE", label: "Grande Porte" },
]

const NIVEL_EXPERIENCIA_OPTIONS = [
  { value: "iniciante", label: "Iniciante - Pouco conhecimento sobre tributação" },
  { value: "intermediario", label: "Intermediário - Entendo o básico de impostos" },
  { value: "avancado", label: "Avançado - Experiência profissional na área" },
]

const REGIME_TRIBUTARIO_OPTIONS = [
  { value: "simples", label: "Simples Nacional" },
  { value: "lucro_presumido", label: "Lucro Presumido" },
  { value: "lucro_real", label: "Lucro Real" },
  { value: "nao_sei", label: "Não sei" },
]

interface ProfileFormProps {
  initialData: {
    nome: string
    email: string
    uf: string
    setor: string
    porte_empresa: string
    nivel_experiencia: string
    regime_tributario: string
  }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setSuccess(false)
    setError(null)

    const result = await updateProfile(formData)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Dados básicos da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              name="nome"
              defaultValue={initialData.nome}
              placeholder="Seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={initialData.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              O email não pode ser alterado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nivel_experiencia">Nível de experiência com tributação</Label>
            <Select name="nivel_experiencia" defaultValue={initialData.nivel_experiencia}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu nivel" />
              </SelectTrigger>
              <SelectContent>
                {NIVEL_EXPERIENCIA_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
          <CardDescription>
            Esses dados ajudam a personalizar as orientações sobre a reforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="uf">Estado (UF)</Label>
            <Select name="uf" defaultValue={initialData.uf}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                {UF_OPTIONS.map((uf) => (
                  <SelectItem key={uf} value={uf}>
                    {uf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="setor">Setor de Atuação</Label>
            <Select name="setor" defaultValue={initialData.setor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {SETOR_OPTIONS.map((setor) => (
                  <SelectItem key={setor} value={setor}>
                    {setor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="porte_empresa">Porte da Empresa</Label>
            <Select name="porte_empresa" defaultValue={initialData.porte_empresa}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o porte" />
              </SelectTrigger>
              <SelectContent>
                {PORTE_OPTIONS.map((porte) => (
                  <SelectItem key={porte.value} value={porte.value}>
                    {porte.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regime_tributario">Regime Tributário</Label>
            <Select name="regime_tributario" defaultValue={initialData.regime_tributario}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o regime" />
              </SelectTrigger>
              <SelectContent>
                {REGIME_TRIBUTARIO_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 text-green-600 text-sm p-3 rounded-md">
          Perfil atualizado com sucesso!
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  )
}
