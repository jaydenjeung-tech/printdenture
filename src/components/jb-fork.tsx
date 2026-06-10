import Image from "next/image";
import Link from "next/link";
import { JB_FORK_GUIDE_PATH } from "@/lib/guides/jb-fork-guide";
import { JB_TRAY_GUIDE_PATH } from "@/lib/guides/jb-tray-guide";

const highlights = [
  "Final impression, VD, and centric relation in one chairside visit",
  "Radi+ markers align facial scan, CBCT, and intraoral scans",
  "Complete & overdenture cases on PrintDenture — often without try-in",
];

export default function JBFork() {
  return (
    <section id="jb-fork" className="py-20 px-6 bg-[#F7FAF9] border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-[11px] font-medium text-[#0F6E56] uppercase tracking-[0.08em] mb-2">
              JB & JD Design · PNUADD
            </p>
            <h2 className="text-[32px] font-semibold text-[#1B2B3A] tracking-tight leading-tight mb-4">
              JB Fork Radi+
            </h2>
            <p className="text-[15px] text-[#6B7280] leading-relaxed mb-5">
              An inter-maxillary jaw-relation device that replaces occlusal wax rims. Capture aligned
              digital datasets for edentulous and full-arch cases — then send scans to PrintDenture.
            </p>
            <ul className="space-y-2 mb-8">
              {highlights.map((item) => (
                <li key={item} className="flex gap-2.5 text-[14px] text-[#4B5563] leading-relaxed">
                  <span className="text-[#0F6E56] shrink-0 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <Link
                href={JB_FORK_GUIDE_PATH}
                className="h-11 px-5 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white text-sm font-medium inline-flex items-center justify-center transition-colors"
              >
                Clinical guide & videos
              </Link>
              <Link
                href="/shop?family=jb_fork"
                className="h-11 px-5 rounded-xl border border-[#E2E0D8] bg-white hover:border-[#0F6E56] text-sm font-medium text-[#1B2B3A] inline-flex items-center justify-center transition-colors"
              >
                Order JB Fork kits
              </Link>
              <Link
                href="/order"
                className="h-11 px-5 rounded-xl border border-[#E2E0D8] bg-[#F7FAF9] hover:border-[#1A1A1A] text-sm font-medium text-[#1A1A1A] inline-flex items-center justify-center transition-colors"
              >
                Start a lab case
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-sm">
            <Image
              src="/images/jb-fork/product.jpg"
              alt="JB Fork Radi+ impression and jaw relation device"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>

        <p className="text-[12px] text-[#9CA3AF] text-center mt-10 max-w-2xl mx-auto leading-relaxed">
          Order one box (ten units, no POP Bow) from our shop. Optional ADD POP Bow pouch sold separately. Per PNUADD, most record visits use{" "}
          <Link href={JB_FORK_GUIDE_PATH} className="text-[#0F6E56] font-medium hover:underline">
            JB Fork Radi+
          </Link>{" "}
          or{" "}
          <Link href={JB_TRAY_GUIDE_PATH} className="text-[#0F6E56] font-medium hover:underline">
            JB Tray
          </Link>{" "}
          — not both at once. All-on-X definitive records are typically Fork (Radi+). Some digital
          complete workflows use Tray impressions, then Fork after scan — see the protocol guide on
          the homepage.
        </p>
      </div>
    </section>
  );
}
