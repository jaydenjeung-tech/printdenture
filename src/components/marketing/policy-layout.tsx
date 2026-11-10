import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";

export const POLICY_UPDATED = "November 10, 2026";
export const POLICY_EMAIL = "infor@printdenture.com";

export function PolicyLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <MarketingShell>
      <article className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-3">
          Policies
        </p>
        <h1 className="text-[clamp(1.75rem,3vw,2.4rem)] font-semibold tracking-[-0.03em] text-[var(--pd-navy)]">
          {title}
        </h1>
        <p className="text-[14px] text-[var(--pd-muted)] mt-3">Updated {POLICY_UPDATED}</p>
        <p className="text-[16px] leading-relaxed text-[var(--pd-slate)] mt-6">{description}</p>
        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[var(--pd-slate)]">{children}</div>
        <p className="mt-12 text-[14px] text-[var(--pd-slate)]">
          Questions:{" "}
          <a className="text-[var(--pd-teal-dark)] underline" href={`mailto:${POLICY_EMAIL}`}>
            {POLICY_EMAIL}
          </a>
        </p>
        <p className="mt-4 text-[13px] text-[var(--pd-muted)]">
          <Link href="/policies/terms" className="hover:text-[var(--pd-navy)]">Terms</Link>
          {" · "}
          <Link href="/policies/privacy" className="hover:text-[var(--pd-navy)]">Privacy</Link>
          {" · "}
          <Link href="/policies/refund" className="hover:text-[var(--pd-navy)]">Refunds</Link>
        </p>
      </article>
    </MarketingShell>
  );
}

export function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[18px] font-semibold text-[var(--pd-navy)] mb-2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
