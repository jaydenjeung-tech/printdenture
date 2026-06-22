import { cn } from "@/lib/utils";

export const ORDER_INPUT_CLASS =
  "w-full h-10 px-3 border border-[var(--pd-border)] bg-white text-[14px] text-[var(--pd-navy)] focus:outline-none focus:border-[var(--pd-teal)] placeholder:text-[var(--pd-muted)]/60";

export const ORDER_TEXTAREA_CLASS =
  "w-full px-3 py-2.5 border border-[var(--pd-border)] bg-white text-[var(--pd-navy)] text-[14px] resize-none focus:outline-none focus:border-[var(--pd-teal)] placeholder:text-[var(--pd-muted)]/60";

export const ORDER_LABEL_CLASS = "block text-[14px] font-medium text-[var(--pd-navy)] mb-1.5";

export const ORDER_CHIP_SELECTED =
  "bg-[var(--pd-navy)] text-white border-[var(--pd-navy)]";

export const ORDER_CHIP_DEFAULT =
  "bg-white text-[var(--pd-slate)] border-[var(--pd-border)] hover:border-[var(--pd-navy)]";

export const ORDER_BTN_PRIMARY =
  "inline-flex items-center justify-center h-11 px-6 bg-[var(--pd-teal)] text-white text-[14px] font-medium hover:bg-[var(--pd-teal-dark)] transition-colors disabled:opacity-40";

export const ORDER_BTN_NAVY =
  "inline-flex items-center justify-center h-11 px-6 bg-[var(--pd-navy)] text-white text-[14px] font-medium hover:bg-[var(--pd-navy-light)] transition-colors disabled:opacity-40";

export const ORDER_BTN_BACK =
  "inline-flex items-center justify-center h-11 px-6 border border-[var(--pd-border)] bg-white text-[var(--pd-slate)] text-[14px] font-medium hover:border-[var(--pd-navy)] hover:text-[var(--pd-navy)] transition-colors";

export function OrderStepHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-teal-dark)] mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.02em] mb-1">
        {title}
      </h2>
      {lead && <p className="text-[14px] text-[var(--pd-slate)] leading-relaxed">{lead}</p>}
    </div>
  );
}

export function OrderPageHeader() {
  return (
    <section className="border-b border-[var(--pd-border)] bg-white relative overflow-hidden">
      <div className="absolute inset-0 pd-grid-bg opacity-[0.04] text-[var(--pd-navy)]" aria-hidden />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 pt-28 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
          Provider portal
        </p>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
          New lab case
        </h1>
        <p className="text-[14px] text-[var(--pd-slate)] mt-2 max-w-2xl leading-relaxed">
          Partial, guards, and immediate cases go straight to scan upload. Complete and
          overdenture JB cases start with a starter kit from the shop.
        </p>
      </div>
    </section>
  );
}

export function OrderNoticeBanner({
  variant = "info",
  children,
  actions,
}: {
  variant?: "info" | "teal" | "amber";
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const styles = {
    info: "border-[#BFDBFE] bg-[#F0F9FF]",
    teal: "border-[#9FE1CB] bg-[#E1F5EE]",
    amber: "border-amber-200 bg-amber-50",
  };
  return (
    <div
      className={cn(
        "mb-6 border px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        styles[variant]
      )}
    >
      <div className="text-[14px] text-[var(--pd-navy)]">{children}</div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function chipClass(selected: boolean, extra?: string) {
  return cn(
    "px-4 h-9 text-[13px] border transition-colors",
    selected ? ORDER_CHIP_SELECTED : ORDER_CHIP_DEFAULT,
    extra
  );
}
