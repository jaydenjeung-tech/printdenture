import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { TRUST_BADGES, HUH_JUNGBO_PROFILE } from "@/lib/marketing/copy";
import { GuideImageFrame } from "@/components/marketing/guide-image";
import { CtaLink, TrustIcon } from "@/components/marketing/primitives";

export const metadata = {
  title: "Clinical — PrintDenture",
  description:
    "Designed by a prosthodontics faculty. Validated in clinical study. FDA-registered capture devices.",
};

export default function ClinicalPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Clinical credibility"
        title="Designed by a prosthodontics faculty. Validated in clinical study."
        lead="Academic rigor behind every device in the capture system — developed for predictable outcomes in general practice."
      />

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <GuideImageFrame
            src={HUH_JUNGBO_PROFILE.src}
            alt={HUH_JUNGBO_PROFILE.alt}
            variant="banner"
            className="w-full max-w-lg mx-auto lg:mx-0"
          />
          <div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] mb-2">
              Huh Jung-bo, DDS, PhD
            </h2>
            <p className="text-[15px] text-[var(--pd-teal-dark)] font-medium mb-6">
              Professor of Prosthodontics, Pusan National University
            </p>
            <p className="text-[16px] leading-relaxed text-[var(--pd-slate)] mb-6">
              {/* TODO: Replace with confirmed bio when Jayden supplies final copy */}
              Inventor of eight or more clinical prosthetic devices used in denture and removable
              prosthodontics workflows. The JB capture system reflects decades of faculty-led
              development focused on reducing chair time while maintaining clinical rigor in record
              capture.
            </p>
            <ul className="space-y-3">
              {[
                "Inventor of 8+ clinical prosthetic devices",
                "Faculty-led device development & validation",
                "Exclusive U.S. distribution through PrintDenture",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px] text-[var(--pd-slate)]">
                  <span className="w-1.5 h-1.5 bg-[var(--pd-teal)] mt-2 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white border-y border-[var(--pd-border)]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] mb-6">
            Clinical evidence
          </h2>
          <div className="space-y-6 text-[16px] leading-relaxed text-[var(--pd-slate)]">
            <p>
              {/* TODO: Add confirmed pilot study citation */}
              The capture workflow has been evaluated in pilot clinical studies demonstrating
              feasibility of single-appointment record capture for full denture cases.
            </p>
            <p>
              {/* TODO: Add confirmed U.S. study details when available */}
              Ongoing U.S.-based clinical research is underway to further validate workflow outcomes
              in mainstream general practice settings. Co-authorship opportunities are available for
              qualified provider program participants.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[18px] font-semibold text-[var(--pd-navy)] mb-6">Regulatory & training</h2>
          <ul className="grid sm:grid-cols-2 gap-4">
            {TRUST_BADGES.map((badge) => (
              <li
                key={badge.label}
                className="flex items-center gap-3 border border-[var(--pd-border)] p-4 bg-white text-[14px] text-[var(--pd-slate)]"
              >
                <TrustIcon type={badge.icon} />
                {badge.label}
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-[var(--pd-muted)] mt-6">
            {/* TODO: Confirm exact FDA registration and CE accreditation language with legal */}
            Devices are described as clinical capture and recording devices. PrintDenture does not
            make therapeutic efficacy claims beyond validated workflow documentation.
          </p>
        </div>
      </section>

      <section className="py-16 px-6 text-center border-t border-[var(--pd-border)]">
        <CtaLink href="/providers#demo">Request a clinical demo</CtaLink>
      </section>
    </MarketingShell>
  );
}
