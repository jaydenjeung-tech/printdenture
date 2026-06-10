"use client";

import { useId } from "react";

export type LogoVariant = "dark" | "light";
export type LogoSize = "sm" | "md" | "lg";

const MARK_SIZES: Record<LogoSize, number> = {
  sm: 28,
  md: 32,
  lg: 40,
};

const WORDMARK_SIZES: Record<LogoSize, string> = {
  sm: "text-[14px]",
  md: "text-[16px] lg:text-[17px]",
  lg: "text-[20px]",
};

type MarkProps = {
  size?: number;
  className?: string;
};

export function PrintDentureMark({ size = 32, className }: MarkProps) {
  const uid = useId().replace(/:/g, "");
  const bgGrad = `pd-bg-${uid}`;
  const shineGrad = `pd-shine-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={bgGrad} x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#26B88A" />
          <stop offset="0.55" stopColor="#1D9E75" />
          <stop offset="1" stopColor="#0F6E56" />
        </linearGradient>
        <linearGradient id={shineGrad} x1="24" y1="4" x2="24" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0.24" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${bgGrad})`} />
      <rect x="2" y="2" width="44" height="24" rx="12" fill={`url(#${shineGrad})`} />

      <path
        d="M24 12C19 12 16.5 15.5 16.5 19.5C16.5 22.8 17.8 25.2 19.8 26.8L17.8 35.2C17.4 37 18.8 38.5 20.8 38.5H27.2C29.2 38.5 30.6 37 30.2 35.2L28.2 26.8C30.2 25.2 31.5 22.8 31.5 19.5C31.5 15.5 29 12 24 12Z"
        fill="white"
        fillOpacity="0.96"
      />

      <path
        d="M20.5 15.5Q24 13.2 27.5 15.5"
        stroke="#0F6E56"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
        opacity="0.28"
      />

      <line x1="18" y1="22" x2="30" y2="22" stroke="#0F6E56" strokeWidth="1.35" strokeLinecap="round" opacity="0.38" />
      <line x1="18.5" y1="27" x2="29.5" y2="27" stroke="#0F6E56" strokeWidth="1.35" strokeLinecap="round" opacity="0.32" />
      <line x1="19" y1="32" x2="29" y2="32" stroke="#0F6E56" strokeWidth="1.35" strokeLinecap="round" opacity="0.26" />

      <path d="M18 35.5H30" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.45" />

      <circle cx="36.5" cy="11.5" r="2.2" fill="white" fillOpacity="0.18" />
      <circle cx="36.5" cy="11.5" r="1" fill="white" fillOpacity="0.85" />
    </svg>
  );
}

type WordmarkProps = {
  variant?: LogoVariant;
  size?: LogoSize | number;
  className?: string;
};

export function PrintDentureWordmark({ variant = "dark", size = "md", className }: WordmarkProps) {
  const sizeClass = typeof size === "number" ? "" : WORDMARK_SIZES[size];
  const fontSize = typeof size === "number" ? { fontSize: size } : undefined;
  const printColor = variant === "dark" ? "text-white" : "text-[#1A1A1A]";
  const dentureColor = variant === "dark" ? "text-[#5DCAA5]" : "text-[#0F6E56]";

  return (
    <span
      className={`font-semibold tracking-[-0.02em] leading-none ${sizeClass} ${className ?? ""}`}
      style={fontSize}
    >
      <span className={printColor}>Print</span>
      <span className={dentureColor}>Denture</span>
    </span>
  );
}

type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize | number;
  showWordmark?: boolean;
  className?: string;
};

export default function PrintDentureLogo({
  variant = "dark",
  size = "md",
  showWordmark = true,
  className,
}: LogoProps) {
  const markSize = typeof size === "number" ? size : MARK_SIZES[size];

  return (
    <div className={`flex items-center gap-2.5 shrink-0 min-w-0 ${className ?? ""}`}>
      <PrintDentureMark size={markSize} />
      {showWordmark && <PrintDentureWordmark variant={variant} size={size} />}
    </div>
  );
}
