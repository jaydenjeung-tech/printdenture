import type { SiteId } from "@/lib/products/site-catalog";
import { ARCH_PRICING_BY_CATEGORY } from "@/lib/products/arch-pricing";
import { RETIRED_EQUIPMENT_PRODUCT_NAMES, CHAIRSIDE_EQUIPMENT_PRICES } from "@/lib/products/chairside-equipment";
import { SHARED_GUARD_SEEDS } from "@/lib/products/guard-seeds";
import { DENTURE_DESIGN_NAME, DENTURE_DESIGN_PRICE_PER_ARCH } from "@/lib/products/denture-design";

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
  // Complete dentures — JB Tray records
  {
    category: "jb_tray",
    name: "Complete Denture — JB Tray",
    description:
      "Printed full denture from a JB Tray final impression and jaw relation. Choose upper, lower, or both in case details.",
    price: ARCH_PRICING_BY_CATEGORY.jb_tray.upper,
    turnaround: "7–12 business days",
    accent: "#5DCAA5",
    fields: ["shade", "arch"],
    active: true,
    sort_order: 20,
    sites: ["printdenture"],
  },

  {
    category: "partial",
    name: "Flexible Partial Denture",
    description: "Printed flexible partial. Choose the arch and the teeth to replace. Price follows the arch.",
    price: 399,
    turnaround: "7–10 business days",
    accent: "#1D9E75",
    fields: ["shade", "arch", "toothNumber"],
    active: true,
    sort_order: 40,
    sites: ["printdenture"],
  },
  {
    category: "partial",
    name: "Temporary Flipper",
    description: "Printed temporary flipper for interim esthetics. $129 for up to 3 teeth.",
    price: 129,
    turnaround: "3–5 business days",
    accent: "#1D9E75",
    fields: ["shade", "toothNumber"],
    active: true,
    sort_order: 43,
    sites: ["printdenture"],
  },

  {
    category: "design",
    name: DENTURE_DESIGN_NAME,
    description: `Full denture design only. $${DENTURE_DESIGN_PRICE_PER_ARCH} per arch. Fabrication and try-in are not included.`,
    price: DENTURE_DESIGN_PRICE_PER_ARCH,
    turnaround: "3–5 business days",
    accent: "#0F6E56",
    fields: ["arch"],
    active: true,
    sort_order: 25,
    sites: ["printdenture"],
  },

  // Printed night guard — shared with PrintCrown. Sports guard is PrintCrown only.
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
  "Complete Denture — JB Fork Radi+",
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
  "Immediate Denture",
  "Cast Metal Partial Denture",
  "Removable Partial Denture",
  "Locator Overdenture",
  "Bar Overdenture",
  "All-on-X Fixed Prosthesis",
  "Hard Reline",
  "Soft Reline",
  "Denture Repair",
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
