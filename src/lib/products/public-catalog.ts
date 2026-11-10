/** JB Fork is no longer offered. Hide those SKUs and scrub leftover catalog copy. */

export function isJbForkOffering(product: {
  name?: string | null;
  category?: string | null;
  fields?: string[] | null;
}): boolean {
  if (product.category === "complete") return true;
  const fields = product.fields ?? [];
  if (fields.includes("jbFork") || fields.includes("forkBox")) return true;
  return /\bjb\s*fork\b/i.test(product.name ?? "");
}

export function withoutJbForkCopy(text: string): string {
  return text
    .replace(/\s*[—–-]\s*JB Fork[^.]*(?:\.|$)/gi, "")
    .replace(/\bJB Fork(?:\s+Radi\+)?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .trim();
}
