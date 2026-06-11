"use client";

export type LogoVariant = "dark" | "light";
export type LogoSize = "sm" | "md" | "lg";

/** Integer sizes aligned to the 48×48 viewBox for crisp SVG strokes. */
const MARK_SIZES: Record<LogoSize, number> = {
  sm: 32,
  md: 48,
  lg: 48,
};

const WORDMARK_SIZES: Record<LogoSize, string> = {
  sm: "text-[15px]",
  md: "text-[18px]",
  lg: "text-[22px] lg:text-[24px]",
};

const MARK_COLORS: Record<LogoVariant, string> = {
  dark: "#5DCAA5",
  light: "#0F6E56",
};

/** Tray arch nestles into wordmark — tight lockup like seating a JB Tray. */
const LOGO_LOCKUP: Record<
  LogoSize,
  { gap: string; markClass: string; wordmarkClass: string }
> = {
  sm: {
    gap: "gap-0",
    markClass: "-mr-1.5",
    wordmarkClass: "-ml-1 translate-y-px",
  },
  md: {
    gap: "gap-0",
    markClass: "-mr-3",
    wordmarkClass: "-ml-2 translate-y-[2px]",
  },
  lg: {
    gap: "gap-0",
    markClass: "-mr-3",
    wordmarkClass: "-ml-2 translate-y-[2px]",
  },
};

function resolveLockup(size: LogoSize | number, markSize: number) {
  if (typeof size !== "number") return LOGO_LOCKUP[size];
  if (markSize <= 32) return LOGO_LOCKUP.sm;
  return LOGO_LOCKUP[markSize <= 48 ? "md" : "lg"];
}

type MarkProps = {
  size?: number;
  variant?: LogoVariant;
  className?: string;
};

/**
 * PrintDenture mark — abstract JB Tray (Just Border) silhouette.
 * Outer rim + inner basin + anterior handle. Monoline, optical 48×48 grid.
 */
export function PrintDentureMark({ size = 32, variant = "dark", className }: MarkProps) {
  const stroke = MARK_COLORS[variant];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="geometricPrecision"
      className={`block shrink-0 ${className ?? ""}`}
      aria-hidden
    >
      {/* Horizontal — arch right, handle left (180° flip from prior orientation) */}
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
      className={`font-logo tracking-[-0.06em] leading-none select-none inline-flex items-center subpixel-antialiased ${sizeClass} ${className ?? ""}`}
      style={fontSize}
    >
      <span className={`${printColor} font-medium`}>Print</span>
      <span className={`${dentureColor} font-extrabold`}>Denture</span>
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
  const lockup = resolveLockup(size, markSize);

  return (
    <div
      className={`relative isolate flex items-center shrink-0 min-w-0 ${lockup.gap} ${className ?? ""}`}
    >
      <span className={`inline-flex shrink-0 items-center ${lockup.markClass}`}>
        <PrintDentureMark size={markSize} variant={variant} />
      </span>
      {showWordmark && (
        <PrintDentureWordmark
          variant={variant}
          size={size}
          className={lockup.wordmarkClass}
        />
      )}
    </div>
  );
}
