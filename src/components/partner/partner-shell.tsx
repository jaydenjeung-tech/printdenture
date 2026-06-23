"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import PrintDentureLogo from "@/components/logo";
import { createClient } from "@/lib/supabase";
import { PARTNER_NAV, PARTNER_NAV_SECTIONS, isPartnerNavActive } from "@/lib/partner-nav";

const NAV_ICONS: Record<string, ReactNode> = {
  "/partner": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.945.693 2.166 1.638m-7.032 0a2.25 2.25 0 00-1.923 1.004L6.75 6.75M6 21h12"
      />
    </svg>
  ),
};

export default function PartnerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[var(--pd-bg)]">
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-[var(--pd-border)] bg-white">
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-[var(--pd-border)]">
          <Link href="/partner" className="flex items-center gap-2.5 min-w-0 rounded-lg overflow-hidden shrink-0">
            <PrintDentureLogo variant="dark" size="sm" />
          </Link>
          <p className="text-[10px] font-medium text-[var(--pd-muted)] uppercase tracking-wider shrink-0">
            Partner
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
          {PARTNER_NAV_SECTIONS.map((section) => (
            <div key={section.id}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isPartnerNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? "bg-[#E8F5F0] text-[var(--pd-teal-dark)]"
                          : "text-[var(--pd-slate)] hover:bg-[var(--pd-surface)] hover:text-[var(--pd-navy)]"
                      }`}
                    >
                      <span className={active ? "text-[var(--pd-teal-dark)]" : "text-[var(--pd-muted)]"}>
                        {NAV_ICONS[item.href]}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-[var(--pd-border)]">
          <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">
            Account
          </p>
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--pd-muted)] hover:bg-[var(--pd-surface)] hover:text-[var(--pd-navy)] transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 min-h-screen">
        <header className="md:hidden h-14 px-4 flex items-center justify-between border-b border-[var(--pd-border)] bg-white shrink-0">
          <Link href="/partner" className="flex items-center gap-2 min-w-0">
            <PrintDentureLogo variant="dark" size="sm" />
            <span className="text-[10px] font-medium text-[var(--pd-muted)] uppercase tracking-wider">
              Partner
            </span>
          </Link>
          <select
            className="text-sm border border-[var(--pd-border)] rounded-lg px-2 py-1.5 bg-white"
            value={pathname.startsWith("/partner/cases/") ? "/partner" : pathname}
            onChange={(e) => {
              window.location.href = e.target.value;
            }}
          >
            {PARTNER_NAV.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
