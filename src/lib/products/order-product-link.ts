import { ORDER_FLOW_CATEGORIES } from "@/lib/products/site-catalog";
import { resolveLegacyProductSelection } from "@/lib/products/arch-pricing";

export function orderProductHref(productId: string): string {
  return `/order?product=${encodeURIComponent(productId)}`;
}

export function orderProductAuthHref(productId: string): string {
  return `/auth?next=${encodeURIComponent(orderProductHref(productId))}`;
}

export function orderServiceGroupHref(groupId: string): string {
  return `/order?group=${encodeURIComponent(groupId)}`;
}

export function orderServiceGroupAuthHref(groupId: string): string {
  return `/auth?next=${encodeURIComponent(orderServiceGroupHref(groupId))}`;
}

/** Resolve a catalog product id (or legacy SKU id) to an active order-flow product. */
export function resolveOrderProductSelection<T extends { id: string; name: string; category: string; active?: boolean }>(
  productId: string,
  labCatalog: T[],
  visibleCatalog: T[]
): { product: T; arch: string } | null {
  const direct = labCatalog.find((p) => p.id === productId);
  if (direct) return { product: direct, arch: "" };

  const visible = visibleCatalog.find((p) => p.id === productId);
  if (!visible || !ORDER_FLOW_CATEGORIES.includes(visible.category)) return null;

  if (labCatalog.some((p) => p.id === visible.id)) {
    return { product: visible, arch: "" };
  }

  const legacy = resolveLegacyProductSelection(visible, labCatalog);
  if (legacy) return legacy;

  return null;
}
