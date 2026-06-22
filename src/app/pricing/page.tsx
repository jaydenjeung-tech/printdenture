"use client";

import Link from "next/link";
import { createAppClient, getClientUser } from "@/lib/supabase";
import { useState, useEffect, useMemo } from "react";
import { CURRENT_SITE, CROWN_CATEGORIES } from "@/lib/products/site-catalog";
import { prepareCatalogProducts } from "@/lib/products/guard-catalog";
import { COMPLETE_DENTURE_INTRO } from "@/lib/products/complete-denture-records";
import { formatPricingCardPrice } from "@/lib/products/arch-pricing";
import {
  orderProductHref,
  orderServiceGroupAuthHref,
  orderServiceGroupHref,
} from "@/lib/products/order-product-link";
import {
  buildDevicePricingGroups,
  buildLabPricingGroups,
  buildPricingNav,
  splitPricingProducts,
  type PricingProduct,
} from "@/lib/products/pricing-page";
import { MarketingShell, PageHero } from "@/components/marketing/marketing-shell";
import { CtaLink } from "@/components/marketing/primitives";
import {
  PricingDeviceCard,
  PricingProductCard,
  PricingSectionNav,
  PricingLoadingSkeleton,
  PricingTierHeader,
} from "@/components/marketing/pricing-ui";

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
    description: "3D-printed resin crowns for fast turnaround restorations.",
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
    features: ["JB Fork or JB Tray records", "Printed try-in included", "Lab CAD design", "Free remake guarantee"],
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

const DEVICE_INCLUDES = [
  "One-time chairside purchase",
  "Ships in 3–5 business days",
  "Use with PrintDenture lab cases",
  "POP Bow sold separately",
];

const LAB_INCLUDES = [
  "Printed try-in included",
  "Lab-controlled QC",
  "Free remake guarantee",
  "No setup fees",
];

function categoryMeta(cat: string, sample?: PricingProduct) {
  return (
    CATEGORY_META[cat] ?? {
      label: sample?.name ?? cat,
      description: sample?.description ?? "",
      features: ["Digital workflow", "Transparent pricing", "Free remake guarantee"],
    }
  );
}

