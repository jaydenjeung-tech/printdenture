import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1B2B3A] text-white">

      {/* Top CTA bar */}
      <div className="border-b border-[#243447]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-[20px] font-semibold mb-1">Ready to simplify your lab work?</h3>
            <p className="text-[13px] text-[#7CA0B8]">No contracts. No minimums. First order ships in 5–7 days.</p>
          </div>
          <Link
            href="/order"
            className="flex-shrink-0 bg-[#1D9E75] hover:bg-[#0F6E56] text-white font-medium text-[13px] px-6 h-11 rounded-xl flex items-center transition-colors"
          >
            Start your first order →
          </Link>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#1D9E75] rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1C5 1 4 2.5 4 4.5c0 1.2.6 2.2 1.2 3L6 11h2l.8-3.5C9.4 6.7 10 5.7 10 4.5 10 2.5 9 1 7 1z" fill="white"/>
                </svg>
              </div>
              <span className="font-semibold text-[17px]">
                Print<span className="text-[#5DCAA5]">Crown</span>
              </span>
            </div>
            <p className="text-[13px] text-[#7CA0B8] leading-relaxed mb-5">
              US-based digital dental lab. Precision restorations shipped to your practice.
            </p>

            {/* Trust badges */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[12px] text-[#5A7D94]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] flex-shrink-0" />
                HIPAA compliant
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#5A7D94]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#5DCAA5] flex-shrink-0" />
                Made in California
              </div>
              <div className="flex items-center gap-2 text-[12px] text-[#5A7D94]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9FE1CB] flex-shrink-0" />
                Under 3% remake rate
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5A7D94] mb-4">Products</p>
            <ul className="space-y-2.5 text-[13px] text-[#7CA0B8]">
              <li><Link href="/order" className="hover:text-white transition-colors">Full contour zirconia</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">PFZ crown</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">Printed crown</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">Night guard</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">Sports guard</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5A7D94] mb-4">Company</p>
            <ul className="space-y-2.5 text-[13px] text-[#7CA0B8]">
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link href="/pricing"      className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/support"      className="hover:text-white transition-colors">Support</Link></li>
              <li><Link href="#"             className="hover:text-white transition-colors">Privacy policy</Link></li>
              <li><Link href="#"             className="hover:text-white transition-colors">Terms of service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5A7D94] mb-4">Contact</p>
            <ul className="space-y-2.5 text-[13px] text-[#7CA0B8]">
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                hello@printcrown.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                California, USA
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  Live support chat
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#243447] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[12px] text-[#5A7D94]">© 2025 PrintCrown. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[12px] text-[#5A7D94]">
            <span>Made in California 🇺🇸</span>
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