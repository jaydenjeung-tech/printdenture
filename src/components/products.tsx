// ─── components/products.tsx ─────────────────────────────────────────────────
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";

type Product = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  accent: string;
  active: boolean;
  sort_order: number;
};

const CATEGORY_META: Record<string, {
  tag: string;
  tagColor: string;
  features: string[];
}> = {
  zirconia: {
    tag: "Most popular",
    tagColor: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    features: ["CAD/CAM milled", "Shades A1–D4", "Anterior & posterior"],
  },
  printed: {
    tag: "Fast turnaround",
    tagColor: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
    features: ["SLA printed", "Temporary & permanent", "Same-day dispatch"],
  },
  nightguard: {
    tag: "High margin",
    tagColor: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    features: ["Soft, hard & dual-laminate", "Digital scan required", "Adjustments included"],
  },
  sportsguard: {
    tag: "Custom colors",
    tagColor: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]",
    features: ["Custom color printing", "3-layer protection", "Pediatric & adult sizes"],
  },
};

// 카테고리별 대표 제품만 표시 (sort_order 가장 낮은 것)
function getRepresentatives(products: Product[]): Product[] {
  const map = new Map<string, Product>();
  for (const p of products) {
    const existing = map.get(p.category);
    if (!existing || p.sort_order < existing.sort_order) {
      map.set(p.category, p);
    }
  }
  return ["zirconia", "printed", "nightguard", "sportsguard"]
    .map((cat) => map.get(cat))
    .filter(Boolean) as Product[];
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order")
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  const displayed = getRepresentatives(products);

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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-[#E2E0D8] bg-[#F8F7F4] p-6 animate-pulse">
                <div className="w-10 h-1 rounded-full bg-[#E2E0D8] mb-5" />
                <div className="w-20 h-5 rounded bg-[#E2E0D8] mb-4" />
                <div className="w-full h-4 rounded bg-[#E2E0D8] mb-2" />
                <div className="w-3/4 h-4 rounded bg-[#E2E0D8] mb-5" />
                <div className="w-16 h-8 rounded bg-[#E2E0D8] mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayed.map((p) => {
              const meta = CATEGORY_META[p.category];
              return (
                <div key={p.id}
                  className="group relative rounded-2xl border border-[#E2E0D8] bg-[#F8F7F4] p-6 hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-200 flex flex-col">
                  <div className="w-10 h-1 rounded-full mb-5" style={{ background: p.accent }} />

                  {meta && (
                    <Badge className={`mb-4 text-xs font-medium px-2.5 py-0.5 border w-fit ${meta.tagColor}`}>
                      {meta.tag}
                    </Badge>
                  )}

                  <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">{p.name}</h3>
                  <p className="text-sm text-[#6B6B6B] leading-relaxed mb-5">{p.description}</p>

                  {meta && (
                    <ul className="space-y-1.5 mb-6">
                      {meta.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-[#4B4B4B]">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.accent }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex items-end justify-between mt-auto">
                    <div>
                      <Link href="/pricing" className="text-xs text-[#2563EB] hover:underline">
                       Sign in for pricing →
                     </Link>
                    </div>
                    <Link href="/order">
                      <Button size="sm"
                        className="text-white text-xs h-8 px-4 rounded-lg"
                        style={{ background: p.accent }}>
                        Order
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}