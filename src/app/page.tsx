import Link from "next/link";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";
import { HeroVideoPanel } from "@/components/marketing/hero-video-panel";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import { CtaLink } from "@/components/marketing/primitives";
import { LEARN_MORE_LINKS } from "@/lib/marketing/copy";

const STEPS = [
  {
    n: "01",
    visit: "Visit 1",
    title: "Final impression and jaw relation",
    text: "The JB Tray records both in one sitting. This visit holds only when those records are captured together.",
    note: "Both records, one sitting",
    conditional: false,
  },
  {
    n: "02",
    visit: "Visit 2",
    title: "Printed try-in",
    text: "The patient verifies fit, occlusion, and esthetics. If nothing needs to change, the case ends here.",
    note: "Complete if accepted",
    conditional: false,
  },
  {
    n: "03",
    visit: "Visit 3",
    title: "Definitive delivery",
    text: "The lab revises the denture, and the patient returns for delivery.",
    note: "Only if the try-in needs a change",
    conditional: true,
  },
] as const;

export default function Home() {
  return (
    <MarketingShell>
      <section className="pt-[4.25rem]">
        <div className="relative">
          <div className="relative aspect-video w-full">
            <HeroBackdrop />
          </div>
          <div className="px-6 py-10 lg:absolute lg:inset-0 lg:flex lg:items-start lg:px-6 lg:pt-16 lg:pb-0">
            <div className="max-w-6xl mx-auto w-full">
              <div className="max-w-xl">
                <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-semibold tracking-[-0.04em] leading-[1.05] text-[var(--pd-navy)]">
                  Less chair time.
                  <span className="block text-[var(--pd-teal-dark)]">One sitting for the records.</span>
                </h1>
                <p className="mt-6 text-[18px] sm:text-[20px] leading-relaxed text-[var(--pd-slate)]">
                  Final impression and jaw relation are captured together, instead of across separate appointments. The printed try-in is the next visit. If nothing needs to change, the case ends there.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--pd-bg)] px-6 pt-16 pb-16 sm:pt-20 sm:pb-20">
        <div className="max-w-6xl mx-auto grid items-start gap-10 lg:grid-cols-2 lg:gap-12">
          <ol>
            {STEPS.map((step, index) => {
              const next = STEPS[index + 1];
              return (
                <li key={step.n} className="grid grid-cols-[2.75rem_1fr] gap-x-4">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center border text-[13px] font-semibold tracking-wide ${
                        step.conditional
                          ? "border-dashed border-[var(--pd-navy)] bg-white text-[var(--pd-navy)]"
                          : "border-[var(--pd-navy)] bg-[var(--pd-navy)] text-white"
                      }`}
                    >
                      {step.n}
                    </span>
                    {next && (
                      <span
                        className={`my-1 w-px flex-1 min-h-6 ${
                          next.conditional
                            ? "border-l border-dashed border-[var(--pd-navy)]/40"
                            : "bg-[var(--pd-navy)]/25"
                        }`}
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className={next ? "pb-7" : ""}>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)]">
                      {step.visit}
                    </p>
                    <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[var(--pd-navy)]">
                      {step.title}
                    </h2>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-[var(--pd-slate)]">{step.text}</p>
                    <p className="mt-2 text-[12px] font-medium uppercase tracking-[0.08em] text-[var(--pd-muted)]">
                      {step.note}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)]">
              Visit 1 manual
            </p>
            <HeroVideoPanel />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <CtaLink href="/first-case" className="h-14 px-8 text-[16px]">
            Start with 50% off your first case
          </CtaLink>
          <Link
            href="/providers#demo"
            className="text-[15px] text-[var(--pd-muted)] hover:text-[var(--pd-navy)] transition-colors"
          >
            Want someone to walk you through it? Request a demo
          </Link>
        </div>
      </section>

      <section className="px-6 py-14 bg-white border-y border-[var(--pd-border)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.04em] text-[var(--pd-navy)]">
            2 visits, unless it needs a change
          </p>
          <p className="mt-4 text-[17px] leading-relaxed text-[var(--pd-slate)]">
            A right try-in ends the case. A change means we revise it, and that final delivery is a third visit.
          </p>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-4">
            More, if you want it
          </h2>
          <ul className="border border-[var(--pd-border)] bg-white divide-y divide-[var(--pd-border)]">
            {LEARN_MORE_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 px-5 py-4 hover:bg-[var(--pd-surface)] transition-colors"
                >
                  <span className="text-[17px] font-medium text-[var(--pd-navy)]">{link.label}</span>
                  <span className="text-[15px] text-[var(--pd-muted)]">{link.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
