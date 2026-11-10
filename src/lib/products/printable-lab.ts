/**
 * PrintDenture lab services — printed prostheses only.
 * Catalog rows may still use older names until a sync; the storefront shows these labels.
 */

import { FLIPPER_MAX_TEETH, FLIPPER_PRICE, NIGHT_GUARD_PRICE_PER_ARCH } from "@/lib/products/arch-pricing";
import { DENTURE_DESIGN_NAME, DENTURE_DESIGN_PRICE_PER_ARCH } from "@/lib/products/denture-design";

type PrintableLabEntry = {
  names: readonly string[];
  label: string;
  description: string;
  category?: string;
  /** Storefront price. Wins over a stale catalog row. */
  price?: number;
  fields?: readonly string[];
};

const PRINTABLE_LAB_CATALOG: readonly PrintableLabEntry[] = [
  {
    names: ["Complete Denture — JB Tray", "Printed Full Denture"],
    label: "Printed Full Denture",
    description:
      "Printed full denture from a JB Tray final impression and jaw relation. Choose upper, lower, or both in case details.",
    fields: ["shade", "arch"],
  },
  {
    names: ["Flexible Partial Denture"],
    label: "Flexible Partial Denture",
    description: "Printed flexible partial. Choose the arch and the teeth to replace. Price follows the arch.",
    fields: ["shade", "arch", "toothNumber"],
  },
  {
    names: ["Temporary Flipper"],
    label: "Temporary Flipper",
    description: `Printed temporary flipper for interim esthetics. $${FLIPPER_PRICE} for up to ${FLIPPER_MAX_TEETH} teeth.`,
    price: FLIPPER_PRICE,
    fields: ["shade", "toothNumber"],
  },
  {
    names: [DENTURE_DESIGN_NAME],
    label: DENTURE_DESIGN_NAME,
    description: `Full denture design only. $${DENTURE_DESIGN_PRICE_PER_ARCH} per arch. Fabrication and try-in are not included.`,
    category: "design",
    price: DENTURE_DESIGN_PRICE_PER_ARCH,
    fields: ["arch"],
  },
  {
    names: ["Night Guard", "Printed Night Guard"],
    label: "Printed Night Guard",
    description: "Printed night guard for bruxism. Choose soft, hard, or Thermo-flex.",
    category: "nightguard",
    fields: ["guardType", "arch"],
  },
];

const PRINTABLE_LAB_BY_NAME = new Map(
  PRINTABLE_LAB_CATALOG.flatMap((entry) => entry.names.map((name) => [name, entry] as const))
);

function isNightGuardProduct(product: { name?: string | null; category?: string | null }): boolean {
  if (product.category === "sportsguard") return false;
  if (product.category === "nightguard") return true;
  return /\bnight\s*guards?\b/i.test(product.name ?? "");
}

export function isPrintableLabProduct(product: {
  name?: string | null;
  category?: string | null;
}): boolean {
  if (isNightGuardProduct(product)) return true;
  return PRINTABLE_LAB_BY_NAME.has(product.name ?? "");
}

export function presentPrintableLabProduct<
  T extends { name: string; description: string; category?: string; price?: number; fields?: string[] },
>(product: T): T {
  const nightGuard = isNightGuardProduct(product);
  const entry = PRINTABLE_LAB_BY_NAME.get(product.name);
  if (entry || nightGuard) {
    return {
      ...product,
      name: entry?.label ?? product.name,
      description: entry?.description ?? product.description,
      category: entry?.category ?? (nightGuard ? "nightguard" : product.category),
      ...(entry?.fields ? { fields: [...entry.fields] } : {}),
      ...(entry?.price != null ? { price: entry.price } : {}),
      ...(nightGuard || entry?.category === "nightguard" ? { price: NIGHT_GUARD_PRICE_PER_ARCH } : {}),
    };
  }
  return product;
}
