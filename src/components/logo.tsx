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

const LOCKUP_IMAGE_DARK = "/images/brand/printdenture-lockup-dark.png";

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

const COLORS: Record<LogoVariant, { print: string; denture: string; mark: string }> = {
  dark: { print: "#FFFFFF", denture: "#45C4A0", mark: "#45C4A0" },
  light: { print: "#1A1A1A", denture: "#0F6E56", mark: "#0F6E56" },
};

const LOCKUP_SPECS: Record<
  LogoSize,
  { viewW: number; viewH: number; fontSize: number; textX: number; textY: number }
> = {
  sm: { viewW: 176, viewH: 48, fontSize: 18, textX: 40, textY: 32 },
  md: { viewW: 176, viewH: 48, fontSize: 17, textX: 40, textY: 32 },
  lg: { viewW: 200, viewH: 52, fontSize: 22, textX: 42, textY: 37 },
};

function TrayMarkPaths({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.25 17.75C12.25 9.25 35.75 9.25 35.75 17.75" strokeWidth="3.6" />
      <path d="M24 17.75V22.75" strokeWidth="2.4" />
      <circle cx="24" cy="25.35" r="2.25" fill={color} stroke="none" />
      <path d="M15.25 31.25C18.25 35.25 29.75 35.25 32.75 31.25" strokeWidth="2.6" />
      <circle cx="24" cy="39.25" r="4.35" strokeWidth="2.6" />
    </g>
  );
}

type MarkProps = {
  size?: number;
  variant?: LogoVariant;
  className?: string;
};

export function PrintDentureMark({ size = 32, variant = "dark", className }: MarkProps) {
  const color = COLORS[variant].mark;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      className={`logo-lockup block shrink-0 ${className ?? ""}`}
      aria-hidden
    >
      <TrayMarkPaths color={color} />
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

type LockupProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
};

function PrintDentureLockupImage({ size = "md", className }: { size?: LogoSize; className?: string }) {
  const height = LOCKUP_HEIGHTS[size];

  return (
    <Image
      src={LOCKUP_IMAGE_DARK}
      alt="PrintDenture"
      width={382}
      height={100}
      priority
      className={`logo-lockup block shrink-0 select-none w-auto max-w-none ${className ?? ""}`}
      style={{ height, width: "auto" }}
    />
  );
}

function PrintDentureLockupSvg({ variant = "light", size = "md", className }: LockupProps) {
  const spec = LOCKUP_SPECS[size];
  const colors = COLORS[variant];
  const height = LOCKUP_HEIGHTS[size];
  const width = Math.round((height * spec.viewW) / spec.viewH);
  const tracking = `${-0.06 * spec.fontSize}px`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${spec.viewW} ${spec.viewH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      preserveAspectRatio="xMinYMid meet"
      className={`logo-lockup block shrink-0 select-none w-auto max-w-none ${className ?? ""}`}
      role="img"
      aria-label="PrintDenture"
    >
      <TrayMarkPaths color={colors.mark} />
      <text
        x={spec.textX}
        y={spec.textY}
        fontSize={spec.fontSize}
        letterSpacing={tracking}
        className={outfit.className}
        style={{ fontSynthesis: "none" }}
      >
        <tspan fill={colors.print} fontWeight="500">
          Print
        </tspan>
        <tspan fill={colors.denture} fontWeight="800">
          Denture
        </tspan>
      </text>
    </svg>
  );
}

function PrintDentureLockup({ variant = "dark", size = "md", className }: LockupProps) {
  if (variant === "dark") {
    return <PrintDentureLockupImage size={size} className={className} />;
  }
  return <PrintDentureLockupSvg variant={variant} size={size} className={className} />;
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
  if (showWordmark && typeof size !== "number") {
    return <PrintDentureLockup variant={variant} size={size} className={className} />;
  }

  const markSize = typeof size === "number" ? size : MARK_SIZES[size];

  return (
    <div className={`shrink-0 min-w-0 ${className ?? ""}`}>
      <PrintDentureMark size={markSize} variant={variant} />
      {showWordmark && typeof size === "number" && (
        <PrintDentureWordmark variant={variant} size={size} />
      )}
    </div>
  );
}
