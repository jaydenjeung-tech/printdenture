import type { SiteId } from "@/lib/products/site-catalog";

export type GuardProductSeed = {
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

/** Night guard is on both storefronts. Sports guard stays on PrintCrown only. */
export const SHARED_GUARD_SEEDS: GuardProductSeed[] = [
  {
    category: "nightguard",
    name: "Night Guard",
    description:
      "Printed night guard for bruxism — soft, hard, or Thermo-flex. $89 per arch.",
    price: 89,
    turnaround: "5–7 business days",
    accent: "#D97706",
    fields: ["guardType", "arch"],
    active: true,
    sort_order: 80,
    sites: ["printcrown", "printdenture"],
  },
  {
    category: "sportsguard",
    name: "Sports Guard",
    description:
      "Impact-resistant custom sports guard with team color options for pediatric and adult patients.",
    price: 149,
    turnaround: "5–7 business days",
    accent: "#9333EA",
    fields: ["color", "arch"],
    active: true,
    sort_order: 81,
    sites: ["printcrown"],
  },
];

export const SHARED_GUARD_NAMES = SHARED_GUARD_SEEDS.map((s) => s.name);

function guardSeedKey(seed: Pick<GuardProductSeed, "category" | "name">): string {
  return `${seed.category}:${seed.name}`;
}

/** Insert PrintCrown-style shared guards when missing (e.g. after admin delete). */
export function sharedGuardsToInsert(
  existing: readonly { category: string; name: string }[]
): GuardProductSeed[] {
  const exactKeys = new Set(existing.map((p) => `${p.category}:${p.name}`));
  const names = new Set(existing.map((p) => p.name));

  return SHARED_GUARD_SEEDS.filter((seed) => {
    if (exactKeys.has(guardSeedKey(seed))) return false;
    // Legacy row with same name but wrong category — category sync fixes it; don't duplicate.
    if (names.has(seed.name)) return false;
    return true;
  });
}
