"use client";

import Link from "next/link";
import {
  JB_PROTOCOL_BOTH_SCENARIOS,
  JB_PROTOCOL_CHOOSER,
  JB_PROTOCOL_OPTIONS,
  JB_PROTOCOL_SKIP_JB,
  type JbProtocolId,
} from "@/lib/guides/jb-protocol-chooser";

type Variant = "full" | "compact" | "shop";

type Props = {
  variant?: Variant;
  /** Shop mode: highlight and scroll to the matching family tab */
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
  const isCompact = variant === "compact";
  const isShop = variant === "shop";

  function handleDecision(needsRadiPlus: boolean) {
    onSelectFamily?.(needsRadiPlus ? "jb_fork" : "jb_tray");
  }

  const innerPadding = isCompact ? "p-4" : isShop ? "" : "p-6 md:p-8";

  const bothScenarios = isCompact
    ? JB_PROTOCOL_BOTH_SCENARIOS.filter((s) =>
        ["digital-complete-tray-fork", "all-on-x-fork-primary"].includes(s.id)
      )
    : JB_PROTOCOL_BOTH_SCENARIOS;

  return (
    <div
      id={isShop ? "protocol-chooser" : undefined}
      className={`${isCompact ? "" : "rounded-2xl border border-[#E5E7EB] bg-white"} ${className}`}
    >
      <div className={innerPadding}>
        {!isCompact && (
          <div className="mb-6">
            <p className="text-[11px] font-medium text-[#0F6E56] uppercase tracking-[0.08em] mb-2">
              {JB_PROTOCOL_CHOOSER.eyebrow}
            </p>
            <h2
              className={`font-semibold text-[#1B2B3A] tracking-tight ${
                isShop ? "text-xl" : "text-[24px] md:text-[28px]"
              }`}
            >
              {JB_PROTOCOL_CHOOSER.title}
            </h2>
            <p className="text-[14px] text-[#6B7280] mt-2 leading-relaxed max-w-3xl">
              {JB_PROTOCOL_CHOOSER.subtitle}
            </p>
          </div>
        )}

        {isCompact && (
          <>
            <p className="text-sm font-semibold text-[#085041] mb-1">{JB_PROTOCOL_CHOOSER.title}</p>
            <p className="text-[13px] text-[#0F6E56] mb-4 leading-relaxed">
              {JB_PROTOCOL_CHOOSER.subtitle}
            </p>
          </>
        )}

        <div
          className={`rounded-xl border border-[#BFDBFE] bg-[#F0F9FF] ${
            isCompact ? "p-3 mb-4" : "p-4 md:p-5 mb-6"
          }`}
        >
          <p className={`font-semibold text-[#1B2B3A] ${isCompact ? "text-[13px]" : "text-sm"}`}>
            {JB_PROTOCOL_CHOOSER.decisionQuestion}
          </p>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <DecisionButton
              label={JB_PROTOCOL_CHOOSER.decisionYes}
              active={activeFamily === "jb_fork"}
              onClick={onSelectFamily ? () => handleDecision(true) : undefined}
              href={onSelectFamily ? undefined : "/shop?family=jb_fork#protocol-chooser"}
              compact={isCompact}
            />
            <DecisionButton
              label={JB_PROTOCOL_CHOOSER.decisionNo}
              active={activeFamily === "jb_tray"}
              onClick={onSelectFamily ? () => handleDecision(false) : undefined}
              href={onSelectFamily ? undefined : "/shop?family=jb_tray#protocol-chooser"}
              compact={isCompact}
            />
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isCompact ? "mb-4" : "mb-6"}`}>
          {JB_PROTOCOL_OPTIONS.map((option) => {
            const highlighted = isShop && activeFamily === option.id;
            return (
              <div
                key={option.id}
                className={`rounded-xl border p-4 md:p-5 transition-colors ${
                  highlighted
                    ? "border-[#0F6E56] bg-[#E1F5EE]/40 ring-2 ring-[#0F6E56]/15"
                    : "border-[#E5E7EB] bg-[#F7FAF9]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="text-[15px] font-semibold text-[#1B2B3A]">{option.label}</p>
                    <p className="text-[12px] text-[#6B7280] mt-0.5 leading-relaxed">{option.tagline}</p>
                  </div>
                  {highlighted && (
                    <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#0F6E56] text-white">
                      Selected
                    </span>
                  )}
                </div>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Choose when
                </p>
                <ul className="space-y-1 mb-4">
                  {option.chooseWhen.map((item) => (
                    <li key={item} className="flex gap-2 text-[12px] text-[#4B5563] leading-relaxed">
                      <span className="text-[#0F6E56] shrink-0">·</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9CA3AF] mb-1.5">
                  Records include
                </p>
                <ul className="space-y-1 mb-4">
                  {option.recordsInclude.map((item) => (
                    <li key={item} className="flex gap-2 text-[12px] text-[#4B5563] leading-relaxed">
                      <span className="text-[#378ADD] shrink-0">→</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href={option.guidePath}
                    className="text-[12px] font-medium text-[#0F6E56] hover:underline"
                  >
                    Clinical guide
                  </Link>
                  {!isShop && (
                    <Link
                      href={`/shop?family=${option.shopFamily}#protocol-chooser`}
                      className="text-[12px] font-medium text-[#378ADD] hover:underline"
                    >
                      Order kit
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={isCompact ? "mb-4" : "mb-6"}>
          <p
            className={`font-semibold text-[#1B2B3A] ${isCompact ? "text-[13px] mb-2" : "text-[15px] mb-3"}`}
          >
            {JB_PROTOCOL_CHOOSER.bothHelpTitle}
          </p>
          <div className="space-y-3">
            {bothScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className={`rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] ${
                  isCompact ? "p-3" : "p-4 md:p-5"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <p className={`font-semibold text-[#1B2B3A] ${isCompact ? "text-[13px]" : "text-sm"}`}>
                    {scenario.title}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {scenario.kitsNeeded.includes("jb_tray") && <KitBadge label="Tray" />}
                    {scenario.kitsNeeded.includes("jb_fork") && <KitBadge label="Fork" />}
                  </div>
                </div>
                <p className={`text-[#4B5563] leading-relaxed ${isCompact ? "text-[12px]" : "text-[13px]"}`}>
                  {scenario.summary}
                </p>
                {scenario.steps && !isCompact && (
                  <ol className="mt-2 space-y-1">
                    {scenario.steps.map((step, i) => (
                      <li
                        key={step}
                        className="flex gap-2 text-[12px] text-[#4B5563] leading-relaxed"
                      >
                        <span className="text-[#7C3AED] font-semibold shrink-0">{i + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                )}
                <p className={`text-[#6B7280] mt-2 leading-relaxed ${isCompact ? "text-[11px]" : "text-[12px]"}`}>
                  <span className="font-medium text-[#5B21B6]">Best for: </span>
                  {scenario.bestFor}
                </p>
                {scenario.note && (
                  <p
                    className={`text-[#78716C] mt-2 leading-relaxed border-l-2 border-[#C4B5FD] pl-3 ${
                      isCompact ? "text-[11px]" : "text-[12px]"
                    }`}
                  >
                    {scenario.note}
                  </p>
                )}
              </div>
            ))}
          </div>
          {isCompact && (
            <Link
              href="/shop#protocol-chooser"
              className="inline-block mt-2 text-[12px] font-medium text-[#0F6E56] hover:underline"
            >
              See all “both kits help” scenarios on Shop →
            </Link>
          )}
        </div>

        <div
          className={`rounded-xl border border-dashed border-[#E5E7EB] bg-[#FAFAF9] ${
            isCompact ? "p-3 mb-3" : "p-4 mb-4"
          }`}
        >
          <p className="text-[12px] font-semibold text-[#6B7280]">{JB_PROTOCOL_SKIP_JB.label}</p>
          <ul className="mt-2 space-y-1">
            {JB_PROTOCOL_SKIP_JB.cases.map((item) => (
              <li key={item} className="text-[12px] text-[#9CA3AF] leading-relaxed">
                · {item}
              </li>
            ))}
          </ul>
        </div>

        <p className={`text-[#6B7280] leading-relaxed ${isCompact ? "text-[11px]" : "text-[12px]"}`}>
          {JB_PROTOCOL_CHOOSER.notBothNote}
        </p>
        {!isCompact && (
          <p className="text-[11px] text-[#9CA3AF] mt-2">{JB_PROTOCOL_CHOOSER.attribution}</p>
        )}
      </div>
    </div>
  );
}

function KitBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#5B21B6] border border-[#C4B5FD]">
      {label}
    </span>
  );
}

function DecisionButton({
  label,
  active,
  onClick,
  href,
  compact,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
  compact?: boolean;
}) {
  const className = `inline-flex items-center justify-center rounded-lg border px-4 font-medium transition-colors ${
    compact ? "h-9 text-[12px]" : "h-10 text-sm"
  } ${
    active
      ? "border-[#0F6E56] bg-[#0F6E56] text-white"
      : "border-[#93C5FD] bg-white text-[#1E40AF] hover:bg-[#DBEAFE]"
  }`;

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
