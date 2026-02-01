"use client"

import { useEffect, useState } from "react"
import { TARGET_DATE } from "@/lib/landing-data"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(): TimeLeft {
  const difference = TARGET_DATE.getTime() - new Date().getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

interface CountdownTimerProps {
  compact?: boolean
}

export function CountdownTimer({ compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const timeUnits = [
    { value: timeLeft?.days ?? 0, label: "dias" },
    { value: timeLeft?.hours ?? 0, label: "horas" },
    { value: timeLeft?.minutes ?? 0, label: "min" },
    { value: timeLeft?.seconds ?? 0, label: "seg" },
  ]

  return (
    <div className={compact ? "flex gap-2" : "flex gap-4"}>
      {timeUnits.map(({ value, label }) => (
        <div key={label} className="text-center">
          <div
            className={`${
              compact
                ? "text-lg font-bold bg-primary/10 px-2 py-1 rounded"
                : "text-3xl md:text-4xl font-bold bg-primary/10 px-4 py-2 rounded-lg"
            }`}
            suppressHydrationWarning
          >
            {timeLeft ? String(value).padStart(2, "0") : "--"}
          </div>
          <div className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground mt-1`}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
