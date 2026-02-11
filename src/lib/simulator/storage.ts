import type { SimuladorInput, SimuladorResult, SimuladorTeaser, FaixaFaturamento } from "./types"

const STORAGE_KEY = "impostofacil_simulator_data"
const EXPIRY_HOURS = 24

export interface StoredSimulatorData {
  input: SimuladorInput
  result: SimuladorResult
  teaser: SimuladorTeaser
  timestamp: number
}

export function saveSimulatorData(
  input: SimuladorInput,
  result: SimuladorResult,
  teaser: SimuladorTeaser
): void {
  const data: StoredSimulatorData = {
    input,
    result,
    teaser,
    timestamp: Date.now(),
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function getStoredSimulatorData(): StoredSimulatorData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const data: StoredSimulatorData = JSON.parse(raw)

    // Check expiry
    const hoursElapsed = (Date.now() - data.timestamp) / (1000 * 60 * 60)
    if (hoursElapsed > EXPIRY_HOURS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }

    return data
  } catch {
    return null
  }
}

export function clearStoredSimulatorData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

const FATURAMENTO_TO_PORTE: Record<FaixaFaturamento, string> = {
  ate_81k: "MEI",
  "81k_360k": "ME",
  "360k_4.8m": "EPP",
  "4.8m_78m": "MEDIO",
  acima_78m: "GRANDE",
}

const REGIME_MAP: Record<string, string> = {
  simples: "Simples Nacional",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
  nao_sei: "",
}

export function simulatorInputToProfile(input: SimuladorInput): {
  uf: string
  setor: string
  porte_empresa: string
  regime_tributario: string
  faturamento: string
} {
  return {
    uf: input.uf,
    setor: input.setor,
    porte_empresa: FATURAMENTO_TO_PORTE[input.faturamento],
    regime_tributario: REGIME_MAP[input.regime] || "",
    faturamento: input.faturamento,
  }
}