function LabGroupSection({
  group,
  isAuthenticated,
}: {
  group: ReturnType<typeof buildLabPricingGroups>[number];
  isAuthenticated: boolean;
}) {
  const orderTypeHref = isAuthenticated
    ? orderServiceGroupHref(group.id)
    : orderServiceGroupAuthHref(group.id);

  return (
    <section id={`pricing-${group.id}`} className="scroll-mt-28">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pb-6 border-b border-[var(--pd-border)]">
        <div className="flex items-start gap-4">
          <div className="w-1 h-14 shrink-0 mt-0.5" style={{ background: group.accent }} />
          <div>
            <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.02em]">
              {group.label}
            </h3>
            <p className="text-[14px] text-[var(--pd-slate)] mt-2 max-w-xl leading-relaxed">{group.description}</p>
          </div>
        </div>
        <Link
          href={orderTypeHref}
          className="text-[14px] font-medium text-[var(--pd-teal-dark)] whitespace-nowrap shrink-0 hover:underline"
        >
          Order this type →
        </Link>
      </div>

      {group.sections ? (
        <div className="space-y-10">
          {group.sections.map((section) => (
            <div key={section.label}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-4">
                {section.label}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.items.map((p) => (
                  <PricingProductCard
                    key={p.id}
                    product={p}
                    priceDisplay={formatPricingCardPrice(p)}
                    orderHref={isAuthenticated ? orderProductHref(p.id) : undefined}
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
              orderHref={isAuthenticated ? orderProductHref(p.id) : undefined}
            />
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-[var(--pd-border)]">
        {group.features.map((f) => (
          <span
            key={f}
            className="text-[12px] text-[var(--pd-slate)] border border-[var(--pd-border)] bg-white px-3 py-1.5"
          >
            {f}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function PricingPage() {
  const [products, setProducts] = useState<PricingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const supabase = createAppClient();

    async function load() {
      const [{ data }, { user }] = await Promise.all([
        supabase.from("products").select("*").eq("active", true).order("sort_order"),
        getClientUser(supabase),
      ]);
      setProducts(prepareCatalogProducts(data || []) as PricingProduct[]);
      setIsAuthenticated(!!user);
      setLoading(false);
    }

    void load();
  }, []);

  const { deviceGroups, labGroups, navItems, isPrintDenture } = useMemo(() => {
    if (CURRENT_SITE !== "printdenture") {
      const crownGroups = CROWN_CATEGORIES.map((cat) => {
        const items = products.filter((p) => p.category === cat);
        if (items.length === 0) return null;
        const meta = categoryMeta(cat, items[0]);
        return {
          id: cat,
          label: meta.label,
          description: meta.description,
          features: meta.features,
          accent: GROUP_ACCENTS[cat] ?? "#2563EB",
          items,
        };
      }).filter((g): g is NonNullable<typeof g> => g !== null);

      return {
        deviceGroups: [],
        labGroups: crownGroups,
        navItems: crownGroups.map((g) => ({ id: g.id, label: g.label, accent: g.accent, tier: "lab" as const })),
        isPrintDenture: false,
      };
    }

    const { equipment, lab: labProducts } = splitPricingProducts(products);
    const devices = buildDevicePricingGroups(equipment);
    const labBuilt = buildLabPricingGroups(labProducts, categoryMeta);

    return {
      deviceGroups: devices,
      labGroups: labBuilt,
      navItems: buildPricingNav(devices, labBuilt),
      isPrintDenture: true,
    };
  }, [products]);

  const hasContent = deviceGroups.length > 0 || labGroups.length > 0;

  return (
    <MarketingShell>
      <PageHero
        eyebrow="Pricing"
        title={isPrintDenture ? "Capture devices & lab services" : "Lab pricing"}
        lead={
          isPrintDenture
            ? "Purchase the JB capture system once, then send cases through our lab — design, printed try-in, QC, and finishing included on every prosthesis."
            : "Transparent pricing from our live catalog."
        }
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10 lg:gap-14">
          {!loading && navItems.length > 0 && <PricingSectionNav groups={navItems} />}

          <div>
            {loading ? (
              <PricingLoadingSkeleton />
            ) : !hasContent ? (
              <div className="border border-dashed border-[var(--pd-border-strong)] bg-white p-12 text-center">
                <p className="text-[var(--pd-muted)]">No active products for this site yet.</p>
                <Link
                  href="/signup"
                  className="text-sm font-medium text-[var(--pd-teal-dark)] mt-3 inline-block hover:underline"
                >
                  Register your practice →
                </Link>
              </div>
            ) : (
              <div className="space-y-20">
                {isPrintDenture && deviceGroups.length > 0 && (
                  <div id="pricing-devices" className="scroll-mt-28">
                    <PricingTierHeader
                      eyebrow="One-time purchase"
                      title="Capture devices"
                      description="Clinically-developed JB Tray, JB Fork Radi+, and ADD POP Bow — the chairside capture system used with the two-visit workflow. Order kits through our equipment shop."
                    />

                    <div className="border-y border-[var(--pd-border)] bg-white mb-10">
                      <div className="grid grid-cols-2 lg:grid-cols-4">
                        {DEVICE_INCLUDES.map((item, i) => (
                          <div
                            key={item}
                            className={`px-5 py-4 flex items-center gap-2 text-[13px] text-[var(--pd-slate)] ${
                              i > 0 ? "border-l border-[var(--pd-border)]" : ""
                            } ${i >= 2 ? "border-t lg:border-t-0 border-[var(--pd-border)]" : ""}`}
                          >
                            <span className="text-[var(--pd-teal)] font-medium">✓</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                      {deviceGroups.map((group) =>
                        group.items.map((product) => (
                          <PricingDeviceCard
                            key={product.id}
                            label={group.label}
                            description={group.description}
                            image={group.image}
                            imageAlt={group.label}
                            product={product}
                          />
                        ))
                      )}
                    </div>

                    <p className="text-[13px] text-[var(--pd-muted)]">
                      Need help choosing Tray vs Fork?{" "}
                      <Link href="/the-system" className="text-[var(--pd-teal-dark)] hover:underline">
                        Compare the capture system →
                      </Link>
                    </p>
                  </div>
                )}

                {labGroups.length > 0 && (
                  <div>
                    {isPrintDenture && (
                      <>
                        <PricingTierHeader
                          eyebrow="Per case"
                          title="Lab services"
                          description="Send scans after chairside capture — we design, print a try-in, and deliver the finished prosthesis. Pricing at checkout matches what you see here."
                        />
                        <div className="border-y border-[var(--pd-border)] bg-white mb-12">
                          <div className="grid grid-cols-2 lg:grid-cols-4">
                            {LAB_INCLUDES.map((item, i) => (
                              <div
                                key={item}
                                className={`px-5 py-4 flex items-center gap-2 text-[13px] text-[var(--pd-slate)] ${
                                  i > 0 ? "border-l border-[var(--pd-border)]" : ""
                                } ${i >= 2 ? "border-t lg:border-t-0 border-[var(--pd-border)]" : ""}`}
                              >
                                <span className="text-[var(--pd-teal)] font-medium">✓</span>
                                {item}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-16">
                      {labGroups.map((group) => (
                        <LabGroupSection key={group.id} group={group} isAuthenticated={isAuthenticated} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <section className="mt-16 lg:mt-20 py-12 px-6 bg-[var(--pd-navy)] text-white text-center relative overflow-hidden">
              <div className="absolute inset-0 pd-grid-bg opacity-[0.06]" aria-hidden />
              <div className="relative max-w-lg mx-auto">
                <h3 className="text-[clamp(1.25rem,2.5vw,1.75rem)] font-semibold tracking-[-0.02em] mb-3">
                  Ready to get started?
                </h3>
                <p className="text-[15px] text-[#A8C4D4] mb-8 leading-relaxed">
                  Register your practice, order capture devices, and submit your first lab case when
                  you are ready.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <CtaLink href="/signup">Register practice</CtaLink>
                  <CtaLink
                    href="/providers#demo"
                    variant="secondary"
                    className="border-white/30 text-white hover:bg-white hover:text-[var(--pd-navy)]"
                  >
                    Request a demo
                  </CtaLink>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </MarketingShell>
  );
}
