import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#1B2B3A] text-white">
      <div className="border-b border-[#243447]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-[20px] font-semibold mb-1">
              Ready for JB Fork cases without try-in?
            </h3>
            <p className="text-[13px] text-[#7CA0B8]">
              Scan your aligned record set and order online — fewer visits, less chair time.
            </p>
          </div>
          <Link
            href="/auth?next=%2Forder"
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
              Digital denture lab for JB Fork & JB Tray practices — definitive prosthetics from
              aligned scans, no try-in required.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5A7D94] mb-4">
              Workflow
            </p>
            <ul className="space-y-2.5 text-[13px] text-[#7CA0B8]">
              <li>
                <Link href="#jb-fork" className="hover:text-white transition-colors">
                  JB Fork workflow
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="hover:text-white transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="#products" className="hover:text-white transition-colors">
                  Lab services
                </Link>
              </li>
              <li>
                <Link href="#why" className="hover:text-white transition-colors">
                  Why PrintDenture
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5A7D94] mb-4">
              Account
            </p>
            <ul className="space-y-2.5 text-[13px] text-[#7CA0B8]">
              <li>
                <Link href="/auth" className="hover:text-white transition-colors">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#5A7D94] mb-4">
              Resources
            </p>
            <ul className="space-y-2.5 text-[13px] text-[#7CA0B8]">
              <li>
                <a
                  href="https://seilglobal.com/ProstheticDentistry/?bmode=view&idx=130420299"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  JB Tray (Seil Global)
                </a>
              </li>
              <li>hello@printdenture.com</li>
              <li>California, USA</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#243447] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[12px] text-[#5A7D94]">© 2026 PrintDenture. All rights reserved.</p>
          <p className="text-[11px] text-[#5A7D94] text-center sm:text-right max-w-md">
            JB Fork & JB Tray are trademarks of their respective owners. PrintDenture is an
            independent lab service.
          </p>
        </div>
      </div>
    </footer>
  );
}
