"use client";

import Link from "next/link";
import {
  JB_PROTOCOL_BOTH_SCENARIOS,
  JB_PROTOCOL_CHOOSER,
  JB_PROTOCOL_OPTIONS,
  JB_PROTOCOL_SKIP_JB,
  type JbProtocolId,
} from "@/lib/guides/jb-protocol-chooser";
import { cn } from "@/lib/utils";

type Variant = "full" | "compact" | "shop";

type Props = {
  variant?: Variant;
  activeFamily?: JbProtocolId;
  onSelectFamily?: (family: JbProtocolId) => void;
  className?: string;
};

export function JbProtocolChooser({
  variant = "full",
  activeFamily,
  onSelectFamily,
  className = "",
}: Props) {
  if (variant === "shop" || variant === "compact") {
    return (
      <JbProtocolChooserShop
        activeFamily={activeFamily}
        onSelectFamily={onSelectFamily}
        className={className}
        compact={variant === "compact"}
      />
    );
  }

  return (
    <JbProtocolChooserDefault
      activeFamily={activeFamily}
      onSelectFamily={onSelectFamily}
      className={className}
    />
  );
}

function JbProtocolChooserShop({
  activeFamily,
  onSelectFamily,
  className = "",
  compact = false,
}: {
  activeFamily?: JbProtocolId;
  onSelectFamily?: (family: JbProtocolId) => void;
  className?: string;
  compact?: boolean;
}) {
  function handleDecision(needsRadiPlus: boolean) {
    onSelectFamily?.(needsRadiPlus ? "jb_fork" : "jb_tray");
  }

  const bothScenarios = compact
    ? JB_PROTOCOL_BOTH_SCENARIOS.filter((s) =>
        ["digital-complete-tray-fork", "all-on-x-fork-primary"].includes(s.id)
      )
    : JB_PROTOCOL_BOTH_SCENARIOS;

  return (
    <div id={compact ? undefined : "protocol-chooser"} className={className}>
      <div className={cn("mb-6", !compact && "mb-8 pb-6 border-b border-[var(--pd-border)]")}>
        {!compact && (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
            {JB_PROTOCOL_CHOOSER.eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "font-semibold text-[var(--pd-navy)] tracking-[-0.02em]",
            compact ? "text-[15px]" : "text-[clamp(1.25rem,2.5vw,1.75rem)]"
          )}
        >
          {JB_PROTOCOL_CHOOSER.title}
        </h2>
        <p className={cn("text-[var(--pd-slate)] mt-1.5 leading-relaxed max-w-3xl", compact ? "text-[13px]" : "text-[14px]")}>
          {JB_PROTOCOL_CHOOSER.subtitle}
        </p>
      </div>

      <div className={cn("border border-[var(--pd-border)] bg-[var(--pd-surface)]", compact ? "p-3 mb-4" : "p-4 sm:p-5 mb-8")}>
        <p className={cn("font-medium text-[var(--pd-navy)]", compact ? "text-[13px]" : "text-[14px]")}>
          {JB_PROTOCOL_CHOOSER.decisionQuestion}
        </p>
        <div className="mt-3 flex flex-col sm:flex-row gap-px sm:gap-0 bg-[var(--pd-border)] sm:border sm:border-[var(--pd-border)] sm:bg-[var(--pd-border)]">
          <ShopDecisionButton
            label={JB_PROTOCOL_CHOOSER.decisionYes}
            active={activeFamily === "jb_fork"}
            onClick={onSelectFamily ? () => handleDecision(true) : undefined}
            href={onSelectFamily ? undefined : "/shop?family=jb_fork#protocol-chooser"}
          />
          <ShopDecisionButton
            label={JB_PROTOCOL_CHOOSER.decisionNo}
            active={activeFamily === "jb_tray"}
            onClick={onSelectFamily ? () => handleDecision(false) : undefined}
            href={onSelectFamily ? undefined : "/shop?family=jb_tray#protocol-chooser"}
          />
        </div>
      </div>

      <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)]", compact ? "mb-4" : "mb-10")}>
        {JB_PROTOCOL_OPTIONS.map((option) => {
          const highlighted = activeFamily === option.id;
          return (
            <div
              key={option.id}
              className={cn(
                "bg-white p-5 sm:p-6 flex flex-col",
                highlighted && "ring-1 ring-inset ring-[var(--pd-teal)]"
              )}
            >
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-0.5 self-stretch min-h-[3rem] shrink-0"
                  style={{ background: highlighted ? "var(--pd-teal)" : "var(--pd-border)" }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold text-[var(--pd-navy)]">{option.label}</p>
                    {highlighted && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 border border-[#9FE1CB] bg-[#E1F5EE] text-[var(--pd-teal-dark)]">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] text-[var(--pd-slate)] mt-1 leading-relaxed">{option.tagline}</p>
                </div>
              </div>

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
                Choose when
              </p>
              <ul className="space-y-1.5 mb-4">
                {option.chooseWhen.map((item) => (
                  <li key={item} className="flex gap-2 text-[13px] text-[var(--pd-slate)] leading-relaxed">
                    <span className="text-[var(--pd-teal)] shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>

              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
                Records include
              </p>
              <ul className="space-y-1.5 mb-4 flex-1">
                {option.recordsInclude.map((item) => (
                  <li key={item} className="flex gap-2 text-[13px] text-[var(--pd-slate)] leading-relaxed">
                    <span className="text-[var(--pd-navy)] shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href={option.guidePath}
                className="text-[13px] font-medium text-[var(--pd-teal-dark)] hover:underline pt-2 border-t border-[var(--pd-border)]"
              >
                Clinical guide →
              </Link>
            </div>
          );
        })}
      </div>

      <div className={compact ? "mb-4" : "mb-8"}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-3">
          {JB_PROTOCOL_CHOOSER.bothHelpTitle}
        </p>
        <div className="border border-[var(--pd-border)] divide-y divide-[var(--pd-border)]">
          {bothScenarios.map((scenario) => (
            <div key={scenario.id} className="p-4 sm:p-5 bg-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <p className="text-[14px] font-semibold text-[var(--pd-navy)]">{scenario.title}</p>
                <div className="flex flex-wrap gap-1">
                  {scenario.kitsNeeded.includes("jb_tray") && <KitBadge label="Tray" />}
                  {scenario.kitsNeeded.includes("jb_fork") && <KitBadge label="Fork" />}
                </div>
              </div>
              <p className="text-[13px] text-[var(--pd-slate)] leading-relaxed">{scenario.summary}</p>
              {scenario.steps && !compact && (
                <ol className="mt-3 space-y-1.5">
                  {scenario.steps.map((step, i) => (
                    <li key={step} className="flex gap-2 text-[13px] text-[var(--pd-slate)] leading-relaxed">
                      <span className="text-[var(--pd-teal-dark)] font-semibold shrink-0 w-4">{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}
              <p className="text-[12px] text-[var(--pd-muted)] mt-3 leading-relaxed">
                <span className="font-medium text-[var(--pd-navy)]">Best for: </span>
                {scenario.bestFor}
              </p>
              {scenario.note && (
                <p className="text-[12px] text-[var(--pd-muted)] mt-2 leading-relaxed border-l-2 border-[var(--pd-teal)] pl-3">
                  {scenario.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={cn("border border-dashed border-[var(--pd-border-strong)] bg-[var(--pd-surface)]", compact ? "p-3 mb-3" : "p-4 sm:p-5 mb-6")}>
        <p className="text-[13px] font-semibold text-[var(--pd-navy)]">{JB_PROTOCOL_SKIP_JB.label}</p>
        <ul className="mt-2 space-y-1">
          {JB_PROTOCOL_SKIP_JB.cases.map((item) => (
            <li key={item} className="text-[13px] text-[var(--pd-slate)] leading-relaxed">
              · {item}
            </li>
          ))}
        </ul>
      </div>

      <p className={cn("text-[var(--pd-slate)] leading-relaxed", compact ? "text-[12px]" : "text-[13px]")}>
        {JB_PROTOCOL_CHOOSER.notBothNote}
      </p>
      {compact ? (
        <Link
          href="/shop#protocol-chooser"
          className="inline-block mt-3 text-[13px] font-medium text-[var(--pd-teal-dark)] hover:underline"
        >
          Full protocol guide on Shop →
        </Link>
      ) : (
        <p className="text-[11px] text-[var(--pd-muted)] mt-3 leading-relaxed">{JB_PROTOCOL_CHOOSER.attribution}</p>
      )}
    </div>
  );
}

function JbProtocolChooserDefault({
  activeFamily,
  onSelectFamily,
  className = "",
}: {
  activeFamily?: JbProtocolId;
  onSelectFamily?: (family: JbProtocolId) => void;
  className?: string;
}) {
  return (
    <div className={cn("border border-[var(--pd-border)] bg-white", className)}>
      <div className="p-6 md:p-8">
        <JbProtocolChooserShop
          compact={false}
          activeFamily={activeFamily}
          onSelectFamily={onSelectFamily}
        />
      </div>
    </div>
  );
}

function KitBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 border border-[var(--pd-border)] bg-[var(--pd-surface)] text-[var(--pd-navy)]">
      {label}
    </span>
  );
}

function ShopDecisionButton({
  label,
  active,
  onClick,
  href,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
}) {
  const className = cn(
    "flex-1 inline-flex items-center justify-center h-10 px-4 text-[13px] font-medium transition-colors sm:border-0 border border-[var(--pd-border)]",
    active
      ? "bg-[var(--pd-navy)] text-white"
      : "bg-white text-[var(--pd-slate)] hover:text-[var(--pd-navy)] hover:bg-[var(--pd-surface)]"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {label}
    </button>
  );
}
