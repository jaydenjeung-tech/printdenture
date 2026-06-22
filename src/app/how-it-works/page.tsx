import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { WORKFLOW_STEPS } from "@/lib/marketing/copy";
import { CtaLink, ImagePlaceholder, SectionEyebrow } from "@/components/marketing/primitives";

export const metadata = {
  title: "How it works — PrintDenture",
  description:
    "Capture impression, bite, and occlusal plane in one appointment. We design, fabricate, and finish — deliver in two visits with a printed try-in.",
};

export default function HowItWorksPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Workflow"
        title="Capture once. We do the rest. Deliver in two."
        lead="A three-step workflow that consolidates capture into a single appointment and returns a verified prosthesis in two patient visits."
      />

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-0 border border-[var(--pd-border)] bg-white">
            {WORKFLOW_STEPS.map((step, i) => (
              <div
                key={step.step}
                className={`p-8 lg:p-10 ${i > 0 ? "border-t border-[var(--pd-border)]" : ""}`}
              >
                <span className="text-[11px] font-semibold tracking-[0.12em] text-[var(--pd-teal)]">
                  STEP {step.step}
                </span>
                <h2 className="text-[22px] font-semibold text-[var(--pd-navy)] mt-3 mb-1">{step.title}</h2>
                <p className="text-[13px] text-[var(--pd-muted)] mb-4">{step.subtitle}</p>
                <p className="text-[15px] leading-relaxed text-[var(--pd-slate)]">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <ImagePlaceholder
              label="Chairside capture workflow — photo placeholder"
              src="/images/jb-fork/impression-chairside.jpg"
              className="aspect-[4/3] w-full"
            />
            <div className="border border-[var(--pd-teal)]/30 bg-[var(--pd-teal)]/5 p-6">
              <p className="text-[14px] font-semibold text-[var(--pd-navy)] mb-2">Clinical note</p>
              <p className="text-[14px] leading-relaxed text-[var(--pd-slate)]">
                A printed try-in is included before final delivery. Verify esthetics and occlusion
                chairside — we do not recommend skipping try-in verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[var(--pd-surface)] border-y border-[var(--pd-border)]">
        <div className="max-w-5xl mx-auto">
          <SectionEyebrow className="text-center">Visit comparison</SectionEyebrow>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-center text-[var(--pd-navy)] mb-10">
            From five visits to two
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-[var(--pd-border)] bg-white p-8">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--pd-muted)] mb-4">
                Traditional workflow
              </p>
              <ol className="space-y-3 text-[14px] text-[var(--pd-slate)]">
                {[
                  "Preliminary impression",
                  "Border molding & final impression",
                  "Jaw relation record",
                  "Try-in appointment",
                  "Delivery (+ remakes)",
                ].map((item, i) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-[var(--pd-muted)] font-mono text-[12px]">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
            <div className="border-2 border-[var(--pd-teal)] bg-white p-8">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--pd-teal-dark)] mb-4">
                PrintDenture workflow
              </p>
              <ol className="space-y-3 text-[14px] text-[var(--pd-navy)]">
                <li className="flex gap-3">
                  <span className="text-[var(--pd-teal)] font-mono text-[12px]">1.</span>
                  <span>
                    <strong>Capture</strong> — impression, bite & occlusal plane in one appointment
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[var(--pd-teal)] font-mono text-[12px]">2.</span>
                  <span>
                    <strong>Verify & deliver</strong> — printed try-in, then final prosthesis
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 text-center">
        <CtaLink href="/providers#demo">Request a clinical demo</CtaLink>
      </section>
    </MarketingShell>
  );
}
