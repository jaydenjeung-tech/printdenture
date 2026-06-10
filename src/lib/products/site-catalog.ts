/**
 * Shared product catalog visibility across PrintCrown & PrintDenture.
 * Set NEXT_PUBLIC_APP_SITE on each Vercel project (printcrown | printdenture).
 */

export type SiteId = "printcrown" | "printdenture";

export type CatalogProduct = {
  category: string;
  sites?: string[] | null;
};

export const CURRENT_SITE: SiteId =
  process.env.NEXT_PUBLIC_APP_SITE === "printcrown" ? "printcrown" : "printdenture";

/** Default site visibility by category when `products.sites` is empty in DB. */
export const CATEGORY_SITE_DEFAULTS: Record<string, SiteId[]> = {
  // PrintCrown — crowns, implants, guards
  zirconia: ["printcrown"],
  printed: ["printcrown"],
  implant: ["printcrown"],
  nightguard: ["printcrown", "printdenture"],
  sportsguard: ["printcrown", "printdenture"],
  // PrintDenture — dentures & removable
  complete: ["printdenture"],
  partial: ["printdenture"],
  immediate: ["printdenture"],
  overdenture: ["printdenture"],
  reline: ["printdenture"],
  jb_tray: ["printdenture"],
  equipment: ["printdenture"],
};

export const CROWN_CATEGORIES = ["zirconia", "printed", "implant", "nightguard", "sportsguard"];
export const DENTURE_CATEGORIES = [
  "complete",
  "jb_tray",
  "immediate",
  "partial",
  "overdenture",
  "reline",
  "nightguard",
  "sportsguard",
  "equipment",
];

/** Lab-case categories shown on /order step 1 (excludes equipment — sold via /shop or equipment step). */
export const ORDER_FLOW_CATEGORIES = DENTURE_CATEGORIES.filter((c) => c !== "equipment");

export function defaultSitesForCategory(category: string): SiteId[] {
  return CATEGORY_SITE_DEFAULTS[category] ?? ["printcrown", "printdenture"];
}

export function getProductSites(product: CatalogProduct): SiteId[] {
  if (product.sites && product.sites.length > 0) {
    return product.sites.filter((s): s is SiteId => s === "printcrown" || s === "printdenture");
  }
  return defaultSitesForCategory(product.category);
}

export function productVisibleOnSite(product: CatalogProduct, site: SiteId = CURRENT_SITE): boolean {
  return getProductSites(product).includes(site);
}

export function filterProductsForSite<T extends CatalogProduct>(
  products: T[],
  site: SiteId = CURRENT_SITE
): T[] {
  return products.filter((p) => productVisibleOnSite(p, site));
}

export const SITE_LABELS: Record<SiteId, string> = {
  printcrown: "PrintCrown",
  printdenture: "PrintDenture",
};
