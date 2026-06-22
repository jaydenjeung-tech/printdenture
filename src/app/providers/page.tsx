"use client";

import { useState } from "react";
import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { PROVIDER_BENEFITS } from "@/lib/marketing/copy";
import { CtaLink, SectionEyebrow } from "@/components/marketing/primitives";

export default function ProvidersPage() {
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);

  return (
    <MarketingShell>
      <PageHero
        eyebrow="Provider program"
        title="Become a certified PrintDenture provider."
        lead="Faculty-led training, CE credits, and workflow certification — for clinicians who want to lead denture innovation in their region."
      />

      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
          <div>
            <SectionEyebrow>Program benefits</SectionEyebrow>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] mb-8">
              Built for clinical educators and innovators
            </h2>
            <ul className="space-y-4">
              {PROVIDER_BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-start gap-4 border-l-2 border-[var(--pd-teal)] pl-4">
                  <p className="text-[15px] text-[var(--pd-slate)]">{benefit}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="border border-[var(--pd-border)] bg-white p-8">
            <p className="text-[15px] leading-relaxed text-[var(--pd-slate)] mb-6">
              The provider program is designed for mainstream U.S. general practitioners and
              prosthodontic-minded clinicians — not a community-specific network. Certification
              signals that your practice delivers the full two-visit workflow with faculty-backed
              training.
            </p>
            <CtaLink href="#apply">Apply to the provider program</CtaLink>
          </div>
        </div>
      </section>

      <section id="demo" className="py-20 px-6 bg-[var(--pd-surface)] border-y border-[var(--pd-border)] scroll-mt-24">
        <div className="max-w-xl mx-auto">
          <SectionEyebrow className="text-center">Demo request</SectionEyebrow>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-center text-[var(--pd-navy)] mb-8">
            Request a clinical demo
          </h2>
          {demoSubmitted ? (
            <p className="text-center text-[15px] text-[var(--pd-teal-dark)]">
              Thank you. Our team will contact you within 2 business days.
            </p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setDemoSubmitted(true);
              }}
            >
              <FormField label="Full name" name="name" required />
              <FormField label="Practice name" name="practice" required />
              <FormField label="Email" name="email" type="email" required />
              <FormField label="Phone" name="phone" type="tel" />
              <FormField label="State" name="state" required />
              <button
                type="submit"
                className="w-full h-11 bg-[var(--pd-teal)] text-white text-[14px] font-medium hover:bg-[var(--pd-teal-dark)] transition-colors"
              >
                Submit demo request
              </button>
            </form>
          )}
        </div>
      </section>

      <section id="apply" className="py-20 px-6 scroll-mt-24">
        <div className="max-w-xl mx-auto">
          <SectionEyebrow className="text-center">Application</SectionEyebrow>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-center text-[var(--pd-navy)] mb-4">
            Apply to the provider program
          </h2>
          <p className="text-center text-[14px] text-[var(--pd-muted)] mb-8">
            Applications are reviewed by our clinical team. Approved providers receive training
            scheduling and portal access.
          </p>
          {applySubmitted ? (
            <p className="text-center text-[15px] text-[var(--pd-teal-dark)]">
              Application received. We will review and respond within 5 business days.
            </p>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                setApplySubmitted(true);
              }}
            >
              <FormField label="Full name" name="name" required />
              <FormField label="Credentials (DDS, DMD, etc.)" name="credentials" required />
              <FormField label="Practice name" name="practice" required />
              <FormField label="Email" name="email" type="email" required />
              <FormField label="Phone" name="phone" type="tel" required />
              <FormField label="City, State" name="location" required />
              <div>
                <label htmlFor="motivation" className="block text-[13px] font-medium text-[var(--pd-navy)] mb-1.5">
                  Why do you want to join the provider program?
                </label>
                <textarea
                  id="motivation"
                  name="motivation"
                  rows={4}
                  required
                  className="w-full border border-[var(--pd-border)] px-3 py-2 text-[14px] bg-white focus:outline-none focus:border-[var(--pd-teal)]"
                />
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-[var(--pd-navy)] text-white text-[14px] font-medium hover:bg-[var(--pd-navy-light)] transition-colors"
              >
                Submit application
              </button>
            </form>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}

function FormField({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[13px] font-medium text-[var(--pd-navy)] mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full h-10 border border-[var(--pd-border)] px-3 text-[14px] bg-white focus:outline-none focus:border-[var(--pd-teal)]"
      />
    </div>
  );
}
