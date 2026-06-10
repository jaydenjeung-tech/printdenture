"use client";

import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { createAppClient } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { CURRENT_SITE, CROWN_CATEGORIES } from "@/lib/products/site-catalog";
import { prepareCatalogProducts } from "@/lib/products/guard-catalog";
import { COMPLETE_DENTURE_INTRO } from "@/lib/products/complete-denture-records";
import {
  DENTURE_SERVICE_GROUPS,
  PRODUCT_CATEGORY_SECTION_LABELS,
} from "@/lib/products/denture-service-groups";
import { formatPricingCardPrice, type PricingCardDisplay } from "@/lib/products/arch-pricing";

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

const BRAND = CURRENT_SITE === "printdenture"
  ? { accent: "#0F6E56", accentLight: "#E1F5EE", hero: "#0D1B2A", tag: "#5DCAA5" }
  : { accent: "#2563EB", accentLight: "#EFF6FF", hero: "#0F172A", tag: "#93C5FD" };

const GROUP_ACCENTS: Record<string, string> = {
  complete: "#0F6E56",
  partial: "#1D9E75",
  overdenture: "#378ADD",
  removable: "#D97706",
  reline: "#1B2B3A",
  zirconia: "#2563EB",
  printed: "#16A34A",
  implant: "#0EA5E9",
  nightguard: "#D97706",
  sportsguard: "#9333EA",
};

const CATEGORY_META: Record<string, { label: string; description: string; features: string[] }> = {
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
};

const SERVICE_GROUP_FEATURES: Record<string, string[]> = {
  complete: CATEGORY_META.complete.features,
  partial: CATEGORY_META.partial.features,
  overdenture: CATEGORY_META.overdenture.features,
  removable: ["Night & sports guards", "Soft, hard & dual-laminate", "Custom colors", "Free remake guarantee"],
  reline: CATEGORY_META.reline.features,
};

function categoryMeta(cat: string, sample?: Product) {
  return (
    CATEGORY_META[cat] ?? {
      label: sample?.name ?? cat,
      description: sample?.description ?? "",
      features: ["Digital workflow", "Transparent pricing", "Free remake guarantee"],
    }
  );
}

