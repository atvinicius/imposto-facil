"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

export function GoogleAdsConversion() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("signup") === "1" && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: "AW-11085004679/ILAwCKCru_8bEIf_3qUp",
        value: 1.0,
        currency: "BRL",
      })
    }
  }, [searchParams])

  return null
}
