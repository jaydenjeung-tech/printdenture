import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CURRENT_SITE,
  getProductSites,
  type CatalogProduct,
  type SiteId,
} from "@/lib/products/site-catalog";

export { CURRENT_SITE };
export type { SiteId };

export type ThreadSite = SiteId | "shared";

type OrderScopeRow = {
  product_id?: string | null;
  product_name?: string | null;
  site?: string | null;
};

type ProductScopeRow = CatalogProduct & { id: string };

type SupportMessageScope = {
  id: string;
  user_id: string;
  order_id: string | null;
  site?: string | null;
  created_at: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isSiteId(value: string | null | undefined): value is SiteId {
  return value === "printcrown" || value === "printdenture";
}

function isUuid(value: string) {
  return UUID_RE.test(value);
}

/** Legacy rows stored a category slug in product_id. A name check covers a failed catalog lookup. */
function fallbackProduct(order: OrderScopeRow): CatalogProduct | null {
  const productId = order.product_id?.trim();
  if (productId && !isUuid(productId)) return { category: productId };
  const name = order.product_name?.trim() ?? "";
  if (!name) return null;
  if (/guard/i.test(name)) return { category: "nightguard" };
  if (/denture|partial|overdenture|reline|jb[\s-]?tray|jb[\s-]?fork|immediate/i.test(name)) {
    return { category: "complete" };
  }
  if (/zirconia|crown|implant|abutment|veneer/i.test(name)) return { category: "zirconia" };
  return null;
}

export function isMissingSiteColumn(error: { message?: string; code?: string } | null | undefined) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    error.code === "PGRST204" ||
    (message.includes("site") &&
      (message.includes("schema cache") ||
        message.includes("does not exist") ||
        message.includes("could not find")))
  );
}

export function threadSiteForOrder(
  order: OrderScopeRow,
  product: CatalogProduct | null | undefined
): ThreadSite {
  if (isSiteId(order.site)) return order.site;
  if (!product) return "shared";
  const sites = getProductSites(product);
  if (sites.length === 1) return sites[0];
  return "shared";
}

export function orderBelongsToSite(
  order: OrderScopeRow,
  product: CatalogProduct | null | undefined,
  site: SiteId = CURRENT_SITE
) {
  const where = threadSiteForOrder(order, product);
  return where === "shared" || where === site;
}

async function loadProducts(supabase: SupabaseClient, ids: string[]): Promise<ProductScopeRow[]> {
  const uuidIds = [...new Set(ids.filter(isUuid))];
  if (uuidIds.length === 0) return [];
  const { data, error } = await supabase.from("products").select("id, category, sites").in("id", uuidIds);
  if (error) return [];
  return (data ?? []) as ProductScopeRow[];
}

function productForOrder(order: OrderScopeRow, byId: Map<string, ProductScopeRow>): CatalogProduct | null {
  const productId = order.product_id ?? "";
  if (productId && byId.has(productId)) return byId.get(productId) ?? null;
  return fallbackProduct(order);
}

export async function scopeOrdersForSite<T extends OrderScopeRow>(
  supabase: SupabaseClient,
  orders: T[],
  site: SiteId = CURRENT_SITE
): Promise<T[]> {
  const productIds = [...new Set(orders.map((order) => order.product_id).filter((id): id is string => Boolean(id)))];
  const products = await loadProducts(supabase, productIds);
  const byId = new Map(products.map((product) => [product.id, product]));
  return orders.filter((order) => orderBelongsToSite(order, productForOrder(order, byId), site));
}

function assignThreadSites<T extends SupportMessageScope>(
  messages: T[],
  orderSites: Map<string, ThreadSite>
): Map<string, ThreadSite> {
  const sorted = [...messages].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const assigned = new Map<string, ThreadSite>();
  let carry: SiteId | null = null;

  for (const message of sorted) {
    let where: ThreadSite = "shared";
    if (isSiteId(message.site)) where = message.site;
    else if (message.order_id && orderSites.has(message.order_id)) where = orderSites.get(message.order_id)!;
    else if (carry) where = carry;

    if (where !== "shared") carry = where;
    assigned.set(message.id, where);
  }

  return assigned;
}

export async function visibleSupportMessages<T extends SupportMessageScope>(
  supabase: SupabaseClient,
  messages: T[],
  site: SiteId = CURRENT_SITE
): Promise<T[]> {
  if (messages.length === 0) return [];

  const orderIds = [...new Set(messages.map((message) => message.order_id).filter((id): id is string => Boolean(id)))];
  const orderSites = new Map<string, ThreadSite>();

  if (orderIds.length > 0) {
    const withSite = await supabase.from("orders").select("id, product_id, product_name, site").in("id", orderIds);
    const orders = isMissingSiteColumn(withSite.error)
      ? ((await supabase.from("orders").select("id, product_id, product_name").in("id", orderIds)).data ?? [])
      : (withSite.data ?? []);

    const productIds = [
      ...new Set(
        (orders as OrderScopeRow[])
          .map((order) => order.product_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];
    const products = await loadProducts(supabase, productIds);
    const byProduct = new Map(products.map((product) => [product.id, product]));

    for (const order of orders as Array<OrderScopeRow & { id: string }>) {
      orderSites.set(order.id, threadSiteForOrder(order, productForOrder(order, byProduct)));
    }
  }

  const byUser = new Map<string, T[]>();
  for (const message of messages) {
    const thread = byUser.get(message.user_id) ?? [];
    thread.push(message);
    byUser.set(message.user_id, thread);
  }

  const visibleIds = new Set<string>();
  for (const thread of byUser.values()) {
    const assigned = assignThreadSites(thread, orderSites);
    for (const message of thread) {
      const where = assigned.get(message.id) ?? "shared";
      if (where === "shared" || where === site) visibleIds.add(message.id);
    }
  }

  return messages.filter((message) => visibleIds.has(message.id));
}

type InsertedRow = {
  id: string;
  case_number?: number | null;
  [key: string]: unknown;
};

export async function insertWithOptionalSite<T extends { id: string } = InsertedRow>(
  supabase: SupabaseClient,
  table: "orders" | "support_messages",
  row: Record<string, unknown>
): Promise<{ data: T | null; error: { message: string; code?: string } | null }> {
  const tagged = { ...row, site: CURRENT_SITE };
  const first = await supabase.from(table).insert(tagged).select().single();
  if (!first.error) return first as { data: T | null; error: { message: string; code?: string } | null };
  if (!isMissingSiteColumn(first.error)) {
    return first as { data: T | null; error: { message: string; code?: string } | null };
  }
  const retry = await supabase.from(table).insert(row).select().single();
  return retry as { data: T | null; error: { message: string; code?: string } | null };
}
