import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { VisitProtocolsComparison } from "@/components/marketing/visit-protocols";
import { WORKFLOW_STEPS } from "@/lib/marketing/copy";
import { CtaLink, ImagePlaceholder } from "@/components/marketing/primitives";

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

      <VisitProtocolsComparison />

      <section className="py-16 px-6 text-center">
        <CtaLink href="/providers#demo">Request a clinical demo</CtaLink>
      </section>
    </MarketingShell>
  );
}
