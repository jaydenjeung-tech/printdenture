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
  const innerGrad = `pd-inner-${uid}`;

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
        <linearGradient id={bgGrad} x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3EE0A8" />
          <stop offset="0.45" stopColor="#1D9E75" />
          <stop offset="1" stopColor="#0B5C47" />
        </linearGradient>
        <linearGradient id={shineGrad} x1="24" y1="4" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0.28" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={innerGrad} x1="18" y1="14" x2="34" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#E8FFF6" />
          <stop offset="1" stopColor="#B8F0DC" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${bgGrad})`} />
      <rect x="2" y="2" width="44" height="22" rx="13" fill={`url(#${shineGrad})`} />

      <path
        d="M17 13.5V34.5"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path
        d="M17 13.5H25.2C30.4 13.5 33.8 16.6 33.8 21.2C33.8 25.8 30.4 28.9 25.2 28.9H17"
        stroke="white"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <path
        d="M21.2 18.8H27.6C29.4 18.8 30.6 19.8 30.6 21.4C30.6 23 29.4 24 27.6 24H21.2"
        stroke={`url(#${innerGrad})`}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M21.4 21.6H26.8"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.42"
      />
      <path
        d="M21.4 24.2H25.6"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.3"
      />

      <circle cx="35.2" cy="12.8" r="1.35" fill="white" fillOpacity="0.92" />
      <circle cx="35.2" cy="12.8" r="2.6" fill="white" fillOpacity="0.14" />
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
