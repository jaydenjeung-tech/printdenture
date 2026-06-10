/** Arch-based line pricing — product SKU is prosthesis type; arch is chosen in case details. */

export type ArchSelection = "upper" | "lower" | "both";

export type ArchPricingTier = {
  upper: number;
  lower: number;
  both: number;
};

/** Per category or product-name tier (single-arch price + full-set bundle). */
export const ARCH_PRICING_BY_CATEGORY: Record<string, ArchPricingTier> = {
  complete: { upper: 449, lower: 449, both: 849 },
  jb_tray: { upper: 429, lower: 429, both: 799 },
  immediate: { upper: 479, lower: 479, both: 899 },
  overdenture: { upper: 699, lower: 699, both: 1299 },
};

/** Partial & other prosthesis types priced per product name. */
export const ARCH_PRICING_BY_PRODUCT_NAME: Record<string, ArchPricingTier> = {
  "Flexible Partial Denture": { upper: 399, lower: 399, both: 749 },
  "Cast Metal Partial Denture": { upper: 549, lower: 549, both: 999 },
  "Removable Partial Denture": { upper: 349, lower: 349, both: 649 },
  "Locator Overdenture": { upper: 699, lower: 699, both: 1299 },
  "Bar Overdenture": { upper: 999, lower: 999, both: 1899 },
  "All-on-X Fixed Prosthesis": { upper: 1499, lower: 1499, both: 2799 },
};

/** Categories where arch affects price. Reline/repair use flat product.price. */
export const ARCH_PRICED_CATEGORIES = new Set([
  "complete",
  "jb_tray",
  "immediate",
  "partial",
  "overdenture",
]);

export const ARCH_OPTIONS: { value: ArchSelection; label: string }[] = [
  { value: "upper", label: "Upper" },
  { value: "lower", label: "Lower" },
  { value: "both", label: "Both arches" },
];

export function productNeedsArchSelection(fields: string[]): boolean {
  return fields.includes("arch");
}

export function productUsesArchPricing(category: string, _name?: string): boolean {
  return ARCH_PRICED_CATEGORIES.has(category);
}

export function getArchPricingTier(product: {
  category: string;
  name: string;
}): ArchPricingTier | null {
  if (!productUsesArchPricing(product.category, product.name)) return null;
  return (
    ARCH_PRICING_BY_PRODUCT_NAME[product.name] ??
    ARCH_PRICING_BY_CATEGORY[product.category] ??
    null
  );
}

export function resolveLineItemPrice(
  product: { category: string; name: string; price: number },
  arch: string
): number {
  const tier = getArchPricingTier(product);
  if (!tier || !arch) return product.price;
  if (arch === "upper") return tier.upper;
  if (arch === "lower") return tier.lower;
  if (arch === "both") return tier.both;
  return product.price;
}

export function formatArchLabel(arch: string): string {
  if (arch === "both") return "Full set";
  if (arch === "upper") return "Upper";
  if (arch === "lower") return "Lower";
  return arch;
}

export function formatOrderProductName(productName: string, arch: string): string {
  if (!arch) return productName;
  return `${productName} — ${formatArchLabel(arch)}`;
}

export function formatProductPriceHint(product: {
  category: string;
  name: string;
  price: number;
}): string {
  const tier = getArchPricingTier(product);
  if (!tier) return `$${product.price}`;
  if (tier.upper === tier.lower) {
    return `Upper/lower $${tier.upper} · Both $${tier.both}`;
  }
  return `From $${Math.min(tier.upper, tier.lower)}`;
}

export function formatPricingCardPrice(product: {
  category: string;
  name: string;
  price: number;
}): { primary: string; secondary?: string } {
  const tier = getArchPricingTier(product);
  if (!tier) {
    return { primary: `$${product.price}`, secondary: "per case" };
  }
  return {
    primary: `$${tier.upper}`,
    secondary: `per arch · Both $${tier.both}`,
  };
}

/** Map retired arch-specific SKUs to simplified product + arch for drafts and deep links. */
export const LEGACY_PRODUCT_ARCH_MAP: Record<
  string,
  { seedName: string; arch: ArchSelection }
> = {
  "Complete Denture — Upper (JB Fork)": {
    seedName: "Complete Denture — JB Fork Radi+",
    arch: "upper",
  },
  "Complete Denture — Lower (JB Fork)": {
    seedName: "Complete Denture — JB Fork Radi+",
    arch: "lower",
  },
  "Complete Denture — Full Set (JB Fork)": {
    seedName: "Complete Denture — JB Fork Radi+",
    arch: "both",
  },
  "Complete Denture — Upper": {
    seedName: "Complete Denture — JB Fork Radi+",
    arch: "upper",
  },
  "Complete Denture — Lower": {
    seedName: "Complete Denture — JB Fork Radi+",
    arch: "lower",
  },
  "Complete Denture — Full Set": {
    seedName: "Complete Denture — JB Fork Radi+",
    arch: "both",
  },
  "Complete Denture — Upper (JB Tray)": {
    seedName: "Complete Denture — JB Tray",
    arch: "upper",
  },
  "Complete Denture — Lower (JB Tray)": {
    seedName: "Complete Denture — JB Tray",
    arch: "lower",
  },
  "Complete Denture — Full Set (JB Tray)": {
    seedName: "Complete Denture — JB Tray",
    arch: "both",
  },
  "JB Tray Case — Upper": { seedName: "Complete Denture — JB Tray", arch: "upper" },
  "JB Tray Case — Lower": { seedName: "Complete Denture — JB Tray", arch: "lower" },
  "JB Tray Case — Full Set": { seedName: "Complete Denture — JB Tray", arch: "both" },
  "Immediate Denture — Single Arch": { seedName: "Immediate Denture", arch: "upper" },
  "Immediate Denture — Full Set": { seedName: "Immediate Denture", arch: "both" },
  "Removable Partial — Upper": { seedName: "Removable Partial Denture", arch: "upper" },
  "Removable Partial — Lower": { seedName: "Removable Partial Denture", arch: "lower" },
};

export function resolveLegacyProductSelection<T extends { id: string; name: string; active?: boolean }>(
  product: T,
  catalog: T[]
): { product: T; arch: ArchSelection } | null {
  const mapping = LEGACY_PRODUCT_ARCH_MAP[product.name];
  if (!mapping) return null;
  const replacement = catalog.find((p) => p.name === mapping.seedName && p.active !== false);
  if (!replacement) return null;
  return { product: replacement, arch: mapping.arch };
}
