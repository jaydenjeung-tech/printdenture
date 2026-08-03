import Image from "next/image";
import Link from "next/link";
import { VISIT_PROTOCOLS, VISIT_PROTOCOL_NOTE } from "@/lib/marketing/copy";
import { JB_FORK_GUIDE_PATH } from "@/lib/guides/jb-fork-guide";
import { JB_TRAY_GUIDE_PATH } from "@/lib/guides/jb-tray-guide";
import { SectionEyebrow } from "@/components/marketing/primitives";
import { cn } from "@/lib/utils";

const GUIDE_HREFS: Record<string, string> = {
  "jb-fork": JB_FORK_GUIDE_PATH,
  "jb-tray": JB_TRAY_GUIDE_PATH,
};

export function VisitProtocolsComparison() {
  return (
    <section className="py-20 lg:py-28 px-6 bg-[var(--pd-surface)] border-y border-[var(--pd-border)]">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <SectionEyebrow className="text-center">Visit comparison</SectionEyebrow>
          <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.03em] text-[var(--pd-navy)] mb-4">
            From four visits to two
          </h2>
          <p className="text-[16px] leading-relaxed text-[var(--pd-slate)]">
            Digital denture pathways developed by PNU ADD. Each protocol consolidates chairside
            records — JB Fork and JB Tray combine steps that conventional digital workflows split
            across separate appointments.
          </p>
        </div>

        <div
          className="flex items-end justify-center gap-2 sm:gap-5 mb-12"
          aria-hidden
        >
          {VISIT_PROTOCOLS.map((protocol, i) => (
            <div key={protocol.id} className="flex items-end gap-2 sm:gap-5">
              {i > 0 && (
                <span className="mb-8 sm:mb-9 text-[var(--pd-border-strong)] text-[16px] sm:text-[18px]">
                  →
                </span>
              )}
              <div className="flex flex-col items-center gap-1.5 min-w-[4.75rem] sm:min-w-[6.5rem]">
                <span
                  className={cn(
                    "text-[clamp(2rem,5vw,3rem)] font-semibold tracking-[-0.04em] leading-none tabular-nums",
                    protocol.highlighted ? "text-[var(--pd-teal-dark)]" : "text-[var(--pd-navy)]"
                  )}
                >
                  {protocol.visits}
                </span>
                <span
                  className={cn(
                    "text-[10px] sm:text-[11px] uppercase tracking-[0.08em] text-center leading-tight",
                    protocol.highlighted ? "text-[var(--pd-teal-dark)]" : "text-[var(--pd-muted)]"
                  )}
                >
                  {protocol.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-0 border border-[var(--pd-border)] bg-white">
          {VISIT_PROTOCOLS.map((protocol, colIndex) => {
            const guideHref = GUIDE_HREFS[protocol.id];
            return (
              <article
                key={protocol.id}
                className={cn(
                  "flex flex-col relative",
                  colIndex > 0 && "border-t lg:border-t-0 lg:border-l border-[var(--pd-border)]",
                  protocol.highlighted && "bg-[var(--pd-teal)]/[0.04]"
                )}
              >
                {protocol.highlighted && (
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-[var(--pd-teal)] z-10" aria-hidden />
                )}

                <header className="p-6 lg:p-7 border-b border-[var(--pd-border)]">
                  <p
                    className={cn(
                      "text-[11px] font-semibold uppercase tracking-[0.12em] mb-2",
                      protocol.highlighted ? "text-[var(--pd-teal-dark)]" : "text-[var(--pd-muted)]"
                    )}
                  >
                    {protocol.visitsLabel}
                  </p>
                  <h3 className="text-[20px] font-semibold text-[var(--pd-navy)] tracking-[-0.02em]">
                    {protocol.name}
                  </h3>
                  <p className="mt-2 text-[14px] leading-relaxed text-[var(--pd-slate)]">
                    {protocol.summary}
                  </p>
                </header>

                <ol className="flex-1 p-5 lg:p-6 space-y-4">
                  {protocol.steps.map((step, stepIndex) => (
                    <li key={step.title} className="relative flex gap-3">
                      {stepIndex < protocol.steps.length - 1 && (
                        <span
                          className="absolute left-[15px] top-10 bottom-[-16px] w-px bg-[var(--pd-border)]"
                          aria-hidden
                        />
                      )}
                      <span
                        className={cn(
                          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center text-[12px] font-semibold tabular-nums mt-6",
                          step.combined
                            ? "bg-[var(--pd-navy)] text-white"
                            : protocol.highlighted
                              ? "bg-[var(--pd-teal)] text-white"
                              : "bg-[var(--pd-surface)] text-[var(--pd-navy)] border border-[var(--pd-border)]"
                        )}
                      >
                        {stepIndex + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="relative aspect-[16/10] bg-[var(--pd-bg)] border border-[var(--pd-border)] overflow-hidden mb-2.5">
                          <Image
                            src={step.image}
                            alt={step.imageAlt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 80vw, 28vw"
                          />
                        </div>
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <p className="text-[14px] font-medium text-[var(--pd-navy)] leading-snug">
                            {step.title}
                          </p>
                          {step.combined && (
                            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--pd-teal-dark)]">
                              Combined
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-[var(--pd-muted)] mt-0.5 leading-snug">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                {guideHref && (
                  <div className="px-6 lg:px-7 pb-6 lg:pb-7 mt-auto">
                    <Link
                      href={guideHref}
                      className="text-[13px] font-medium text-[var(--pd-teal-dark)] hover:underline"
                    >
                      {protocol.device} clinical guide →
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-[13px] leading-relaxed text-[var(--pd-muted)] max-w-3xl mx-auto text-center">
          {VISIT_PROTOCOL_NOTE}
        </p>
      </div>
    </section>
  );
}
