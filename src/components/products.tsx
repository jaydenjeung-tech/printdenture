import Link from "next/link";
import { COMPLETE_DENTURE_INTRO } from "@/lib/products/complete-denture-records";
import { DENTURE_SERVICE_GROUPS } from "@/lib/products/denture-service-groups";

const SERVICE_PAGE_GROUPS = DENTURE_SERVICE_GROUPS;

const OFFERING_DETAILS: Record<
  string,
  {
    tag: string;
    accent: string;
    features: string[];
    turnaround: string;
    recordPaths?: { name: string; detail: string }[];
  }
> = {
  complete: {
    tag: "Full arch",
    accent: "#0F6E56",
    recordPaths: [
      {
        name: "JB Fork Radi+",
        detail: "When Radi+ aligns facial scan, CBCT, and IOS — implant & digital full-arch cases.",
      },
      {
        name: "JB Tray",
        detail: "When you capture final impressions + VD/CR chairside without Radi+ — routine complete dentures.",
      },
    ],
    features: [
      "Upper, lower, full set & immediate",
      "Lab CAD design & fabrication",
      "No try-in when records meet criteria",
    ],
    turnaround: "5–12 business days",
  },
  partial: {
    tag: "Partially edentulous",
    accent: "#1D9E75",
    features: [
      "Flexible & cast partial",
      "Removable partial upper/lower",
      "Temporary flipper",
    ],
    turnaround: "3–14 business days",
  },
  overdenture: {
    tag: "Implants",
    accent: "#378ADD",
    features: ["Locator / bar / All-on-X", "JB Fork Radi+ definitive records", "Lab design & fabrication"],
    turnaround: "12–18 business days",
  },
  removable: {
    tag: "Guards",
    accent: "#D97706",
    features: ["Night guard", "Sports guard", "Soft, hard & dual-laminate options"],
    turnaround: "5–7 business days",
  },
  reline: {
    tag: "Existing prosthesis",
    accent: "#1B2B3A",
    features: ["Soft & hard reline", "Tooth / base repair", "Mail-in shipper available"],
    turnaround: "2–5 business days",
  },
};

export default function Products() {
  return (
    <section id="products" className="py-20 px-6 bg-[#0D1B2A] text-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[11px] font-medium text-[#5DCAA5] mb-2 tracking-[0.08em] uppercase">
            Lab services
          </p>
          <h2 className="text-[32px] font-semibold tracking-tight mb-2">
            What we fabricate from your scans
          </h2>
          <p className="text-[15px] text-[#7CA0B8] max-w-xl">
            Choose by prosthesis type — Complete, Partial, implant cases, removables (guards), or reline/repair.
            Our lab handles design and fabrication after you upload records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {SERVICE_PAGE_GROUPS.map((group) => {
            const details = OFFERING_DETAILS[group.id];
            const description =
              group.id === "complete" ? COMPLETE_DENTURE_INTRO.description : group.description;

            return (
              <div
                key={group.id}
                className="rounded-xl border border-[#1E3347] bg-[#132337] p-6 hover:border-[#5DCAA5] transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div
                    className="w-1 h-10 rounded-full flex-shrink-0"
                    style={{ background: details.accent }}
                  />
                  <span className="text-[10px] font-medium text-[#5DCAA5] border border-[#1E3347] px-2 py-0.5 rounded-full">
                    {details.tag}
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold mb-2 -mt-6 ml-4">{group.label}</h3>
                <p className="text-[13px] text-[#7CA0B8] leading-relaxed mb-4 ml-4">{description}</p>

                {details.recordPaths && (
                  <div className="ml-4 mb-4 space-y-2">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#5A7D94]">
                      Record options
                    </p>
                    {details.recordPaths.map((path) => (
                      <div
                        key={path.name}
                        className="rounded-lg border border-[#1E3347] bg-[#0D1B2A]/40 px-3 py-2"
                      >
                        <p className="text-[13px] font-medium text-[#9FE1CB]">{path.name}</p>
                        <p className="text-[12px] text-[#5A7D94] mt-0.5 leading-relaxed">{path.detail}</p>
                      </div>
                    ))}
                  </div>
                )}

                <ul className="space-y-1.5 mb-5 ml-4">
                  {details.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-[#9FE1CB]">
                      <span className="w-1 h-1 rounded-full bg-[#1D9E75]" />
                      {f}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-[#5A7D94] ml-4 mb-4">{details.turnaround}</p>
                <div className="ml-4 flex flex-wrap gap-2">
                  {(group.id === "complete" || group.id === "overdenture") && (
                    <Link
                      href={`/auth?next=${encodeURIComponent("/shop")}`}
                      className="inline-flex h-9 items-center px-4 rounded-lg text-[12px] font-medium text-[#0D1B2A] bg-[#5DCAA5] hover:opacity-90 transition-opacity"
                    >
                      Get starter kit
                    </Link>
                  )}
                  <Link
                    href={`/auth?next=${encodeURIComponent("/order")}`}
                    className="inline-flex h-9 items-center px-4 rounded-lg text-[12px] font-medium text-white transition-opacity hover:opacity-90"
                    style={{ background: details.accent }}
                  >
                    {group.id === "complete" || group.id === "overdenture"
                      ? "Submit lab case"
                      : `Order ${group.label.toLowerCase()}`}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
