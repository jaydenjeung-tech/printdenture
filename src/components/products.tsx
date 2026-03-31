// ─── products.tsx ────────────────────────────────────────────────────────────
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const products = [
  {
    name: "Zirconia Crown",
    tag: "Most popular",
    tagColor: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    description: "High-strength milled zirconia. Perfect fit, natural aesthetics, long-lasting durability.",
    price: "$129",
    turnaround: "5–7 days",
    features: ["CAD/CAM milled", "Shades A1–D4", "Anterior & posterior"],
    accent: "#2563EB",
    bg: "#EFF6FF",
  },
  {
    name: "Printed Crown",
    tag: "Fast turnaround",
    tagColor: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
    description: "3D-printed resin crowns for temporaries or cost-effective permanent solutions.",
    price: "$79",
    turnaround: "3–5 days",
    features: ["SLA printed", "Temporary & permanent", "Same-day dispatch"],
    accent: "#16A34A",
    bg: "#F0FDF4",
  },
  {
    name: "Night Guard",
    tag: "High margin",
    tagColor: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    description: "Custom-fit digital night guards. Protect your patients from bruxism with precision fit.",
    price: "$89",
    turnaround: "5–7 days",
    features: ["Soft, hard & dual-laminate", "Digital scan required", "Adjustments included"],
    accent: "#D97706",
    bg: "#FFFBEB",
  },
  {
    name: "Sports Guard",
    tag: "Custom colors",
    tagColor: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]",
    description: "Impact-resistant custom sports guards. Team colors available. CE and FDA-compliant materials.",
    price: "$79",
    turnaround: "5–7 days",
    features: ["Custom color printing", "3-layer protection", "Pediatric & adult sizes"],
    accent: "#9333EA",
    bg: "#FDF4FF",
  },
];

export default function Products() {
  return (
    <section id="products" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-sm font-medium text-[#2563EB] mb-2 tracking-wide uppercase">Products</p>
          <h2 className="text-4xl font-bold text-[#1A1A1A] tracking-tight">
            Everything your practice needs
          </h2>
          <p className="mt-3 text-lg text-[#6B6B6B] max-w-xl">
            Four core restorations. One platform. No lab account required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <div
              key={p.name}
              className="group relative rounded-2xl border border-[#E2E0D8] bg-[#F8F7F4] p-6 hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-200"
            >
              {/* Color accent bar */}
              <div
                className="w-10 h-1 rounded-full mb-5"
                style={{ background: p.accent }}
              />

              <Badge className={`mb-4 text-xs font-medium px-2.5 py-0.5 border ${p.tagColor}`}>
                {p.tag}
              </Badge>

              <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{p.name}</h3>
              <p className="text-sm text-[#6B6B6B] leading-relaxed mb-5">{p.description}</p>

              <ul className="space-y-1.5 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[#4B4B4B]">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.accent }} />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="flex items-end justify-between mt-auto">
                <div>
                  <span className="text-2xl font-bold text-[#1A1A1A]">{p.price}</span>
                  <span className="text-sm text-[#6B6B6B] ml-1">/ unit</span>
                  <p className="text-xs text-[#9B9B9B] mt-0.5">{p.turnaround}</p>
                </div>
                <Link href="/order">
                  <Button
                    size="sm"
                    className="text-white text-xs h-8 px-4 rounded-lg"
                    style={{ background: p.accent }}
                  >
                    Order
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}