function PricingProductCard({ product, priceDisplay }: { product: Product; priceDisplay: PricingCardDisplay }) {
  return (
    <div className="group flex flex-col rounded-2xl border border-[#E2E0D8] bg-white p-5 transition-all hover:border-[#1A1A1A]/25 hover:shadow-md">
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-1 self-stretch min-h-[2.5rem] rounded-full shrink-0"
          style={{ background: product.accent }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-[#1A1A1A] leading-snug">{product.name}</h3>
          <p className="text-xs text-[#9B9B9B] mt-1 leading-relaxed line-clamp-3">{product.description}</p>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[#F0EEE8]">
        {priceDisplay.flat ? (
          <div className="mb-3">
            <span className="text-2xl font-bold text-[#1A1A1A]">{priceDisplay.primary}</span>
            {priceDisplay.secondary && (
              <span className="text-sm text-[#6B6B6B] ml-1.5">{priceDisplay.secondary}</span>
            )}
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9B9B9B] mb-2">
              Arch pricing
            </p>
            <div className="flex flex-wrap gap-2">
              {priceDisplay.archTiers?.map((tier) => (
                <span
                  key={tier.label}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#F8F7F4] border border-[#E2E0D8] px-2.5 py-1.5 text-xs"
                >
                  <span className="text-[#6B6B6B]">{tier.label}</span>
                  <span className="font-semibold text-[#1A1A1A]">${tier.price}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-[#9B9B9B]">{product.turnaround}</p>
          <Link href={`/auth?next=${encodeURIComponent(`/order?product=${product.id}`)}`}>
            <button
              type="button"
              className="h-8 px-4 rounded-lg text-white text-xs font-medium transition-all hover:opacity-90"
              style={{ background: product.accent }}
            >
              Order
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createAppClient();

    async function load() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      setProducts(prepareCatalogProducts(data || []));
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
            id: serviceGroup.id,
            cat: serviceGroup.id,
            meta: {
              label: serviceGroup.label,
              description: serviceGroup.description,
              features: SERVICE_GROUP_FEATURES[serviceGroup.id] ?? categoryMeta(serviceGroup.categories[0]).features,
            },
            accent: GROUP_ACCENTS[serviceGroup.id] ?? BRAND.accent,
            sections: sections.length > 1 ? sections : undefined,
            items: sections.length === 1 ? sections[0].items : undefined,
          };
        }).filter((group): group is NonNullable<typeof group> => group !== null)
      : CROWN_CATEGORIES.map((cat) => {
          const items = products.filter((p) => p.category === cat);
          if (items.length === 0) return null;
          return {
            id: cat,
            cat,
            meta: categoryMeta(cat, items[0]),
            accent: GROUP_ACCENTS[cat] ?? BRAND.accent,
            items,
          };
        }).filter((group): group is NonNullable<typeof group> => group !== null);

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-12 px-6" style={{ background: BRAND.hero }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] mb-3" style={{ color: BRAND.tag }}>
            Lab pricing
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4 max-w-2xl">
            Transparent pricing from our live catalog
          </h1>
          <p className="text-[15px] text-[#94A3B8] max-w-xl leading-relaxed mb-8">
            Prices reflect what you see in Admin — no hidden tiers. Choose arch at checkout for
            complete, partial, and implant cases.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              "Free shipping over $300",
              "Free remake guarantee",
              "HIPAA compliant",
              "No setup fees",
            ].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-[#1E3347] bg-[#132337]/80 px-3.5 py-1.5 text-xs text-[#CBD5E1]"
              >
                <span className="text-[#5DCAA5]">✓</span>
                {item}
              </span>
            ))}
          </div>
          {CURRENT_SITE === "printcrown" && (
            <p className="text-xs text-[#64748B] mt-6">
              Crown cases may include an optional CAD design fee ($5) if you skip AI approval.
            </p>
          )}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-10 lg:gap-14">
          {/* Section nav */}
          {!loading && grouped.length > 0 && (
            <nav className="hidden lg:block">
              <div className="sticky top-28 space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#9B9B9B] mb-3 px-2">
                  Jump to
                </p>
                {grouped.map((group) => (
                  <a
                    key={group.id}
                    href={`#pricing-${group.id}`}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-[#6B6B6B] hover:bg-white hover:text-[#1A1A1A] transition-colors"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: group.accent }}
                    />
                    {group.meta.label}
                  </a>
                ))}
              </div>
            </nav>
          )}

          {/* Catalog sections */}
          <div>
            {loading ? (
              <div className="space-y-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="w-40 h-6 bg-[#E2E0D8] rounded mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[...Array(2)].map((_, j) => (
                        <div key={j} className="h-48 bg-[#E2E0D8] rounded-2xl" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : grouped.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#E2E0D8] bg-white p-12 text-center">
                <p className="text-[#6B6B6B]">No active products for this site yet.</p>
                <Link href="/auth?next=%2Forder" className="text-sm font-medium mt-3 inline-block" style={{ color: BRAND.accent }}>
                  Start an order →
                </Link>
              </div>
            ) : (
              <div className="space-y-14">
                {grouped.map((group) => (
                  <section key={group.id} id={`pricing-${group.id}`} className="scroll-mt-28">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-1 h-12 rounded-full shrink-0 mt-0.5"
                          style={{ background: group.accent }}
                        />
                        <div>
                          <h2 className="text-xl font-bold text-[#1A1A1A]">{group.meta.label}</h2>
                          <p className="text-sm text-[#6B6B6B] mt-1 max-w-xl leading-relaxed">
                            {group.meta.description}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/auth?next=%2Forder"
                        className="text-sm font-medium whitespace-nowrap shrink-0 hover:underline"
                        style={{ color: BRAND.accent }}
                      >
                        Order this type →
                      </Link>
                    </div>

                    {"sections" in group && group.sections ? (
                      <div className="space-y-8">
                        {group.sections.map((section) => (
                          <div key={section.label}>
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] mb-3">
                              {section.label}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {section.items.map((p) => (
                                <PricingProductCard
                                  key={p.id}
                                  product={p}
                                  priceDisplay={formatPricingCardPrice(p)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {group.items?.map((p) => (
                          <PricingProductCard
                            key={p.id}
                            product={p}
                            priceDisplay={formatPricingCardPrice(p)}
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-5">
                      {group.meta.features.map((f) => (
                        <span
                          key={f}
                          className="text-xs text-[#6B6B6B] bg-white border border-[#E2E0D8] px-3 py-1.5 rounded-full"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}

            {/* CTA */}
            <div
              className="mt-16 rounded-2xl border p-8 md:p-10 text-center"
              style={{ borderColor: `${BRAND.accent}33`, background: BRAND.accentLight }}
            >
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-2">Ready to place a case?</h3>
              <p className="text-sm text-[#6B6B6B] mb-6 max-w-md mx-auto leading-relaxed">
                Create a free account to order, track cases, and upload scans. Pricing at checkout
                matches what you see here.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link href="/auth">
                  <button className="h-11 px-6 rounded-xl border border-[#E2E0D8] bg-white text-sm text-[#6B6B6B] hover:bg-[#F8F7F4] transition-all">
                    Create account
                  </button>
                </Link>
                <Link href="/auth?next=%2Forder">
                  <button
                    className="h-11 px-6 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                    style={{ background: BRAND.accent }}
                  >
                    Start an order
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
