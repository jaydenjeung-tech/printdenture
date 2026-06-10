"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createAppClient } from "@/lib/supabase";
import { useState, useEffect } from "react";
import {
  CURRENT_SITE,
  CROWN_CATEGORIES,
  DENTURE_CATEGORIES,
  filterProductsForSite,
} from "@/lib/products/site-catalog";
import {
  COMPLETE_DENTURE_INTRO,
} from "@/lib/products/complete-denture-records";
import {
  DENTURE_SERVICE_GROUPS,
  PRODUCT_CATEGORY_SECTION_LABELS,
} from "@/lib/products/denture-service-groups";
import { formatPricingCardPrice } from "@/lib/products/arch-pricing";

type Product = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  accent: string;
  sites?: string[] | null;
};

const CATEGORY_META: Record<string, {
  label: string;
  description: string;
  features: string[];
}> = {
  zirconia: {
    label: "Zirconia Crowns",
    description: "Precision-milled zirconia restorations for long-lasting, natural aesthetics.",
    features: ["CAD/CAM milled", "Shades A1–D4", "Anterior & posterior", "Free remake guarantee"],
  },
  printed: {
    label: "Printed Crowns",
    description: "3D-printed resin crowns for fast, cost-effective restorations.",
    features: ["SLA printed", "Temporary & permanent", "Same-day dispatch", "Free remake guarantee"],
  },
  nightguard: {
    label: "Night Guards",
    description: "Custom-fit digital night guards to protect against bruxism.",
    features: ["Soft, hard & dual-laminate", "Digital scan required", "Adjustments included", "Free remake guarantee"],
  },
  sportsguard: {
    label: "Sports Guards",
    description: "Impact-resistant custom sports guards with team color options.",
    features: ["Custom color printing", "3-layer protection", "Pediatric & adult sizes", "Free remake guarantee"],
  },
  implant: {
    label: "Implant Crowns",
    description: "Custom implant restorations from your scan and lab prescription.",
    features: ["Compatible with major platforms", "Shade matching", "Rush options", "Free remake guarantee"],
  },
  complete: {
    label: "Complete",
    description: COMPLETE_DENTURE_INTRO.description,
    features: ["JB Fork or JB Tray records", "Immediate options", "Lab CAD design", "Free remake guarantee"],
  },
  partial: {
    label: "Partial",
    description: "Flexible, cast, removable partials, and temporary flippers for partially edentulous arches.",
    features: ["Flexible & cast partial", "Removable partial & flipper", "Digital clasp design", "Free remake guarantee"],
  },
  immediate: {
    label: "Immediate",
    description: "Delivery dentures at or shortly after extraction — included under Complete cases.",
    features: ["Fast turnaround", "Pre-op scan workflow", "Follow-up reline ready", "Free remake guarantee"],
  },
  overdenture: {
    label: "Overdenture / All-on-X",
    description: "Locator, bar-retained overdentures, and full-arch All-on-X implant cases.",
    features: ["Implant-level records", "Bar, locator & All-on-X", "Lab design & fab", "Free remake guarantee"],
  },
  reline: {
    label: "Reline / repair",
    description: "Hard and soft relines, repairs, and adjustments on existing prostheses.",
    features: ["Mail-in or digital", "Same-week options", "Quality check included", "Free remake guarantee"],
  },
  removable: {
    label: "Removables",
    description: "Custom night guards and sports guards from intraoral scans.",
    features: ["Soft, hard & dual-laminate", "Custom colors", "Digital scan required", "Free remake guarantee"],
  },
};

const SERVICE_GROUP_FEATURES: Record<string, string[]> = {
  complete: CATEGORY_META.complete.features,
  partial: CATEGORY_META.partial.features,
  overdenture: CATEGORY_META.overdenture.features,
  removable: ["Night & sports guards", "Soft, hard & dual-laminate", "Custom colors", "Free remake guarantee"],
  reline: CATEGORY_META.reline.features,
};

const CATEGORY_ORDER =
  CURRENT_SITE === "printdenture" ? DENTURE_CATEGORIES : CROWN_CATEGORIES;

