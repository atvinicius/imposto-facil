import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface DudaAvatarProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-16 w-16 text-2xl",
}

export function DudaAvatar({ size = "sm", className }: DudaAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
        D
      </AvatarFallback>
    </Avatar>
  )
}
