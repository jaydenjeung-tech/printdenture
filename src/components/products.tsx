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
  label: string;
}> = {
  zirconia: {
    label: "Zirconia Crowns",
    tag: "Most popular",
    tagColor: "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
    features: ["CAD/CAM milled", "Shades A1–D4", "Anterior & posterior"],
  },
  printed: {
    label: "Printed Crowns",
    tag: "Fast turnaround",
    tagColor: "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
    features: ["DLP printed", "Temporary & permanent", "Same-day dispatch"],
  },
  nightguard: {
    label: "Night Guards",
    tag: "High margin",
    tagColor: "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
    features: ["Soft, hard & dual-laminate", "Digital scan required", "Adjustments included"],
  },
  sportsguard: {
    label: "Sports Guards",
    tag: "Custom colors",
    tagColor: "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
    features: ["Custom color printing", "3-layer protection", "Pediatric & adult sizes"],
  },
};

const CATEGORY_ORDER = ["zirconia", "printed", "nightguard", "sportsguard"];

// Slate & Teal accent per category (overrides DB accent for UI consistency)
const CATEGORY_ACCENT: Record<string, string> = {
  zirconia:   "#1B2B3A",
  printed:    "#0F6E56",
  nightguard: "#1D9E75",
  sportsguard:"#243447",
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const [{ data: userData }, { data: productsData }] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from("products").select("*").eq("active", true).order("sort_order"),
      ]);
      setIsLoggedIn(!!userData.user);
      setProducts(productsData || []);
      setLoading(false);
    }
    load();
  }, []);

  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    meta: CATEGORY_META[cat],
    items: products.filter((p) => p.category === cat),
    accent: CATEGORY_ACCENT[cat],
  })).filter((g) => g.items.length > 0);

  return (
    <section id="products" className="py-20 px-6 bg-white border-t border-[#E5E7EB]">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-[11px] font-medium text-[#0F6E56] mb-2 tracking-[0.08em] uppercase">
            Products
          </p>
          <h2 className="text-[32px] font-semibold text-[#1B2B3A] tracking-tight mb-2">
            Everything your practice needs
          </h2>
          <p className="text-[15px] text-[#6B7280] max-w-xl">
            Four core restorations. One platform. No lab account required.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-[#E5E7EB] bg-[#F7FAF9] p-6 animate-pulse">
                <div className="w-10 h-1 rounded-full bg-[#E5E7EB] mb-5" />
                <div className="w-20 h-4 rounded bg-[#E5E7EB] mb-4" />
                <div className="w-full h-3 rounded bg-[#E5E7EB] mb-2" />
                <div className="w-3/4 h-3 rounded bg-[#E5E7EB] mb-5" />
                <div className="w-16 h-8 rounded bg-[#E5E7EB] mt-auto" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {grouped.map(({ cat, meta, items, accent }) => {
                const rep       = items[0];
                const hasMore   = items.length > 1;
                const isExpanded = expandedCat === cat;
                const isFeatured = cat === "zirconia";

                return (
                  <div key={cat} className="flex flex-col">
                    <div className={`
                      flex flex-col flex-1 rounded-xl p-6 transition-all duration-200
                      border bg-white hover:border-[#1B2B3A]
                      ${isFeatured ? "border-[#1B2B3A]" : "border-[#E5E7EB]"}
                    `}>
                      {/* Accent bar */}
                      <div
                        className="w-8 h-[3px] rounded-full mb-5"
                        style={{ background: accent }}
                      />

                      {/* Tag */}
                      {meta && (
                        <Badge className={`mb-3 text-[10px] font-medium px-2 py-0.5 border w-fit ${meta.tagColor}`}>
                          {meta.tag}
                        </Badge>
                      )}

                      {/* Title + description */}
                      <h3 className="text-[15px] font-semibold text-[#1B2B3A] mb-1">
                        {meta?.label || rep.name}
                      </h3>
                      <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">
                        {rep.description}
                      </p>

                      {/* Features */}
                      {meta && (
                        <ul className="space-y-1.5 mb-5">
                          {meta.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-[13px] text-[#4B5563]">
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ background: accent }}
                              />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Price + actions */}
                      <div className="mt-auto">
                        <div className="mb-4">
                          {isLoggedIn ? (
                            <div>
                              <span className="text-[18px] font-semibold text-[#1B2B3A]">
                                from ${Math.min(...items.map(i => i.price))}
                              </span>
                              <span className="text-[13px] text-[#9CA3AF] ml-1">/ unit</span>
                              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{rep.turnaround}</p>
                            </div>
                          ) : (
                            <Link href="/auth" className="text-[12px] text-[#0F6E56] hover:underline">
                              Sign in for pricing
                            </Link>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Link href={`/order?product=${rep.id}`} className="flex-1">
                            <Button
                              size="sm"
                              className="w-full text-white text-[12px] h-8 px-3 rounded-lg"
                              style={{ background: accent }}
                            >
                              Order
                            </Button>
                          </Link>
                          {hasMore && (
                            <button
                              onClick={() => setExpandedCat(isExpanded ? null : cat)}
                              className="h-8 px-2.5 rounded-lg border border-[#E5E7EB] text-[11px] text-[#6B7280] hover:border-[#1B2B3A] hover:text-[#1B2B3A] transition-all flex-shrink-0 whitespace-nowrap"
                            >
                              {items.length} options
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded options */}
                    {isExpanded && hasMore && (
                      <div className="mt-2 space-y-1.5">
                        {items.map((p) => (
                          <div
                            key={p.id}
                            className="rounded-lg border border-[#E5E7EB] bg-[#F7FAF9] px-4 py-3 flex items-center justify-between gap-3"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-[#1B2B3A] truncate">{p.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {isLoggedIn && (
                                  <span className="text-[13px] font-semibold text-[#1B2B3A]">${p.price}</span>
                                )}
                                <span className="text-[11px] text-[#9CA3AF]">{p.turnaround}</span>
                              </div>
                            </div>
                            <Link href={`/order?product=${p.id}`}>
                              <Button
                                size="sm"
                                className="text-white text-[11px] h-7 px-3 rounded-lg flex-shrink-0"
                                style={{ background: accent }}
                              >
                                Order
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Sign-in CTA */}
            {!isLoggedIn && (
              <div className="text-center py-8 bg-[#F7FAF9] rounded-xl border border-[#E1F5EE]">
                <p className="text-[13px] text-[#6B7280] mb-3">
                  Sign in to see pricing and place orders
                </p>
                <Link href="/auth">
                  <Button className="bg-[#1B2B3A] hover:bg-[#243447] text-white rounded-lg px-6 text-[13px]">
                    Sign in to view pricing
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}