function categoryMeta(cat: string, sample?: Product) {
  return (
    CATEGORY_META[cat] ?? {
      label: sample?.name ?? cat,
      description: sample?.description ?? "",
      features: ["Digital workflow", "Transparent pricing", "Free remake guarantee"],
    }
  );
}

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createAppClient();

    async function load() {
      if (CURRENT_SITE === "printdenture") {
        try {
          await fetch("/api/catalog/sync", { method: "POST" });
        } catch {
          // Best-effort — pricing still loads existing rows.
        }
      }

      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      setProducts(filterProductsForSite(data || []));
      setLoading(false);
    }

    load();
  }, []);

  const grouped =
    CURRENT_SITE === "printdenture"
      ? DENTURE_SERVICE_GROUPS.map((serviceGroup) => {
          const sections = serviceGroup.categories
            .map((cat) => ({
              label: PRODUCT_CATEGORY_SECTION_LABELS[cat] ?? categoryMeta(cat).label,
              items: products.filter((p) => p.category === cat),
            }))
            .filter((section) => section.items.length > 0);

          if (sections.length === 0) return null;

          return {
            cat: serviceGroup.id,
            meta: {
              label: serviceGroup.label,
              description: serviceGroup.description,
              features: SERVICE_GROUP_FEATURES[serviceGroup.id] ?? categoryMeta(serviceGroup.categories[0]).features,
            },
            sections: sections.length > 1 ? sections : undefined,
            items: sections.length === 1 ? sections[0].items : undefined,
          };
        }).filter((group): group is NonNullable<typeof group> => group !== null)
      : CATEGORY_ORDER.map((cat) => {
          const items = products.filter((p) => p.category === cat);
          if (items.length === 0) return null;
          return {
            cat,
            meta: categoryMeta(cat, items[0]),
            items,
          };
        }).filter((group): group is NonNullable<typeof group> => group !== null);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-20">

        <div className="text-center mb-16">
          <p className="text-sm font-medium text-[#2563EB] mb-3 tracking-wide uppercase">Pricing</p>
          <h1 className="text-4xl font-bold text-[#1A1A1A] tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[#6B6B6B] max-w-xl mx-auto">
            No contracts. No minimums. No lab account required.
            Pay only for what you order.
          </p>
          {CURRENT_SITE === "printcrown" && (
            <p className="text-sm text-[#9B9B9B] mt-3">
              Crown cases may include an optional CAD design fee ($5) if you skip AI approval.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-16">
          {[
            "Free shipping over $300",
            "Free remake guarantee",
            "HIPAA compliant",
            "No setup fees",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-[#4B4B4B]">
              <div className="w-4 h-4 rounded-full bg-[#2563EB] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[9px] font-bold">✓</span>
              </div>
              {item}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="space-y-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-32 h-5 bg-[#E2E0D8] rounded mb-6" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-40 bg-[#E2E0D8] rounded-2xl" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {grouped.map((group) => (
              <div key={group.cat}>
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">{group.meta.label}</h2>
                    <p className="text-sm text-[#6B6B6B]">{group.meta.description}</p>
                  </div>
                  <Link href="/auth?next=%2Forder"
                    className="text-sm text-[#2563EB] hover:underline whitespace-nowrap ml-4">
                    Order →
                  </Link>
                </div>

                {"sections" in group && group.sections ? (
                  <div className="space-y-8 mb-6">
                    {group.sections.map((section) => (
                      <div key={section.label}>
                        <p className="text-sm font-semibold text-[#4B4B4B] mb-3">{section.label}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {section.items.map((p) => {
                            const priceDisplay = formatPricingCardPrice(p);
                            return (
                            <div key={p.id}
                              className="bg-white rounded-2xl border border-[#E2E0D8] p-5 hover:border-[#1A1A1A] transition-all">
                              <div className="w-8 h-1 rounded-full mb-4" style={{ background: p.accent }} />
                              <h3 className="font-semibold text-[#1A1A1A] mb-1">{p.name}</h3>
                              <p className="text-xs text-[#9B9B9B] mb-4 leading-relaxed">{p.description}</p>
                              <div className="flex items-end justify-between">
                                <div>
                                  <span className="text-2xl font-bold text-[#1A1A1A]">{priceDisplay.primary}</span>
                                  {priceDisplay.secondary && (
                                    <span className="text-sm text-[#6B6B6B] ml-1">{priceDisplay.secondary}</span>
                                  )}
                                  <p className="text-xs text-[#9B9B9B] mt-0.5">{p.turnaround}</p>
                                </div>
                                <Link href={`/auth?next=${encodeURIComponent(`/order?product=${p.id}`)}`}>
                                  <button
                                    className="h-8 px-4 rounded-lg text-white text-xs font-medium transition-all hover:opacity-80"
                                    style={{ background: p.accent }}>
                                    Order
                                  </button>
                                </Link>
                              </div>
                            </div>
                          );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {group.items?.map((p) => {
                      const priceDisplay = formatPricingCardPrice(p);
                      return (
                      <div key={p.id}
                        className="bg-white rounded-2xl border border-[#E2E0D8] p-5 hover:border-[#1A1A1A] transition-all">
                        <div className="w-8 h-1 rounded-full mb-4" style={{ background: p.accent }} />
                        <h3 className="font-semibold text-[#1A1A1A] mb-1">{p.name}</h3>
                        <p className="text-xs text-[#9B9B9B] mb-4 leading-relaxed">{p.description}</p>
                        <div className="flex items-end justify-between">
                          <div>
                            <span className="text-2xl font-bold text-[#1A1A1A]">{priceDisplay.primary}</span>
                            {priceDisplay.secondary && (
                              <span className="text-sm text-[#6B6B6B] ml-1">{priceDisplay.secondary}</span>
                            )}
                            <p className="text-xs text-[#9B9B9B] mt-0.5">{p.turnaround}</p>
                          </div>
                          <Link href={`/auth?next=${encodeURIComponent(`/order?product=${p.id}`)}`}>
                            <button
                              className="h-8 px-4 rounded-lg text-white text-xs font-medium transition-all hover:opacity-80"
                              style={{ background: p.accent }}>
                              Order
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}

                <div className="flex flex-wrap gap-3">
                  {group.meta.features.map((f) => (
                    <span key={f}
                      className="text-xs text-[#6B6B6B] bg-white border border-[#E2E0D8] px-3 py-1.5 rounded-full">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="border-b border-[#E2E0D8] mt-10" />
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 text-center bg-white rounded-2xl border border-[#E2E0D8] p-10">
          <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">Ready to streamline your lab orders?</h3>
          <p className="text-[#6B6B6B] mb-6 max-w-md mx-auto">
            Create a free account to place orders, track cases, and manage your practice profile.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/auth">
              <button className="h-11 px-6 rounded-xl border border-[#E2E0D8] text-sm text-[#6B6B6B] hover:bg-[#F8F7F4] transition-all">
                Create account
              </button>
            </Link>
            <Link href="/auth?next=%2Forder">
              <button className="h-11 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition-all">
                Start an order
              </button>
            </Link>
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
}
