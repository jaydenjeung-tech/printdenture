"use client";

import Image from "next/image";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["500", "800"],
  display: "block",
  preload: true,
  adjustFontFallback: false,
});

export type LogoVariant = "dark" | "light";
export type LogoSize = "sm" | "md" | "lg";

const LOCKUP_SRC: Record<LogoVariant, string> = {
  light: "/images/brand/printdenture-lockup-light.png",
  dark: "/images/brand/printdenture-lockup-dark.png",
};

const LOCKUP_WIDTH = 898;
const LOCKUP_HEIGHT = 200;
const MARK_SRC = "/images/brand/printdenture-mark.png";
const MARK_WIDTH = 183;
const MARK_HEIGHT = 199;

const MARK_SIZES: Record<LogoSize, number> = {
  sm: 24,
  md: 40,
  lg: 48,
};

const LOCKUP_HEIGHTS: Record<LogoSize, number> = {
  sm: 24,
  md: 40,
  lg: 48,
};

const WORDMARK_SIZES: Record<LogoSize, string> = {
  sm: "text-[15px]",
  md: "text-[18px]",
  lg: "text-[22px] lg:text-[24px]",
};

const COLORS: Record<LogoVariant, { print: string; denture: string }> = {
  dark: { print: "#FFFFFF", denture: "#2AD4B2" },
  light: { print: "#05264A", denture: "#12C4A4" },
};

type MarkProps = {
  size?: number;
  className?: string;
};

export function PrintDentureMark({ size = 32, className }: MarkProps) {
  return (
    <Image
      src={MARK_SRC}
      alt=""
      width={MARK_WIDTH}
      height={MARK_HEIGHT}
      className={`logo-lockup block shrink-0 select-none w-auto ${className ?? ""}`}
      style={{ height: size, width: "auto" }}
    />
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
  const colors = COLORS[variant];

  return (
    <span
      className={`${outfit.className} tracking-[-0.06em] leading-none select-none inline-flex items-center logo-wordmark ${sizeClass} ${className ?? ""}`}
      style={fontSize}
    >
      <span style={{ color: colors.print, fontWeight: 500 }}>Print</span>
      <span style={{ color: colors.denture, fontWeight: 800 }}>Denture</span>
    </span>
  );
}

function PrintDentureLockup({ variant = "light", size = "md", className }: {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
}) {
  const height = LOCKUP_HEIGHTS[size];

  return (
    <Image
      src={LOCKUP_SRC[variant]}
      alt="PrintDenture"
      width={LOCKUP_WIDTH}
      height={LOCKUP_HEIGHT}
      priority
      className={`logo-lockup block shrink-0 select-none w-auto max-w-none ${className ?? ""}`}
      style={{ height, width: "auto" }}
    />
  );
}

type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize | number;
  showWordmark?: boolean;
  className?: string;
};

export default function PrintDentureLogo({
  variant = "light",
  size = "md",
  showWordmark = true,
  className,
}: LogoProps) {
  if (showWordmark && typeof size !== "number") {
    return <PrintDentureLockup variant={variant} size={size} className={className} />;
  }

  const markSize = typeof size === "number" ? size : MARK_SIZES[size];

  return (
    <div className={`shrink-0 min-w-0 ${className ?? ""}`}>
      <PrintDentureMark size={markSize} className={className} />
      {showWordmark && typeof size === "number" && (
        <PrintDentureWordmark variant={variant} size={size} />
      )}
    </div>
  );
}
