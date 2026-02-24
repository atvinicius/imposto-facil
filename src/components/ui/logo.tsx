import Link from "next/link"

interface LogoProps {
  href?: string
  className?: string
}

function LogoSvg() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="logo-grad"
          x1="0"
          y1="0"
          x2="32"
          y2="32"
        >
          <stop stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logo-grad)" />
      <rect
        x="9"
        y="6"
        width="14"
        height="20"
        rx="2"
        fill="white"
        fillOpacity="0.9"
      />
      <path
        d="M13 16l2.5 2.5L19 14"
        stroke="#0d9488"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="12"
        y="9"
        width="8"
        height="1.5"
        rx="0.75"
        fill="#0d9488"
        fillOpacity="0.3"
      />
      <rect
        x="12"
        y="12"
        width="5"
        height="1.5"
        rx="0.75"
        fill="#0d9488"
        fillOpacity="0.3"
      />
    </svg>
  )
}

export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link href={href} className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoSvg />
      <span className="text-lg font-bold">ImpostoFácil</span>
    </Link>
  )
}
