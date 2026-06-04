import Link from "next/link";

const CATEGORIES = [
  {
    id: "complete",
    label: "Complete dentures",
    tag: "Most ordered",
    accent: "#1B2B3A",
    description:
      "Premium and economy tooth lines with custom gingiva characterization. Upper, lower, or full set with optional try-in.",
    features: ["Try-in workflow", "Premium & economy teeth", "Custom shade & mold"],
    fromPrice: 289,
    turnaround: "10–14 business days",
  },
  {
    id: "partial",
    label: "Partial dentures",
    tag: "Flexible & metal",
    accent: "#0F6E56",
    description:
      "Valplast-style flexible partials and cast metal frameworks. Digital design from scan or traditional impression.",
    features: ["Flexible or cast metal", "Clasp & saddle design", "Scan or impression"],
    fromPrice: 249,
    turnaround: "7–10 business days",
  },
  {
    id: "immediate",
    label: "Immediate / interim",
    tag: "Same-week options",
    accent: "#1D9E75",
    description:
      "Interim dentures for extractions and healing periods. Rush options for chairside delivery windows.",
    features: ["Extraction cases", "Healing denture", "Rush available"],
    fromPrice: 199,
    turnaround: "5–7 business days",
  },
  {
    id: "overdenture",
    label: "Implant overdentures",
    tag: "Locator & bar",
    accent: "#243447",
    description:
      "Locator-retained and bar overdentures for All-on-4 and implant-supported removable cases.",
    features: ["Locator / bar systems", "Implant record upload", "Surgical guide friendly"],
    fromPrice: 449,
    turnaround: "12–16 business days",
  },
];

export default function Products() {
  return (
    <section id="products" className="py-20 px-6 bg-white border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[11px] font-medium text-[#0F6E56] mb-2 tracking-[0.08em] uppercase">
            Products
          </p>
          <h2 className="text-[32px] font-semibold text-[#1B2B3A] tracking-tight mb-2">
            Every removable case your practice sends
          </h2>
          <p className="text-[15px] text-[#6B7280] max-w-xl">
            Complete, partial, immediate, and implant overdentures — one platform, no separate lab
            account required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {CATEGORIES.map((cat, index) => {
            const isFeatured = index === 0;
            return (
              <div
                key={cat.id}
                className={`flex flex-col rounded-xl p-6 transition-all duration-200 border bg-white hover:border-[#1B2B3A] ${
                  isFeatured ? "border-[#1B2B3A]" : "border-[#E5E7EB]"
                }`}
              >
                <div
                  className="w-8 h-[3px] rounded-full mb-5"
                  style={{ background: cat.accent }}
                />
                <span className="mb-3 text-[10px] font-medium px-2 py-0.5 border w-fit rounded-full bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]">
                  {cat.tag}
                </span>
                <h3 className="text-[15px] font-semibold text-[#1B2B3A] mb-1">{cat.label}</h3>
                <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">{cat.description}</p>
                <ul className="space-y-1.5 mb-5">
                  {cat.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px] text-[#4B5563]">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: cat.accent }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  <div className="mb-4">
                    <span className="text-[18px] font-semibold text-[#1B2B3A]">
                      from ${cat.fromPrice}
                    </span>
                    <span className="text-[13px] text-[#9CA3AF] ml-1">/ arch</span>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">{cat.turnaround}</p>
                  </div>
                  <Link
                    href={`/order?category=${cat.id}`}
                    className="w-full text-white text-[12px] h-8 px-3 rounded-lg inline-flex items-center justify-center font-medium transition-opacity hover:opacity-90"
                    style={{ background: cat.accent }}
                  >
                    Order
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 bg-[#F7FAF9] rounded-xl border border-[#E1F5EE]">
          <p className="text-[13px] text-[#6B7280]">
            Transparent per-arch pricing — reline & repair available after sign-in.
          </p>
          <Link
            href="/pricing"
            className="rounded-lg border border-[#9FE1CB] text-[#0F6E56] hover:bg-white text-[13px] px-4 py-2 transition-colors"
          >
            View full pricing
          </Link>
          <span className="hidden sm:inline text-[#D1D5DB]">·</span>
          <Link
            href="/auth"
            className="bg-[#1B2B3A] hover:bg-[#243447] text-white rounded-lg px-6 py-2 text-[13px] transition-colors"
          >
            Sign in to order
          </Link>
        </div>
      </div>
    </section>
  );
}
