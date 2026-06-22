import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { DeviceDetailSections, ProtocolChooserNote } from "@/components/marketing/device-sections";
import { CtaLink } from "@/components/marketing/primitives";

export const metadata = {
  title: "The system — PrintDenture",
  description:
    "JB Tray, JB Fork, and POP Bow — a clinically-developed capture system for single-appointment denture records.",
};

export default function TheSystemPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Capture devices"
        title="A clinically-developed capture system — not a gadget."
        lead="Purpose-built recording devices developed by university prosthodontics faculty — designed for predictable, single-appointment capture."
      />

      <DeviceDetailSections />
      <ProtocolChooserNote />

      <section className="py-16 px-6 bg-[var(--pd-navy)] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[17px] leading-relaxed text-[#A8C4D4] mb-8">
            Eight-plus clinical devices developed by the same prosthodontics faculty. Exclusively
            available in the U.S. through PrintDenture.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <CtaLink href="/clinical">Clinical background</CtaLink>
            <CtaLink
              href="/providers#apply"
              variant="secondary"
              className="border-white/30 text-white hover:bg-white hover:text-[var(--pd-navy)]"
            >
              Become a provider
            </CtaLink>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
