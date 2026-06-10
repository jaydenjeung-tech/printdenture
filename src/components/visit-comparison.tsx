import Link from "next/link";
import { JB_TRAY_GUIDE_PATH } from "@/lib/guides/jb-tray-guide";

export default function VisitComparison() {
  return (
    <section className="py-16 px-6 bg-white border-y border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[11px] font-medium text-[#0F6E56] uppercase tracking-[0.08em] mb-2">
            Fewer appointments
          </p>
          <h2 className="text-[28px] md:text-[32px] font-semibold text-[#1B2B3A] tracking-tight">
            Traditional dentures vs. JB Tray + PrintDenture
          </h2>
          <p className="text-[15px] text-[#6B7280] mt-3 max-w-2xl mx-auto">
            Per the{" "}
            <Link href={JB_TRAY_GUIDE_PATH} className="text-[#0F6E56] font-medium hover:underline">
              JB Tray clinical guide
            </Link>{" "}
            protocol, JB Tray can reduce visits from five to three — in some cases two. PrintDenture
            removes the try-in visit by manufacturing from your verified digital record set.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F7FAF9] p-6 md:p-8">
            <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wider mb-4">
              Conventional workflow
            </p>
            <ul className="space-y-3">
              {[
                "Preliminary impressions",
                "Custom tray & border mold",
                "Final impression + jaw relation",
                "Try-in (often multiple)",
                "Delivery & adjustment",
              ].map((visit, i) => (
                <li key={visit} className="flex items-center gap-3 text-[14px] text-[#4B5563]">
                  <span className="w-7 h-7 rounded-full bg-[#E5E7EB] text-[#6B7280] text-[12px] font-semibold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  {visit}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[13px] text-[#9CA3AF]">Typically 4–5+ patient visits</p>
          </div>

          <div className="rounded-2xl border-2 border-[#0F6E56] bg-[#E1F5EE]/40 p-6 md:p-8 relative">
            <span className="absolute -top-3 right-6 bg-[#0F6E56] text-white text-[10px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
              PrintDenture path
            </span>
            <p className="text-[12px] font-semibold text-[#085041] uppercase tracking-wider mb-4">
              JB Tray / JB Fork + PrintDenture
            </p>
            <ul className="space-y-3">
              {[
                {
                  label: "Records visit — JB Tray or JB Fork",
                  detail: "One-step impression + jaw relation; optional POP Bow & digital alignment",
                },
                {
                  label: "Scan & order — your office",
                  detail: "IOS / model / CBCT scan uploaded to PrintDenture",
                },
                {
                  label: "Delivery visit — definitive denture",
                  detail: "No try-in — lab fabricates from verified digital data",
                },
              ].map((visit, i) => (
                <li key={visit.label} className="flex gap-3">
                  <span className="w-7 h-7 rounded-full bg-[#0F6E56] text-white text-[12px] font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-[#0F2336]">{visit.label}</p>
                    <p className="text-[12px] text-[#085041] mt-0.5">{visit.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[14px] font-semibold text-[#0F6E56]">
              As few as 2 patient visits to delivery
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
