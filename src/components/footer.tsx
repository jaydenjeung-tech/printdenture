import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Top CTA bar */}
      <div className="border-b border-[#2A2A2A]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-1">Ready to simplify your lab work?</h3>
            <p className="text-sm text-[#9B9B9B]">No contracts. No minimums. First order ships in 5–7 days.</p>
          </div>
          <Link href="/order"
            className="flex-shrink-0 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-sm px-6 h-11 rounded-xl flex items-center transition-colors">
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
              <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
                <span className="text-[#1A1A1A] text-xs font-bold">PC</span>
              </div>
              <span className="font-semibold text-lg">
                Print<span className="text-[#60A5FA]">Crown</span>
              </span>
            </div>
            <p className="text-sm text-[#9B9B9B] leading-relaxed mb-5">
              US-based digital dental lab. Precision restorations shipped to your practice.
            </p>
            {/* Trust badges */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                <svg className="w-3.5 h-3.5 text-[#16A34A]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1a9 9 0 100 18A9 9 0 0010 1zm3.707 7.293a1 1 0 00-1.414-1.414L9 10.172 7.707 8.879a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                HIPAA Compliant
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                <svg className="w-3.5 h-3.5 text-[#60A5FA]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
                </svg>
                Made in California
              </div>
              <div className="flex items-center gap-2 text-xs text-[#6B6B6B]">
                <svg className="w-3.5 h-3.5 text-[#FBBF24]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Under 3% remake rate
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-4">Products</p>
            <ul className="space-y-2.5 text-sm text-[#9B9B9B]">
              <li><Link href="/order" className="hover:text-white transition-colors">Full Contour Zirconia</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">PFZ Crown</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">Printed Crown</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">Night Guard</Link></li>
              <li><Link href="/order" className="hover:text-white transition-colors">Sports Guard</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-4">Company</p>
            <ul className="space-y-2.5 text-sm text-[#9B9B9B]">
              <li><Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Support</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Privacy policy</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Terms of service</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6B6B6B] mb-4">Contact</p>
            <ul className="space-y-2.5 text-sm text-[#9B9B9B]">
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                hello@printcrown.com
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                California, USA
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  Live support chat
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#2A2A2A] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#6B6B6B]">© 2025 PrintCrown. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs text-[#6B6B6B]">
            <span>Made in California 🇺🇸</span>
            <span>·</span>
            <span>HIPAA Compliant</span>
            <span>·</span>
            <span>Free remake guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}