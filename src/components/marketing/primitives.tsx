import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionEyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal)] mb-4",
        className
      )}
    >
      {children}
    </p>
  );
}

export function SectionTitle({
  children,
  className,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-[-0.03em] leading-[1.1] text-[var(--pd-navy)]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function SectionLead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[17px] leading-relaxed text-[var(--pd-slate)] max-w-2xl", className)}>
      {children}
    </p>
  );
}

export function GridLine({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[var(--pd-border)]", className)} aria-hidden />;
}

export function VerticalLine({ className }: { className?: string }) {
  return <div className={cn("w-px bg-[var(--pd-border)]", className)} aria-hidden />;
}

type CtaProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function CtaLink({ href, children, variant = "primary", className }: CtaProps) {
  const base =
    "inline-flex items-center justify-center h-11 px-6 text-[14px] font-medium transition-colors";
  const variants = {
    primary: "bg-[var(--pd-teal)] text-white hover:bg-[var(--pd-teal-dark)]",
    secondary:
      "border border-[var(--pd-navy)] text-[var(--pd-navy)] hover:bg-[var(--pd-navy)] hover:text-white",
    ghost: "text-[var(--pd-navy)] hover:text-[var(--pd-teal-dark)] px-0 h-auto",
  };

  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
    </Link>
  );
}

export function ImagePlaceholder({
  label,
  src,
  className,
  variant = "product",
}: {
  label: string;
  src?: string;
  className?: string;
  variant?: "product" | "clinical" | "hero";
}) {
  if (src) {
    const inset =
      variant === "hero" ? "inset-5 sm:inset-8" : variant === "clinical" ? "inset-3 sm:inset-4" : "inset-4 sm:inset-6";

    return (
      <div
        className={cn(
          "relative overflow-hidden border border-[var(--pd-border)] bg-white min-h-[180px]",
          className
        )}
      >
        <div className={cn("absolute", inset)}>
          <Image src={src} alt={label} fill className="object-contain object-center" sizes="50vw" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center border border-dashed border-[var(--pd-border-strong)] bg-[var(--pd-surface)] text-[var(--pd-muted)]",
        className
      )}
    >
      <span className="text-[12px] font-medium uppercase tracking-wider px-4 text-center">{label}</span>
    </div>
  );
}

export function TrustIcon({ type }: { type: string }) {
  const paths: Record<string, React.ReactNode> = {
    shield: (
      <path
        d="M12 2L4 5v6c0 5.25 3.4 10.15 8 11 4.6-.85 8-5.75 8-11V5l-8-3z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    ),
    academic: (
      <>
        <path d="M12 3L2 8l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M6 11v4c0 2 2.5 4 6 4s6-2 6-4v-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </>
    ),
    certificate: (
      <>
        <rect x="4" y="3" width="16" height="12" rx="0" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M8 17l4 3 4-3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </>
    ),
    lab: (
      <path
        d="M9 3h6M10 3v6.5L5.5 18A2.5 2.5 0 007.9 21.5h8.2a2.5 2.5 0 002.4-3.5L14 9.5V3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  };

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[var(--pd-teal)]">
      {paths[type] ?? paths.shield}
    </svg>
  );
}
