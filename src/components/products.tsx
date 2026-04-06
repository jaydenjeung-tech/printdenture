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
    tagColor: "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]",
    features: ["CAD/CAM milled", "Shades A1–D4", "Anterior & posterior"],
  },
  printed: {
    label: "Printed Crowns",
    tag: "Fast turnaround",
    tagColor: "bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]",
    features: ["DLP printed", "Temporary & permanent", "Same-day dispatch"],
  },
  nightguard: {
    label: "Night Guards",
    tag: "High margin",
    tagColor: "bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]",
    features: ["Soft, hard & dual-laminate", "Digital scan required", "Adjustments included"],
  },
  sportsguard: {
    label: "Sports Guards",
    tag: "Custom colors",
    tagColor: "bg-[#FDF4FF] text-[#9333EA] border-[#E9D5FF]",
    features: ["Custom color printing", "3-layer protection", "Pediatric & adult sizes"],
  },
};

const CATEGORY_ORDER = ["zirconia", "printed", "nightguard", "sportsguard"];

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Group by category, show first product per category by default
  const grouped = CATEGORY_ORDER.map((cat) => ({
    cat,
    meta: CATEGORY_META[cat],
    items: products.filter((p) => p.category === cat),
  })).filter((g) => g.items.length > 0);

  // Representative per category (lowest sort_order)
  const representatives = grouped.map((g) => g.items[0]);

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
          <>
            {/* Category overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
              {grouped.map(({ cat, meta, items }) => {
                const rep = items[0];
                const hasMore = items.length > 1;
                const isExpanded = expandedCat === cat;

                return (
                  <div key={cat} className="flex flex-col">
                    <div className="group relative rounded-2xl border border-[#E2E0D8] bg-[#F8F7F4] p-6 hover:border-[#1A1A1A] hover:shadow-lg transition-all duration-200 flex flex-col flex-1">
                      <div className="w-10 h-1 rounded-full mb-5" style={{ background: rep.accent }} />

                      {meta && (
                        <Badge className={`mb-4 text-xs font-medium px-2.5 py-0.5 border w-fit ${meta.tagColor}`}>
                          {meta.tag}
                        </Badge>
                      )}

                      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">{meta?.label || rep.name}</h3>
                      <p className="text-sm text-[#6B6B6B] leading-relaxed mb-4">{rep.description}</p>

                      {meta && (
                        <ul className="space-y-1.5 mb-5">
                          {meta.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-[#4B4B4B]">
                              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: rep.accent }} />
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-auto">
                        {/* Price */}
                        <div className="mb-4">
                          {isLoggedIn ? (
                            <div>
                              <span className="text-xl font-bold text-[#1A1A1A]">
                                from ${Math.min(...items.map(i => i.price))}
                              </span>
                              <span className="text-sm text-[#6B6B6B] ml-1">/ unit</span>
                              <p className="text-xs text-[#9B9B9B] mt-0.5">{rep.turnaround}</p>
                            </div>
                          ) : (
                            <Link href="/auth" className="text-xs text-[#2563EB] hover:underline">
                              Sign in for pricing
                            </Link>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Link href={`/order?product=${rep.id}`} className="flex-1">
                            <Button size="sm"
                              className="w-full text-white text-xs h-8 px-4 rounded-lg"
                              style={{ background: rep.accent }}>
                              Order
                            </Button>
                          </Link>
                          {hasMore && (
                            <button
                              onClick={() => setExpandedCat(isExpanded ? null : cat)}
                              className="h-8 px-2 rounded-lg border border-[#E2E0D8] text-xs text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all flex-shrink-0"
                            >
                              {items.length} options
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Expanded product list */}
                    {isExpanded && hasMore && (
                      <div className="mt-2 space-y-2">
                        {items.map((p) => (
                          <div key={p.id}
                            className="rounded-xl border border-[#E2E0D8] bg-white p-4 flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#1A1A1A] truncate">{p.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {isLoggedIn && (
                                  <span className="text-sm font-bold text-[#1A1A1A]">${p.price}</span>
                                )}
                                <span className="text-xs text-[#9B9B9B]">{p.turnaround}</span>
                              </div>
                            </div>
                            <Link href={`/order?product=${p.id}`}>
                              <Button size="sm"
                                className="text-white text-xs h-7 px-3 rounded-lg flex-shrink-0"
                                style={{ background: p.accent }}>
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

            {/* CTA */}
            {!isLoggedIn && (
              <div className="text-center py-8 bg-[#F8F7F4] rounded-2xl border border-[#E2E0D8]">
                <p className="text-sm text-[#6B6B6B] mb-3">Sign in to see pricing and place orders</p>
                <Link href="/auth">
                  <Button className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-lg px-6">
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