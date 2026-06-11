"use client";

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

const MARK_SIZES: Record<LogoSize, number> = {
  sm: 24,
  md: 48,
  lg: 52,
};

const WORDMARK_SIZES: Record<LogoSize, string> = {
  sm: "text-[15px]",
  md: "text-[18px]",
  lg: "text-[22px] lg:text-[24px]",
};

const COLORS: Record<LogoVariant, { print: string; denture: string; mark: string }> = {
  dark: { print: "#FFFFFF", denture: "#5DCAA5", mark: "#5DCAA5" },
  light: { print: "#1A1A1A", denture: "#0F6E56", mark: "#0F6E56" },
};

/** Single-SVG lockup — integer render sizes only (0.5× or 1× of viewBox). */
const LOCKUP_SPECS: Record<
  LogoSize,
  { viewW: number; viewH: number; height: number; fontSize: number; textX: number; textY: number }
> = {
  sm: { viewW: 176, viewH: 48, height: 24, fontSize: 18, textX: 40, textY: 32 },
  md: { viewW: 176, viewH: 48, height: 48, fontSize: 18, textX: 40, textY: 32 },
  lg: { viewW: 200, viewH: 52, height: 52, fontSize: 22, textX: 42, textY: 37 },
};

function lockupWidth(spec: (typeof LOCKUP_SPECS)[LogoSize]) {
  return Math.round(spec.height * (spec.viewW / spec.viewH));
}

function TrayMarkPaths({ stroke }: { stroke: string }) {
  return (
    <g transform="rotate(90 24 24)">
      <path
        d="M11.75 10.5V16.25C11.75 16.25 12 26.75 24 27.5C36 26.75 36.25 16.25 36.25 16.25V10.5"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 13.25V16.75C15.75 16.75 15.9 23.25 24 23.85C32.1 23.25 32.25 16.75 32.25 16.75V13.25"
        stroke={stroke}
        strokeWidth="2.15"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.38"
      />
      <path
        d="M24 27.5V35.25"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M19.75 35.75Q24 38.25 28.25 35.75"
        stroke={stroke}
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.88"
      />
    </g>
  );
}

type MarkProps = {
  size?: number;
  variant?: LogoVariant;
  className?: string;
};

/** Tray mark only — 48×48 viewBox, use integer display sizes (24, 48). */
export function PrintDentureMark({ size = 32, variant = "dark", className }: MarkProps) {
  const stroke = COLORS[variant].mark;

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
      <TrayMarkPaths stroke={stroke} />
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

function PrintDentureLockup({ variant = "dark", size = "md", className }: LockupProps) {
  const spec = LOCKUP_SPECS[size];
  const colors = COLORS[variant];
  const width = lockupWidth(spec);
  const tracking = `${-0.06 * spec.fontSize}px`;

  return (
    <svg
      width={width}
      height={spec.height}
      viewBox={`0 0 ${spec.viewW} ${spec.viewH}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      className={`logo-lockup block shrink-0 select-none ${className ?? ""}`}
      role="img"
      aria-label="PrintDenture"
    >
      <TrayMarkPaths stroke={colors.mark} />
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
