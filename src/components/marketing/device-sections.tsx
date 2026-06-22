import Link from "next/link";
import { CAPTURE_DEVICES, PROTOCOL_NOTE } from "@/lib/marketing/devices";
import { CtaLink, SectionEyebrow } from "@/components/marketing/primitives";
import { GuideImageFrame } from "@/components/marketing/guide-image";

export function DeviceDetailSections({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "space-y-12" : "space-y-0"}>
      {CAPTURE_DEVICES.map((device, i) => (
        <section
          key={device.id}
          id={device.id}
          className={`scroll-mt-28 ${
            compact
              ? ""
              : `py-20 lg:py-24 px-6 ${i % 2 === 0 ? "bg-white" : "bg-[var(--pd-bg)]"} border-y border-[var(--pd-border)]`
          }`}
        >
          <div className={`max-w-7xl mx-auto ${compact ? "" : "px-0 lg:px-4"}`}>
            <div
              className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
                i % 2 === 1 && !compact ? "lg:[direction:rtl]" : ""
              }`}
            >
              <GuideImageFrame
                src={device.image}
                alt={device.imageAlt}
                variant="hero"
                className={`w-full ${i % 2 === 1 && !compact ? "lg:[direction:ltr]" : ""}`}
              />
              <div className={i % 2 === 1 && !compact ? "lg:[direction:ltr]" : ""}>
                <SectionEyebrow>{device.subtitle}</SectionEyebrow>
                <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-semibold tracking-[-0.03em] text-[var(--pd-navy)] mb-4">
                  {device.name}
                  {!compact && device.subtitle !== device.name && (
                    <span className="text-[var(--pd-muted)] font-normal"> — {device.subtitle}</span>
                  )}
                </h2>
                <p className="text-[16px] leading-relaxed text-[var(--pd-slate)] mb-6">
                  {device.description}
                </p>
                <ul className="space-y-2.5 mb-8">
                  {device.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[14px] text-[var(--pd-slate)] leading-relaxed"
                    >
                      <span className="text-[var(--pd-teal)] shrink-0 mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3">
                  <CtaLink href={device.guideHref}>Clinical guide & videos</CtaLink>
                  {device.shopHref && (
                    <CtaLink href={device.shopHref} variant="secondary">
                      Order kits
                    </CtaLink>
                  )}
                </div>
                {device.footnote && !compact && (
                  <p className="text-[12px] text-[var(--pd-muted)] mt-6 leading-relaxed max-w-lg">
                    {device.footnote}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

export function ProtocolChooserNote() {
  return (
    <section className="py-16 px-6 bg-[var(--pd-surface)] border-y border-[var(--pd-border)]">
      <div className="max-w-3xl mx-auto">
        <SectionEyebrow>Protocol</SectionEyebrow>
        <h2 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold text-[var(--pd-navy)] mb-4">
          {PROTOCOL_NOTE.title}
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--pd-slate)] mb-6">{PROTOCOL_NOTE.body}</p>
        <div className="flex flex-wrap gap-4">
          {PROTOCOL_NOTE.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-[var(--pd-teal-dark)] hover:underline"
            >
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
