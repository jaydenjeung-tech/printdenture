import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { VisitProtocolsComparison } from "@/components/marketing/visit-protocols";
import { WORKFLOW_STEPS } from "@/lib/marketing/copy";
import { CtaLink } from "@/components/marketing/primitives";
import Image from "next/image";

export const metadata = {
  title: "How it works — PrintDenture",
  description:
    "Take records, then check a printed try-in. If nothing needs to change, the case ends on that second visit. A revision is a third visit.",
};

export default function HowItWorksPage() {
  return (
    <MarketingShell labName="Dental Lab">
      <PageHero
        eyebrow="Workflow"
        title="The try-in can be the last visit."
        lead="If nothing needs to change, the case ends on visit 2. If it does, the lab revises the denture and the patient comes back for the final."
        showLabPartner={false}
      />

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <ol className="grid gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] md:grid-cols-3">
            {WORKFLOW_STEPS.map((step) => (
              <li key={step.step} className="bg-white p-7 lg:p-8">
                <span className="text-[11px] font-semibold tracking-[0.12em] text-[var(--pd-teal)]">
                  STEP {step.step}
                </span>
                <h2 className="text-[20px] font-semibold text-[var(--pd-navy)] mt-3 mb-1 leading-snug">
                  {step.title}
                </h2>
                <p className="text-[13px] text-[var(--pd-muted)] mb-4">{step.subtitle}</p>
                <p className="text-[15px] leading-relaxed text-[var(--pd-slate)]">{step.description}</p>
              </li>
            ))}
          </ol>

          <p className="mt-6 border border-[var(--pd-teal)]/30 bg-[var(--pd-teal)]/5 px-6 py-4 text-[14px] leading-relaxed text-[var(--pd-slate)]">
            <span className="font-semibold text-[var(--pd-navy)]">Clinical note. </span>
            A printed try-in is included before final delivery. Verify esthetics and occlusion chairside — we do not recommend skipping try-in verification.
          </p>

          <div className="relative mt-10 aspect-[1024/576] w-full overflow-hidden border border-[var(--pd-border)] bg-white">
            <Image
              src="/images/visit-protocols/denture-visit-comparison.jpg"
              alt="Traditional five-visit denture procedure compared with a shorter workflow: one-step final impression and jaw relation, try-in, then delivery"
              fill
              className="object-contain"
              sizes="(max-width: 1280px) 100vw, 1280px"
            />
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
