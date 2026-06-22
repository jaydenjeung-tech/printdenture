import { TRUST_BADGES, HERO_STATS, HUH_JUNGBO_PROFILE } from "@/lib/marketing/copy";
import { CAPTURE_DEVICES } from "@/lib/marketing/devices";
import { GuideImageFrame } from "@/components/marketing/guide-image";
import {
  CtaLink,
  ImagePlaceholder,
  SectionEyebrow,
  TrustIcon,
} from "@/components/marketing/primitives";
import { HeroVideoPanel } from "@/components/marketing/hero-video-panel";
import { HeroBackdrop } from "@/components/marketing/hero-backdrop";

export function HeroSection() {
  return (
    <section className="relative bg-[var(--pd-nav)] text-white overflow-hidden">
      <HeroBackdrop />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-16 lg:pt-36 lg:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <SectionEyebrow className="text-[var(--pd-teal-light)]">
              Clinically-developed denture workflow
            </SectionEyebrow>
            <h1 className="text-[clamp(2.25rem,5vw,3.75rem)] font-semibold tracking-[-0.04em] leading-[1.05] mb-6">
              Full dentures in 2 visits — not 5.
            </h1>
            <p className="text-[17px] leading-relaxed text-[#A8C4D4] mb-8 max-w-xl">
              A single-appointment capture system — impression, bite, and occlusal plane in one sitting
              — developed by a university prosthodontics faculty. You capture; we design, fabricate, and
              finish. Less chair time, fewer remakes, predictable results.
            </p>
            <div className="flex flex-wrap gap-3 mb-10">
              <CtaLink href="/providers#demo">Request a clinical demo</CtaLink>
              <CtaLink href="/how-it-works" variant="secondary" className="border-white/30 text-white hover:bg-white hover:text-[var(--pd-navy)]">
                See how the workflow works
              </CtaLink>
            </div>
            <ul className="flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-3">
              {TRUST_BADGES.map((badge) => (
                <li key={badge.label} className="flex items-center gap-2 text-[13px] text-[#8BB3C8]">
                  <TrustIcon type={badge.icon} />
                  {badge.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-w-0">
            <HeroVideoPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

export function StatRow() {
  return (
    <section className="border-y border-[var(--pd-border)] bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4">
        {HERO_STATS.map((stat, i) => (
          <div
            key={stat.value}
            className={`px-6 py-8 lg:py-10 ${i > 0 ? "border-l border-[var(--pd-border)]" : ""} ${i >= 2 ? "border-t lg:border-t-0 border-[var(--pd-border)]" : ""}`}
          >
            <p className="text-[clamp(1.25rem,3vw,1.75rem)] font-semibold tracking-[-0.02em] text-[var(--pd-navy)] mb-1">
              {stat.value}
            </p>
            <p className="text-[13px] text-[var(--pd-muted)] leading-snug">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ProblemSection() {
  return (
    <section className="py-20 lg:py-28 px-6 bg-[var(--pd-bg)]">
      <div className="max-w-3xl mx-auto text-center">
        <SectionEyebrow className="text-center">The problem</SectionEyebrow>
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--pd-navy)] mb-6">
          The traditional denture workflow is a chair-time sink.
        </h2>
        <p className="text-[17px] leading-relaxed text-[var(--pd-slate)] space-y-4">
          <span className="block">
            Conventional full denture cases routinely require five or more patient visits — separate
            appointments for preliminary impressions, border molding, jaw relations, try-ins, and
            delivery. Each return visit consumes chair time, staff coordination, and patient goodwill.
          </span>
          <span className="block">
            Remakes and mid-course corrections are common when capture and verification happen across
            disconnected steps. Patients drop out. Schedules back up. The bottleneck is not whether you
            can print — it is that capture and validation are fragmented across too many appointments.
          </span>
        </p>
      </div>
    </section>
  );
}

export function HowItWorksPreview() {
  return (
    <section className="py-20 lg:py-28 px-6 bg-white border-y border-[var(--pd-border)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <SectionEyebrow>Workflow</SectionEyebrow>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--pd-navy)]">
            Capture once. We do the rest. Deliver in two.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-0 border border-[var(--pd-border)]">
          {[
            {
              step: "01",
              title: "Capture",
              subtitle: "Single appointment",
              text: "Using the JB capture system, take the impression, jaw relation, and occlusal plane in one sitting. Scan and upload.",
            },
            {
              step: "02",
              title: "We design & fabricate",
              subtitle: "Lab-controlled",
              text: "Our lab designs the denture and prints a try-in. Full QC and finishing handled for you — no equipment, no post-processing.",
            },
            {
              step: "03",
              title: "Verify & deliver",
              subtitle: "Two visits total",
              text: "Confirm esthetics and occlusion with the printed try-in, then deliver the finished prosthesis. Two visits, verified result.",
            },
          ].map((item, i) => (
            <div
              key={item.step}
              className={`p-8 lg:p-10 ${i > 0 ? "border-t md:border-t-0 md:border-l border-[var(--pd-border)]" : ""}`}
            >
              <span className="text-[11px] font-semibold tracking-[0.12em] text-[var(--pd-teal)]">
                STEP {item.step}
              </span>
              <h3 className="text-[20px] font-semibold text-[var(--pd-navy)] mt-3 mb-1">{item.title}</h3>
              <p className="text-[13px] text-[var(--pd-muted)] mb-4">{item.subtitle}</p>
              <p className="text-[15px] leading-relaxed text-[var(--pd-slate)]">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <CtaLink href="/how-it-works" variant="ghost">
            View full workflow →
          </CtaLink>
        </div>
      </div>
    </section>
  );
}

export function SystemPreview() {
  return (
    <section className="py-20 lg:py-28 px-6 bg-[var(--pd-bg)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14 max-w-2xl">
          <SectionEyebrow>The system</SectionEyebrow>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--pd-navy)]">
            A clinically-developed capture system — not a gadget.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-0 border border-[var(--pd-border)] bg-white mb-10">
          {CAPTURE_DEVICES.map((device, i) => (
            <div
              key={device.id}
              className={`flex flex-col ${i > 0 ? "border-t md:border-t-0 md:border-l border-[var(--pd-border)]" : ""}`}
            >
              <ImagePlaceholder label={device.name} src={device.image} variant="product" className="aspect-square" />
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-[18px] font-semibold text-[var(--pd-navy)] mb-1">{device.name}</h3>
                <p className="text-[12px] text-[var(--pd-teal-dark)] font-medium mb-3">{device.subtitle}</p>
                <p className="text-[14px] leading-relaxed text-[var(--pd-slate)] mb-4">{device.description}</p>
                <ul className="space-y-2 mt-auto mb-4">
                  {device.highlights.slice(0, 2).map((item) => (
                    <li key={item} className="flex gap-2 text-[13px] text-[var(--pd-muted)] leading-snug">
                      <span className="text-[var(--pd-teal)] shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href={device.guideHref}
                  className="text-[13px] font-medium text-[var(--pd-teal-dark)] hover:underline"
                >
                  Clinical guide →
                </a>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[14px] text-[var(--pd-muted)] max-w-3xl">
          Eight-plus clinical devices developed by the same prosthodontics faculty. Exclusively available
          in the U.S. through PrintDenture.
        </p>
        <div className="mt-6">
          <CtaLink href="/the-system" variant="ghost">
            Explore the capture system →
          </CtaLink>
        </div>
      </div>
    </section>
  );
}

export function ClinicalPreview() {
  return (
    <section className="py-20 lg:py-28 px-6 bg-white border-y border-[var(--pd-border)]">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <GuideImageFrame
          src={HUH_JUNGBO_PROFILE.src}
          alt={HUH_JUNGBO_PROFILE.alt}
          variant="banner"
          className="w-full max-w-lg mx-auto lg:mx-0"
        />
        <div>
          <SectionEyebrow>Clinical credibility</SectionEyebrow>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--pd-navy)] mb-6">
            Designed by a prosthodontics faculty. Validated in clinical study.
          </h2>
          <div className="border-l-2 border-[var(--pd-teal)] pl-6 mb-6">
            <p className="text-[18px] font-semibold text-[var(--pd-navy)]">Huh Jung-bo, DDS, PhD</p>
            <p className="text-[14px] text-[var(--pd-slate)] mt-1">
              Professor of Prosthodontics, Pusan National University. Inventor of 8+ clinical prosthetic
              devices.
            </p>
          </div>
          <p className="text-[15px] leading-relaxed text-[var(--pd-slate)] mb-6">
            {/* TODO: Replace with confirmed pilot study citation when available */}
            The capture workflow has been evaluated in pilot clinical studies, with ongoing U.S.-based
            research to further validate outcomes in mainstream general practice settings.
          </p>
          <ul className="flex flex-wrap gap-4">
            {TRUST_BADGES.slice(0, 2).map((badge) => (
              <li key={badge.label} className="flex items-center gap-2 text-[13px] text-[var(--pd-muted)]">
                <TrustIcon type={badge.icon} />
                {badge.label}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <CtaLink href="/clinical" variant="ghost">
              Read clinical background →
            </CtaLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PrinterSection() {
  return (
    <section className="py-20 lg:py-28 px-6 bg-[var(--pd-navy)] text-white">
      <div className="max-w-3xl mx-auto text-center">
        <SectionEyebrow className="text-[var(--pd-teal-light)] text-center">Why not in-house?</SectionEyebrow>
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] mb-6">
          The printer you don&apos;t have to own — or babysit.
        </h2>
        <p className="text-[17px] leading-relaxed text-[#A8C4D4] space-y-4">
          <span className="block">
            In-house 3D printing carries hidden costs: equipment, resin, post-processing labor, learning
            curves, and inconsistent QC across cases.
          </span>
          <span className="block">
            With PrintDenture, you capture chairside using a clinically-developed system. We handle
            design, fabrication, QC, and finishing — so your team stays focused on patients, not
            printers.
          </span>
        </p>
      </div>
    </section>
  );
}

export function ComparisonSection() {
  return (
    <section className="py-20 lg:py-28 px-6 bg-[var(--pd-bg)]">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <SectionEyebrow className="text-center">Compare</SectionEyebrow>
          <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--pd-navy)]">
            Three paths to a full denture
          </h2>
        </div>
        <div className="overflow-x-auto border border-[var(--pd-border)] bg-white">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-[var(--pd-border)] bg-[var(--pd-surface)]">
                <th className="p-4 font-medium text-[var(--pd-muted)] w-[28%]" />
                <th className="p-4 font-medium text-[var(--pd-navy)]">Traditional</th>
                <th className="p-4 font-medium text-[var(--pd-navy)]">In-house printing</th>
                <th className="p-4 font-semibold text-[var(--pd-teal-dark)] bg-[var(--pd-teal)]/5">PrintDenture</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Visits", t: "5+", i: "2–3", p: "2" },
                { label: "Equipment cost", t: "—", i: "High", p: "None" },
                { label: "Post-processing labor", t: "High", i: "High (you)", p: "None (we do it)" },
                { label: "Try-in verification", t: "Yes", i: "Variable", p: "Yes (printed)" },
                { label: "Consistency / QC", t: "Variable", i: "Variable", p: "Lab-controlled" },
              ].map((row) => (
                <tr key={row.label} className="border-b border-[var(--pd-border)] last:border-0">
                  <td className="p-4 font-medium text-[var(--pd-navy)]">{row.label}</td>
                  <td className="p-4 text-[var(--pd-slate)]">{row.t}</td>
                  <td className="p-4 text-[var(--pd-slate)]">{row.i}</td>
                  <td className="p-4 font-semibold text-[var(--pd-navy)] bg-[var(--pd-teal)]/5">{row.p}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function ProviderTeaser() {
  return (
    <section className="py-20 lg:py-28 px-6 bg-white border-y border-[var(--pd-border)]">
      <div className="max-w-3xl mx-auto text-center">
        <SectionEyebrow className="text-center">Provider program</SectionEyebrow>
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] text-[var(--pd-navy)] mb-6">
          Become a certified PrintDenture provider.
        </h2>
        <p className="text-[17px] leading-relaxed text-[var(--pd-slate)] mb-8">
          Faculty-led training, CE credits, and workflow certification — designed for clinicians who
          want to lead denture innovation in their region, not just access a discount lab.
        </p>
        <CtaLink href="/providers">Explore the provider program</CtaLink>
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="py-20 lg:py-24 px-6 bg-[var(--pd-navy)] text-white relative overflow-hidden">
      <div className="absolute inset-0 pd-grid-bg opacity-[0.06]" aria-hidden />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-semibold tracking-[-0.03em] mb-8">
          Cut your denture chair time in half.
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <CtaLink href="/providers#demo">Request a clinical demo</CtaLink>
          <CtaLink href="/providers#apply" variant="secondary" className="border-white/30 text-white hover:bg-white hover:text-[var(--pd-navy)]">
            Become a provider
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
