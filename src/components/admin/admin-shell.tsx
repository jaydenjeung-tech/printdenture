"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_FOOTER_LINKS, ADMIN_NAV, isAdminNavActive } from "@/lib/admin-nav";

const NAV_ICONS: Record<string, ReactNode> = {
  "/admin": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  "/admin/orders": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.945.693 2.166 1.638m-7.032 0a2.25 2.25 0 00-1.923 1.004L6.75 6.75M6 21h12" />
    </svg>
  ),
  "/admin/customers": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  "/admin/products": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  "/admin/support": (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
  ),
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const flush = pathname === "/admin/support";

  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-[#E2E0D8] bg-white">
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-[#E2E0D8]">
          <Link href="/" className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 bg-[#1D9E75] rounded-lg flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path
                  d="M2 9.5c1.2-2.8 3.2-4.2 5-4.5 1.8-.3 3.5.5 5 2.5M3 11.5h8"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-[#1A1A1A] leading-tight truncate">
                Print<span className="text-[#0F6E56]">Denture</span>
              </p>
              <p className="text-[10px] font-medium text-[#9B9B9B] uppercase tracking-wider">Admin</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const active = isAdminNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#E8F5F0] text-[#0F6E56]"
                    : "text-[#4B4B4B] hover:bg-[#F8F7F4] hover:text-[#1A1A1A]"
                }`}
              >
                <span className={active ? "text-[#0F6E56]" : "text-[#9B9B9B]"}>
                  {NAV_ICONS[item.href]}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-[#E2E0D8] space-y-0.5">
          {ADMIN_FOOTER_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#6B6B6B] hover:bg-[#F8F7F4] hover:text-[#1A1A1A] transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors"
          >
            ← Back to site
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0 min-h-screen">
        <header className="md:hidden h-14 px-4 flex items-center justify-between border-b border-[#E2E0D8] bg-white shrink-0">
          <Link href="/admin" className="font-semibold text-sm text-[#1A1A1A]">
            Print<span className="text-[#0F6E56]">Denture</span> Admin
          </Link>
          <select
            className="text-sm border border-[#E2E0D8] rounded-lg px-2 py-1.5 bg-white"
            value={pathname}
            onChange={(e) => {
              window.location.href = e.target.value;
            }}
          >
            {ADMIN_NAV.map((item) => (
              <option key={item.href} value={item.href}>
                {item.label}
              </option>
            ))}
          </select>
        </header>

        {flush ? (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
        ) : (
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
            {children}
          </main>
        )}
      </div>
    </div>
  );
}
