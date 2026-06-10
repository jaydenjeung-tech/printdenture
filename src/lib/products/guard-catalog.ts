import {
  CURRENT_SITE,
  filterProductsForSite,
  getProductSites,
  type CatalogProduct,
  type SiteId,
} from "@/lib/products/site-catalog";
import { SHARED_GUARD_NAMES } from "@/lib/products/guard-seeds";

const GUARD_CATEGORY_BY_NAME: Record<string, "nightguard" | "sportsguard"> = {
  "Night Guard": "nightguard",
  "Sports Guard": "sportsguard",
};

export function isSharedGuardProduct(product: { name: string }): boolean {
  return (SHARED_GUARD_NAMES as readonly string[]).includes(product.name);
}

/** Map legacy `removable` (or other) guard rows to canonical nightguard / sportsguard. */
export function normalizeGuardProduct<T extends { category: string; name: string }>(product: T): T {
  const canonical = GUARD_CATEGORY_BY_NAME[product.name];
  if (!canonical || product.category === canonical) return product;
  if (!isSharedGuardProduct(product)) return product;
  return { ...product, category: canonical };
}

function guardProductRank<T extends CatalogProduct & { active?: boolean }>(product: T): number {
  let score = 0;
  if (product.category === "nightguard" || product.category === "sportsguard") score += 10;
  const sites = getProductSites(product);
  if (sites.includes("printcrown") && sites.includes("printdenture")) score += 5;
  if (product.active !== false) score += 2;
  return score;
}

/** When Admin unify left duplicate rows, keep the best canonical guard SKU per name. */
export function dedupeSharedGuardProducts<T extends CatalogProduct & { id: string; name: string; active?: boolean }>(
  products: T[]
): T[] {
  const bestByName = new Map<string, T>();
  for (const product of products) {
    if (!isSharedGuardProduct(product)) continue;
    const prev = bestByName.get(product.name);
    if (!prev || guardProductRank(product) > guardProductRank(prev)) {
      bestByName.set(product.name, product);
    }
  }
  return products.filter((product) => {
    if (!isSharedGuardProduct(product)) return true;
    return bestByName.get(product.name)?.id === product.id;
  });
}

/** Site filter + legacy guard category normalize + dedupe — use on /pricing and /order. */
export function prepareCatalogProducts<
  T extends CatalogProduct & { id: string; name: string; active?: boolean },
>(products: T[], site: SiteId = CURRENT_SITE): T[] {
  const visible = filterProductsForSite(products, site);
  const normalized = visible.map(normalizeGuardProduct);
  return dedupeSharedGuardProducts(normalized);
}

/** DB rows that should be recategorized to nightguard / sportsguard. */
export function guardCategoryFixes(
  existing: { id: string; category: string; name: string }[]
): { id: string; name: string; category: "nightguard" | "sportsguard" }[] {
  return existing.flatMap((product) => {
    const canonical = GUARD_CATEGORY_BY_NAME[product.name];
    if (!canonical || product.category === canonical) return [];
    return [{ id: product.id, name: product.name, category: canonical }];
  });
}
