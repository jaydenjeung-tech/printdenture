"use client";

import { useState, type FormEvent } from "react";
import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { PROVIDER_BENEFITS, CLINICAL_DEMO_INTRO, CLINICAL_DEMO_NEXT_STEPS, CLINICAL_DEMO_SUCCESS_LEAD } from "@/lib/marketing/copy";
import { CtaLink, SectionEyebrow } from "@/components/marketing/primitives";

async function submitInquiry(body: Record<string, string>): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/provider-inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || "Failed to send. Please try again." };
  return { ok: true };
}

export default function ProvidersPage() {
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [applySubmitted, setApplySubmitted] = useState(false);
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  async function handleDemoSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDemoSubmitting(true);
    setDemoError(null);
    const fd = new FormData(e.currentTarget);
    const result = await submitInquiry({
      type: "demo",
      name: String(fd.get("name") ?? ""),
      practice: String(fd.get("practice") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      state: String(fd.get("state") ?? ""),
    });
    setDemoSubmitting(false);
    if (result.ok) setDemoSubmitted(true);
    else setDemoError(result.error ?? "Failed to send.");
  }

  async function handleApplySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApplySubmitting(true);
    setApplyError(null);
    const fd = new FormData(e.currentTarget);
    const result = await submitInquiry({
      type: "apply",
      name: String(fd.get("name") ?? ""),
      credentials: String(fd.get("credentials") ?? ""),
      practice: String(fd.get("practice") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      location: String(fd.get("location") ?? ""),
      motivation: String(fd.get("motivation") ?? ""),
    });
    setApplySubmitting(false);
    if (result.ok) setApplySubmitted(true);
    else setApplyError(result.error ?? "Failed to send.");
  }

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
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-center text-[var(--pd-navy)] mb-4">
            Request a clinical demo
          </h2>
          <p className="text-center text-[15px] leading-relaxed text-[var(--pd-slate)] mb-8 max-w-lg mx-auto">
            {CLINICAL_DEMO_INTRO}
          </p>
          {demoSubmitted ? (
            <div className="space-y-6">
              <p className="text-center text-[15px] text-[var(--pd-teal-dark)] font-medium">
                {CLINICAL_DEMO_SUCCESS_LEAD}
              </p>
              <ClinicalDemoInstructions title="What happens next" />
            </div>
          ) : (
            <div className="space-y-6">
              <ClinicalDemoInstructions title="Before you submit" />
            <form className="space-y-4" onSubmit={(e) => void handleDemoSubmit(e)}>
              <FormField label="Full name" name="name" required />
              <FormField label="Practice name" name="practice" required />
              <FormField label="Email" name="email" type="email" required />
              <FormField label="Phone" name="phone" type="tel" />
              <FormField label="State" name="state" required />
              {demoError && <p className="text-[13px] text-red-600">{demoError}</p>}
              <button
                type="submit"
                disabled={demoSubmitting}
                className="w-full h-11 bg-[var(--pd-teal)] text-white text-[14px] font-medium hover:bg-[var(--pd-teal-dark)] transition-colors disabled:opacity-50"
              >
                {demoSubmitting ? "Sending…" : "Submit demo request"}
              </button>
            </form>
            </div>
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
            <form className="space-y-4" onSubmit={(e) => void handleApplySubmit(e)}>
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
              {applyError && <p className="text-[13px] text-red-600">{applyError}</p>}
              <button
                type="submit"
                disabled={applySubmitting}
                className="w-full h-11 bg-[var(--pd-navy)] text-white text-[14px] font-medium hover:bg-[var(--pd-navy-light)] transition-colors disabled:opacity-50"
              >
                {applySubmitting ? "Sending…" : "Submit application"}
              </button>
            </form>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}

function ClinicalDemoInstructions({ title }: { title: string }) {
  return (
    <div className="border border-[var(--pd-border)] bg-white p-5 sm:p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-teal-dark)] mb-3">
        {title}
      </p>
      <ol className="space-y-3">
        {CLINICAL_DEMO_NEXT_STEPS.map((step, index) => (
          <li key={step} className="flex gap-3 text-[14px] leading-relaxed text-[var(--pd-slate)]">
            <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-[#E8F5F0] text-[var(--pd-teal-dark)] text-[12px] font-semibold">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </div>
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
