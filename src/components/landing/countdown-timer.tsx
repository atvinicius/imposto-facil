"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
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

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000)
  return () => clearInterval(timer)
}

function getSnapshot(): TimeLeft {
  return calculateTimeLeft()
}

function getServerSnapshot(): TimeLeft {
  return { days: 0, hours: 0, minutes: 0, seconds: 0 }
}

interface CountdownTimerProps {
  compact?: boolean
}

export function CountdownTimer({ compact = false }: CountdownTimerProps) {
  const timeLeft = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsClient(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const timeUnits = [
    { value: timeLeft.days, label: "dias" },
    { value: timeLeft.hours, label: "horas" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "seg" },
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
          >
            {isClient ? String(value).padStart(2, "0") : "--"}
          </div>
          <div className={`${compact ? "text-xs" : "text-sm"} text-muted-foreground mt-1`}>
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
