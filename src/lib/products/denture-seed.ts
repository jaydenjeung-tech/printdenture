import type { SiteId } from "@/lib/products/site-catalog";
import { ARCH_PRICING_BY_CATEGORY } from "@/lib/products/arch-pricing";
import { RETIRED_EQUIPMENT_PRODUCT_NAMES, CHAIRSIDE_EQUIPMENT_PRICES } from "@/lib/products/chairside-equipment";
import { SHARED_GUARD_SEEDS } from "@/lib/products/guard-seeds";

export type ProductSeed = {
  category: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  accent: string;
  fields: string[];
  active: boolean;
  sort_order: number;
  sites: SiteId[];
};

/** Default PrintDenture catalog — dentures & removable prosthetics. */
export const PRINTDENTURE_PRODUCT_SEEDS: ProductSeed[] = [
  // Complete dentures — JB Fork Radi+ records (arch chosen in case details)
  {
    category: "complete",
    name: "Complete Denture — JB Fork Radi+",
    description:
      "Definitive complete denture from JB Fork-aligned digital scans. Choose upper, lower, or both in case details.",
    price: ARCH_PRICING_BY_CATEGORY.complete.upper,
    turnaround: "7–12 business days",
    accent: "#0F6E56",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 10,
    sites: ["printdenture"],
  },

  // Complete dentures — JB Tray records
  {
    category: "jb_tray",
    name: "Complete Denture — JB Tray",
    description:
      "Complete denture from JB Tray final impression and jaw relation. Choose upper, lower, or both in case details.",
    price: ARCH_PRICING_BY_CATEGORY.jb_tray.upper,
    turnaround: "7–12 business days",
    accent: "#5DCAA5",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 20,
    sites: ["printdenture"],
  },

  // Immediate — no JB kit
  {
    category: "immediate",
    name: "Immediate Denture",
    description:
      "Delivery denture at extraction or shortly after — from pre-op or day-of scans. No JB equipment check.",
    price: ARCH_PRICING_BY_CATEGORY.immediate.upper,
    turnaround: "5–10 business days",
    accent: "#085041",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 30,
    sites: ["printdenture"],
  },

  // Partial dentures
  {
    category: "partial",
    name: "Flexible Partial Denture",
    description: "Valplast-style flexible partial with digital tooth setup and natural clasp design.",
    price: 399,
    turnaround: "7–10 business days",
    accent: "#1D9E75",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 40,
    sites: ["printdenture"],
  },
  {
    category: "partial",
    name: "Cast Metal Partial Denture",
    description: "Cobalt-chrome or titanium framework partial with surveyed clasp design from digital records.",
    price: 549,
    turnaround: "10–14 business days",
    accent: "#1D9E75",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 41,
    sites: ["printdenture"],
  },
  {
    category: "partial",
    name: "Removable Partial Denture",
    description: "Removable partial prosthesis from digital scan or model — shade and tooth setup included.",
    price: 349,
    turnaround: "7–10 business days",
    accent: "#1D9E75",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 42,
    sites: ["printdenture"],
  },
  {
    category: "partial",
    name: "Temporary Flipper",
    description: "Single-tooth or short-span temporary partial for interim esthetics.",
    price: 199,
    turnaround: "3–5 business days",
    accent: "#1D9E75",
    fields: ["shade", "toothNumber"],
    active: true,
    sort_order: 43,
    sites: ["printdenture"],
  },

  // Implant overdentures & full-arch
  {
    category: "overdenture",
    name: "Locator Overdenture",
    description:
      "Implant-retained overdenture with locator attachments — JB Fork Radi+ aligned CBCT / IOS data typical.",
    price: 699,
    turnaround: "12–16 business days",
    accent: "#378ADD",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 50,
    sites: ["printdenture"],
  },
  {
    category: "overdenture",
    name: "Bar Overdenture",
    description:
      "Milled or cast bar-retained overdenture for full-arch implant cases with digital verification.",
    price: 999,
    turnaround: "14–18 business days",
    accent: "#378ADD",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 51,
    sites: ["printdenture"],
  },
  {
    category: "overdenture",
    name: "All-on-X Fixed Prosthesis",
    description:
      "Fixed full-arch implant prosthesis from aligned scan sets — JB Fork Radi+ record protocol.",
    price: 1499,
    turnaround: "14–21 business days",
    accent: "#378ADD",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 52,
    sites: ["printdenture"],
  },

  // Reline & repair — flat price; arch identifies which prosthesis
  {
    category: "reline",
    name: "Hard Reline",
    description: "Chairside or lab hard reline on an existing PrintDenture prosthesis — mail-in shipper available.",
    price: 149,
    turnaround: "3–5 business days",
    accent: "#1B2B3A",
    fields: ["arch"],
    active: true,
    sort_order: 60,
    sites: ["printdenture"],
  },
  {
    category: "reline",
    name: "Soft Reline",
    description: "Soft liner reline for tissue conditioning or patient comfort on existing dentures.",
    price: 179,
    turnaround: "3–5 business days",
    accent: "#1B2B3A",
    fields: ["arch"],
    active: true,
    sort_order: 61,
    sites: ["printdenture"],
  },
  {
    category: "reline",
    name: "Denture Repair",
    description: "Tooth addition, fracture repair, or base repair on dentures originally made through PrintDenture.",
    price: 89,
    turnaround: "2–4 business days",
    accent: "#1B2B3A",
    fields: ["arch"],
    active: true,
    sort_order: 62,
    sites: ["printdenture"],
  },

  // Shared guards — PrintCrown & PrintDenture (category nightguard / sportsguard)
  ...SHARED_GUARD_SEEDS,

  // Chairside equipment — PNUADD / Add-on Dental
  {
    category: "equipment",
    name: "JB Tray — Box (5 sets)",
    description:
      "One box with five upper + lower JB Tray sets (no POP Bow). One-step final impression & jaw relation (PNUADD).",
    price: CHAIRSIDE_EQUIPMENT_PRICES.jbTrayBox,
    turnaround: "3–5 business days",
    accent: "#5DCAA5",
    fields: ["jbTray", "trayBox"],
    active: true,
    sort_order: 10,
    sites: ["printdenture"],
  },
  {
    category: "equipment",
    name: "JB Fork Radi+ — Box (10 EA)",
    description:
      "One box with ten JB Fork Solution Radi+ devices (no POP Bow). Jaw relation for digital & implant cases (PNUADD).",
    price: CHAIRSIDE_EQUIPMENT_PRICES.jbForkBox,
    turnaround: "3–5 business days",
    accent: "#0F6E56",
    fields: ["jbFork", "forkBox"],
    active: true,
    sort_order: 20,
    sites: ["printdenture"],
  },
  {
    category: "equipment",
    name: "ADD POP Bow — Pouch (12 sets)",
    description:
      "Separate pouch with twelve ADD POP Bow sets for occlusal plane & anterior esthetic transfer (PNUADD).",
    price: CHAIRSIDE_EQUIPMENT_PRICES.popBowPouch,
    turnaround: "3–5 business days",
    accent: "#5DCAA5",
    fields: ["popBow", "popBowPouch"],
    active: true,
    sort_order: 30,
    sites: ["printdenture"],
  },
];

