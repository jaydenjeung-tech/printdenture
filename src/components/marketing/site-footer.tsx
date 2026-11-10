import Link from "next/link";
import PrintDentureLogo from "@/components/logo";
import { NAV_LINKS, LEARN_MORE_LINKS, LAB_PARTNER } from "@/lib/marketing/copy";
import { LabPartnerLink } from "@/components/marketing/lab-partner";

export default function SiteFooter({ labName }: { labName?: string }) {
  const partnerName = labName ?? LAB_PARTNER.name;
  return (
    <footer className="bg-[var(--pd-navy)] text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <PrintDentureLogo variant="dark" size="md" />
            <p className="text-[12px] font-medium text-[#8BB3C8] mt-3">
              Lab partner:{" "}
              <LabPartnerLink className="text-white hover:text-[#C5DCE8]">{partnerName}</LabPartnerLink>
            </p>
            <p className="text-[13px] text-[#8BB3C8] leading-relaxed mt-3 max-w-xs">
              Try-in on visit 2. A third visit only if it needs a change.
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
              {LEARN_MORE_LINKS.filter((link) => link.href !== "/how-it-works" && link.href !== "/pricing").map((link) => (
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
                <Link href="/auth" className="hover:text-white transition-colors">
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
                <Link href="/" className="hover:text-white transition-colors">
                  PrintDenture
                </Link>
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
            <LabPartnerLink className="text-[#5A7D94] hover:text-[#8BB3C8] no-underline hover:underline">
              {partnerName} — case fulfillment
            </LabPartnerLink>
            <span>FDA-registered capture devices</span>
          </div>
        </div>

        <p className="text-[11px] text-[#5A7D94] mt-4 leading-relaxed max-w-3xl">
          {/* TODO: Confirm exact FDA registration language with legal */}
          JB Tray and POP Bow are clinical capture/recording devices. PrintDenture is an
          independent U.S. provider of the workflow and lab services — not affiliated with the device
          inventor&apos;s institution beyond licensing.
        </p>
      </div>
    </footer>
  );
}
