import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1B2B3A] text-white">
      <div className="border-b border-[#243447]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-[20px] font-semibold mb-1">Ready to send your first denture case?</h3>
            <p className="text-[13px] text-[#7CA0B8]">
              No contracts. No minimums. Most cases ship in 7–14 business days.
            </p>
          </div>
          <Link
            href="/order"
            className="flex-shrink-0 bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-medium text-[13px] px-6 h-11 rounded-xl flex items-center transition-colors"
          >
            Start your first order →
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
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
              <span className="font-semibold text-[17px]">
                Print<span className="text-[#5DCAA5]">Denture</span>
              </span>
            </div>
            <p className="text-[13px] text-[#7CA0B8] leading-relaxed mb-5">
              US-based digital dental lab for complete, partial, and implant overdenture cases —
              shipped to your practice.
            </p>
            <div className="flex flex-col gap-2">
              {["HIPAA compliant", "Made in California", "Under 3% remake rate"].map((badge, i) => (
                <div key={badge} className="flex items-center gap-2 text-[12px] text-[#5A7D94]">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{
                      background: ["#1D9E75", "#5DCAA5", "#9FE1CB"][i],
                    }}
                  />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5A7D94] mb-4">
              Products
            </p>
            <ul className="space-y-2.5 text-[13px] text-[#7CA0B8]">
              <li>
                <Link href="/order?category=complete" className="hover:text-white transition-colors">
                  Complete dentures
                </Link>
              </li>
              <li>
                <Link href="/order?category=partial" className="hover:text-white transition-colors">
                  Partial dentures
                </Link>
              </li>
              <li>
                <Link href="/order?category=immediate" className="hover:text-white transition-colors">
                  Immediate / interim
                </Link>
              </li>
              <li>
                <Link href="/order?category=overdenture" className="hover:text-white transition-colors">
                  Implant overdentures
                </Link>
              </li>
              <li>
                <Link href="/order" className="hover:text-white transition-colors">
                  Reline & repair
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5A7D94] mb-4">
              Company
            </p>
            <ul className="space-y-2.5 text-[13px] text-[#7CA0B8]">
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="/auth" className="hover:text-white transition-colors">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5A7D94] mb-4">
              Contact
            </p>
            <ul className="space-y-2.5 text-[13px] text-[#7CA0B8]">
              <li>hello@printdenture.com</li>
              <li>California, USA</li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Live support chat
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#243447] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[12px] text-[#5A7D94]">© 2026 PrintDenture. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[12px] text-[#5A7D94]">
            <span>Made in California</span>
            <span>·</span>
            <span>HIPAA compliant</span>
            <span>·</span>
            <span>Free adjustment guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
