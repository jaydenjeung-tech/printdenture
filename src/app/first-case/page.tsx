import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { FIRST_CASE_OFFER } from "@/lib/marketing/copy";
import { CtaLink, SectionEyebrow } from "@/components/marketing/primitives";
import Link from "next/link";

export const metadata = {
  title: "First case · 50% off — PrintDenture",
  description:
    "New PrintDenture providers get 50% off their first lab case — design, printed try-in, QC, and finishing by IDOC Dental Lab.",
};

export default function FirstCaseOfferPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow={FIRST_CASE_OFFER.eyebrow}
        title={FIRST_CASE_OFFER.title}
        lead={FIRST_CASE_OFFER.lead}
      />

      <section className="py-16 lg:py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-0 border border-[var(--pd-border)] bg-white mb-14">
            {FIRST_CASE_OFFER.highlights.map((item, i) => (
              <div
                key={item.title}
                className={`p-7 lg:p-8 ${i > 0 ? "border-t md:border-t-0 md:border-l border-[var(--pd-border)]" : ""}`}
              >
                <h2 className="text-[17px] font-semibold text-[var(--pd-navy)] mb-2">{item.title}</h2>
                <p className="text-[14px] leading-relaxed text-[var(--pd-slate)]">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="max-w-2xl mx-auto">
            <SectionEyebrow>How to claim</SectionEyebrow>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] mb-8">
              Three steps to your discounted first case
            </h2>
            <ol className="space-y-0 border border-[var(--pd-border)] bg-white mb-8">
              {FIRST_CASE_OFFER.steps.map((step, i) => (
                <li
                  key={step}
                  className={`flex gap-4 p-6 ${i > 0 ? "border-t border-[var(--pd-border)]" : ""}`}
                >
                  <span className="shrink-0 flex h-8 w-8 items-center justify-center bg-[var(--pd-teal)] text-white text-[13px] font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  <p className="text-[15px] leading-relaxed text-[var(--pd-slate)] pt-1">{step}</p>
                </li>
              ))}
            </ol>

            <p className="text-[13px] leading-relaxed text-[var(--pd-muted)] mb-10">
              {FIRST_CASE_OFFER.note}
            </p>

            <div className="flex flex-wrap gap-3 mb-6">
              <CtaLink href={FIRST_CASE_OFFER.primaryHref}>{FIRST_CASE_OFFER.primaryCta}</CtaLink>
              <CtaLink href={FIRST_CASE_OFFER.secondaryHref} variant="secondary">
                {FIRST_CASE_OFFER.secondaryCta}
              </CtaLink>
            </div>

            <p className="text-[14px] text-[var(--pd-muted)]">
              {FIRST_CASE_OFFER.demoCta}{" "}
              <Link
                href={FIRST_CASE_OFFER.demoHref}
                className="font-medium text-[var(--pd-teal-dark)] hover:underline"
              >
                Request a clinical demo →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
