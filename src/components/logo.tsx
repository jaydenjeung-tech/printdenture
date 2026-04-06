// components/logo.tsx
import React from "react"

type Props = {
  size?: number
}

export default function PrintCrownLogo({ size = 36 }: Props) {
  const width = Math.round(size * (220 / 56))

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 220 56"
      fill="none"
      height={size}
      width={width}
    >
      <rect x="2" y="2" width="52" height="52" rx="14" fill="#2563EB" />
      <circle cx="28" cy="28" r="18" fill="white" />
      <path
        d="M20 41 L20 38 Q20 33 22 28 Q21 24 21 20 Q21 15 24 12 Q26 10 28 10 Q30 10 32 12 Q35 15 35 20 Q35 24 34 28 Q36 33 36 38 L36 41 Q33 44 28 44 Q23 44 20 41 Z"
        fill="#2563EB"
      />
      <line x1="20" y1="38" x2="36" y2="38" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" />
      <line x1="24" y1="10" x2="32" y2="10" stroke="white" strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
      <text
        x="66"
        y="36"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="26"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="#1A1A1A"
      >
        Print<tspan fill="#2563EB">Crown</tspan>
      </text>
    </svg>
  )
}