"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

const publicLinks = [
  { label: "Products", href: "#products" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "#how-it-works" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";

  function anchor(href: string) {
    if (href.startsWith("#")) return isHome ? href : `/${href}`;
    return href;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0D1B2A]/95 backdrop-blur-md border-b border-[#1E3347]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1D9E75] rounded-lg flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path
                d="M2 9.5c1.2-2.8 3.2-4.2 5-4.5 1.8-.3 3.5.5 5 2.5M3 11.5h8"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-semibold text-[17px] text-white">
            Print<span className="text-[#5DCAA5]">Denture</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {publicLinks.map((l) => (
            <Link
              key={l.label}
              href={anchor(l.href)}
              className="text-sm text-[#7CA0B8] hover:text-white transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/support"
            className="text-sm text-[#7CA0B8] hover:text-white transition-colors"
          >
            Support
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth"
            className="text-sm text-[#7CA0B8] hover:text-white transition-colors px-2"
          >
            Sign in
          </Link>
          <Link
            href="/auth?next=%2Forder"
            className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white text-sm px-5 h-9 rounded-lg inline-flex items-center transition-colors font-medium"
          >
            Order now
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="w-5 h-px bg-[#7CA0B8] block" />
          <span className="w-5 h-px bg-[#7CA0B8] block" />
          <span className="w-3 h-px bg-[#7CA0B8] block" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#1E3347] bg-[#0D1B2A] px-6 py-6 flex flex-col gap-4">
          {publicLinks.map((l) => (
            <Link
              key={l.label}
              href={anchor(l.href)}
              onClick={() => setOpen(false)}
              className="text-lg font-medium text-white"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/support" onClick={() => setOpen(false)} className="text-lg font-medium text-white">
            Support
          </Link>
          <hr className="border-[#1E3347]" />
          <Link href="/auth" onClick={() => setOpen(false)} className="text-[#7CA0B8]">
            Sign in
          </Link>
          <Link
            href="/auth?next=%2Forder"
            onClick={() => setOpen(false)}
            className="bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-medium text-center py-3 rounded-lg"
          >
            Order now
          </Link>
        </div>
      )}
    </nav>
  );
}
