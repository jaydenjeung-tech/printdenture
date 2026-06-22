import Link from "next/link";
import PrintDentureLogo from "@/components/logo";
import { NAV_LINKS } from "@/lib/marketing/copy";

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--pd-navy)] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <PrintDentureLogo variant="dark" size="md" />
            <p className="text-[13px] text-[#8BB3C8] leading-relaxed mt-4 max-w-xs">
              A clinically-developed capture workflow that cuts denture chair time in half — from
              capture to finished prosthesis, in one place.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A7D94] mb-4">
              Product
            </p>
            <ul className="space-y-2.5 text-[13px] text-[#8BB3C8]">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A7D94] mb-4">
              Account
            </p>
            <ul className="space-y-2.5 text-[13px] text-[#8BB3C8]">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Provider login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Register your practice
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  Provider portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5A7D94] mb-4">
              Company
            </p>
            <ul className="space-y-2.5 text-[13px] text-[#8BB3C8]">
              <li>
                <a
                  href="https://printcrown.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  PrintCrown
                </a>
              </li>
              <li>
                <a href="mailto:infor@printdenture.com" className="hover:text-white transition-colors">
                  infor@printdenture.com
                </a>
              </li>
              <li>California, USA</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between gap-4 text-[12px] text-[#5A7D94]">
          <p>© {new Date().getFullYear()} PrintDenture. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>FDA-registered capture devices</span>
            <span>Operated by IDOC Dental Lab</span>
          </div>
        </div>

        <p className="text-[11px] text-[#5A7D94] mt-4 leading-relaxed max-w-3xl">
          {/* TODO: Confirm exact FDA registration language with legal */}
          JB Tray, JB Fork, and POP Bow are clinical capture/recording devices. PrintDenture is an
          independent U.S. provider of the workflow and lab services — not affiliated with the device
          inventor&apos;s institution beyond licensing.
        </p>
      </div>
    </footer>
  );
}
