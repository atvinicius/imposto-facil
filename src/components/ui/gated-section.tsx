"use client"

import Link from "next/link"
import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface GatedSectionProps {
  locked: boolean
  children: React.ReactNode
  ctaText?: string
  className?: string
  placeholderLines?: number
}

export function GatedSection({
  locked,
  children,
  ctaText = "Desbloqueie o diagnóstico completo",
  className,
  placeholderLines = 3,
}: GatedSectionProps) {
  if (!locked) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className="select-none pointer-events-none"
        aria-hidden="true"
      >
        <div className="space-y-3">
          {Array.from({ length: placeholderLines }).map((_, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
              <div
                className="h-4 bg-muted rounded animate-pulse"
                style={{ width: `${65 + ((i * 17) % 30)}%` }}
              />
            </div>
          ))}
        </div>
      </div>
      <Link
        href="/checkout"
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-background/60 to-background/90 rounded-lg cursor-pointer transition-opacity hover:opacity-90"
      >
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <div className="rounded-full bg-muted p-3">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">{ctaText}</p>
        </div>
      </Link>
    </div>
  )
}