/** Retired arch-split SKUs — deactivated on catalog sync. */
export const RETIRED_DENTURE_PRODUCT_NAMES: readonly string[] = [
  "Complete Denture — Upper (JB Fork)",
  "Complete Denture — Lower (JB Fork)",
  "Complete Denture — Full Set (JB Fork)",
  "Complete Denture — Upper (JB Tray)",
  "Complete Denture — Lower (JB Tray)",
  "Complete Denture — Full Set (JB Tray)",
  "Complete Denture — Upper",
  "Complete Denture — Lower",
  "Complete Denture — Full Set",
  "JB Tray Case — Upper",
  "JB Tray Case — Lower",
  "JB Tray Case — Full Set",
  "Immediate Denture — Single Arch",
  "Immediate Denture — Full Set",
  "Removable Partial — Upper",
  "Removable Partial — Lower",
  ...RETIRED_EQUIPMENT_PRODUCT_NAMES,
];

const SEED_BY_NAME = new Map(PRINTDENTURE_PRODUCT_SEEDS.map((s) => [s.name, s]));

export function dentureSeedsToInsert<T extends { name: string }>(existing: T[]): ProductSeed[] {
  const seenNames = new Set(existing.map((p) => p.name));
  return PRINTDENTURE_PRODUCT_SEEDS.filter((seed) => !seenNames.has(seed.name));
}

/** Existing catalog rows whose category no longer matches the seed definition (e.g. after taxonomy changes). */
export function dentureSeedCategoryFixes(
  existing: { id: string; category: string; name: string }[]
): { id: string; name: string; category: string }[] {
  return existing.flatMap((product) => {
    const expected = SEED_BY_NAME.get(product.name)?.category;
    if (!expected || product.category === expected) return [];
    return [{ id: product.id, name: product.name, category: expected }];
  });
}

/** Sync seed metadata onto rows that match by product name. */
export function dentureSeedUpdates(
  existing: { id: string; name: string }[]
): { id: string; seed: ProductSeed }[] {
  return existing.flatMap((product) => {
    const seed = SEED_BY_NAME.get(product.name);
    if (!seed) return [];
    return [{ id: product.id, seed }];
  });
}

export function dentureSeedsToRetire(existing: { id: string; name: string; active: boolean }[]): string[] {
  const retireSet = new Set(RETIRED_DENTURE_PRODUCT_NAMES);
  return existing.filter((p) => retireSet.has(p.name) && p.active).map((p) => p.id);
}
