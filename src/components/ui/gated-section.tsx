"use client"

import { Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface GatedSectionProps {
  locked: boolean
  children: React.ReactNode
  ctaText?: string
  className?: string
}

export function GatedSection({
  locked,
  children,
  ctaText = "Desbloqueie o diagnóstico completo",
  className,
}: GatedSectionProps) {
  if (!locked) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={cn("relative", className)}>
      <div
        className="select-none"
        style={{ filter: "blur(5px)" }}
        aria-hidden="true"
      >
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-background/60 to-background/90 rounded-lg">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <div className="rounded-full bg-muted p-3">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">{ctaText}</p>
        </div>
      </div>
    </div>
  )
}
