import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LAB_PARTNER } from "@/lib/marketing/copy";

export function LabPartnerLink({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<"a">, "href" | "target" | "rel"> & { children: ReactNode }) {
  return (
    <a
      href={LAB_PARTNER.website}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("hover:underline underline-offset-2 transition-colors", className)}
      {...props}
    >
      {children}
    </a>
  );
}

export function LabPartnerHeroLine({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "text-[14px] font-medium text-[#C5DCE8] mb-6 flex items-center gap-2 flex-wrap",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-white/20 bg-white/5 text-[12px] uppercase tracking-[0.08em]">
        <LabFlaskIcon className="text-[var(--pd-teal-light)]" />
        Lab partner
      </span>
      <LabPartnerLink className="text-[#C5DCE8] hover:text-white no-underline hover:underline">
        {LAB_PARTNER.name}
      </LabPartnerLink>
    </p>
  );
}

export function LabPartnerBadge({ className }: { className?: string }) {
  return (
    <LabPartnerLink
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 border border-[var(--pd-border)] bg-[var(--pd-surface)] text-[var(--pd-slate)] hover:text-[var(--pd-teal-dark)] no-underline hover:underline",
        className
      )}
    >
      <LabFlaskIcon className="text-[var(--pd-teal-dark)] w-3.5 h-3.5" />
      {LAB_PARTNER.name}
    </LabPartnerLink>
  );
}

export function LabPartnerNotice({
  variant = "default",
  className,
}: {
  variant?: "default" | "compact";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-[var(--pd-teal)]/25 bg-[#E8F5F0]/60",
        variant === "compact" ? "px-3 py-2.5" : "px-4 py-4 mb-6",
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--pd-teal-dark)] mb-1">
        Lab partner ·{" "}
        <LabPartnerLink className="text-[var(--pd-teal-dark)] hover:text-[var(--pd-navy)]">
          {LAB_PARTNER.name}
        </LabPartnerLink>
      </p>
      <p
        className={cn(
          "text-[var(--pd-slate)] leading-relaxed",
          variant === "compact" ? "text-[12px]" : "text-[13px]"
        )}
      >
        {variant === "compact" ? LAB_PARTNER.dashboardLine : LAB_PARTNER.orderNotice}
      </p>
    </div>
  );
}

export function LabPartnerHeaderTag({ light }: { light?: boolean }) {
  return (
    <LabPartnerLink
      className={cn(
        "hidden xl:inline-flex flex-col border-l pl-3 ml-1 shrink-0 leading-tight no-underline hover:underline",
        light ? "border-[var(--pd-border)]" : "border-white/20"
      )}
      aria-label={`${LAB_PARTNER.name} (opens in new tab)`}
    >
      <span
        className={cn(
          "text-[9px] font-semibold uppercase tracking-[0.12em]",
          light ? "text-[var(--pd-muted)]" : "text-[#8BB3C8]"
        )}
      >
        Lab partner
      </span>
      <span className={cn("text-[11px] font-medium", light ? "text-[var(--pd-navy)]" : "text-white/90")}>
        {LAB_PARTNER.name}
      </span>
    </LabPartnerLink>
  );
}

function LabFlaskIcon({ className }: { className?: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M9 3h6M10 3v6.5L5.5 18A2.5 2.5 0 007.9 21.5h8.2a2.5 2.5 0 002.4-3.5L14 9.5V3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
