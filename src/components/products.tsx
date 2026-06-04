import Link from "next/link";

const offerings = [
  {
    id: "complete-digital",
    label: "Complete dentures (JB Fork)",
    tag: "Primary workflow",
    accent: "#0F6E56",
    description:
      "Definitive upper and/or lower dentures from JB Fork-aligned scan sets. Designed for practices skipping try-in when records meet our digital criteria.",
    features: [
      "No try-in fabrication path",
      "Facial + IOS + CBCT alignment",
      "Premium & economy tooth lines",
    ],
    turnaround: "7–12 business days after scan approval",
  },
  {
    id: "jb-tray",
    label: "JB Tray impression cases",
    tag: "One-step impression",
    accent: "#1D9E75",
    description:
      "Cases started with JB Tray final impression and jaw relation — individual tray and wax rim steps omitted per the JB Tray protocol.",
    features: [
      "VD & centric in one visit",
      "POP bow esthetic transfer",
      "Analog or digital denture",
    ],
    turnaround: "7–12 business days",
  },
  {
    id: "overdenture",
    label: "Implant overdentures",
    tag: "JB Fork + implants",
    accent: "#378ADD",
    description:
      "Locator or bar-retained overdentures when implant position is included in the aligned CBCT / IOS dataset.",
    features: ["Locator / bar systems", "Surgical guide friendly", "Digital verification"],
    turnaround: "12–16 business days",
  },
  {
    id: "reline",
    label: "Reline & repair",
    tag: "Existing prosthesis",
    accent: "#1B2B3A",
    description:
      "Chairside reline or repair on dentures originally fabricated through PrintDenture — fast turnaround for maintenance visits.",
    features: ["Soft & hard reline", "Tooth / base repair", "Shipper included"],
    turnaround: "3–5 business days",
  },
];

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
            Optimized for JB Fork and JB Tray digital records — definitive dentures without a
            try-in when your submission meets our verification checklist.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {offerings.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#1E3347] bg-[#132337] p-6 hover:border-[#5DCAA5] transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div
                  className="w-1 h-10 rounded-full flex-shrink-0"
                  style={{ background: item.accent }}
                />
                <span className="text-[10px] font-medium text-[#5DCAA5] border border-[#1E3347] px-2 py-0.5 rounded-full">
                  {item.tag}
                </span>
              </div>
              <h3 className="text-[17px] font-semibold mb-2 -mt-6 ml-4">{item.label}</h3>
              <p className="text-[13px] text-[#7CA0B8] leading-relaxed mb-4 ml-4">{item.description}</p>
              <ul className="space-y-1.5 mb-5 ml-4">
                {item.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-[#9FE1CB]">
                    <span className="w-1 h-1 rounded-full bg-[#1D9E75]" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#5A7D94] ml-4 mb-4">{item.turnaround}</p>
              <Link
                href={`/auth?next=${encodeURIComponent(`/order?category=${item.id}`)}`}
                className="ml-4 inline-flex h-9 items-center px-4 rounded-lg text-[12px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: item.accent }}
              >
                Order this case type
              </Link>
            </div>
          ))}
        </div>

        <p className="text-[12px] text-[#5A7D94] text-center">
          JB Fork and JB Tray are products of Seil Global. PrintDenture is an independent digital
          lab service compatible with their clinical protocols.
        </p>
      </div>
    </section>
  );
}
