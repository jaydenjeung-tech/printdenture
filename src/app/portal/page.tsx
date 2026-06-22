import Link from "next/link";
import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { CtaLink } from "@/components/marketing/primitives";

export const metadata = {
  title: "Provider portal — PrintDenture",
  description: "Submit and track denture cases through the PrintDenture provider portal.",
};

export default function PortalPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Provider portal"
        title="Case submission & tracking"
        lead="The provider portal is where approved practices submit cases, upload scans, and track workflow status."
      />

      <section className="py-20 px-6">
        <div className="max-w-xl mx-auto text-center border border-[var(--pd-border)] bg-white p-10">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--pd-teal)] mb-4">
            Coming soon
          </p>
          <p className="text-[16px] leading-relaxed text-[var(--pd-slate)] mb-8">
            Full portal functionality — case submission, scan upload, try-in tracking, and delivery
            status — is available to approved providers through the dashboard while we expand the
            dedicated portal experience.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <CtaLink href="/login">Provider login</CtaLink>
            <Link
              href="/signup"
              className="inline-flex h-11 items-center px-6 text-[14px] font-medium border border-[var(--pd-navy)] text-[var(--pd-navy)] hover:bg-[var(--pd-navy)] hover:text-white transition-colors"
            >
              Register your practice
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
