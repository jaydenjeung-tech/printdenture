/**
 * PrintDenture equipment shop — PNUADD / Add-on Dental chairside devices.
 * @see https://www.add-ondental.com/sub/sub_0201.php
 */

import { ADD_ON_DENTAL_ATTRIBUTION } from "@/lib/products/chairside-equipment";

export type EquipmentFamilyId = "jb_tray" | "jb_fork" | "pop_bow";

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  accent: string;
  fields: string[];
};

export type EquipmentFamily = {
  id: EquipmentFamilyId;
  label: string;
  description: string;
  image: string;
  variantHints: string[];
  orderHint?: string;
};

export const EQUIPMENT_SHOP_ATTRIBUTION = ADD_ON_DENTAL_ATTRIBUTION;

export const EQUIPMENT_FAMILIES: EquipmentFamily[] = [
  {
    id: "jb_tray",
    label: "JB Tray",
    description:
      "One box = five upper + lower tray sets. POP Bow is sold separately (PNUADD / Add-on Dental).",
    image: "/images/jb-tray/product.jpg",
    variantHints: ["Box · 5 upper/lower sets · $99"],
    orderHint: "One JB Tray box is enough to start — add an ADD POP Bow pouch if you need esthetic transfer supplies.",
  },
  {
    id: "jb_fork",
    label: "JB Fork Radi+",
    description:
      "JB Fork Solution with Radi+ markers for digital & implant jaw-relation records. POP Bow sold separately.",
    image: "/images/jb-fork/product.jpg",
    variantHints: ["Box · 10 units · $99"],
    orderHint: "One box includes ten chairside units. POP Bow is optional and ordered separately.",
  },
  {
    id: "pop_bow",
    label: "ADD POP Bow",
    description:
      "Occlusal plane & anterior esthetic transfer — separate from JB Tray and JB Fork boxes.",
    image: "/images/jb-tray/pop-bow.jpg",
    variantHints: ["Pouch · 12 sets · $21"],
    orderHint: "Use with JB Tray or JB Fork when you need POP Bow transfer — not included in tray or fork boxes.",
  },
];

const VARIANT_BADGES: Record<string, string> = {
  trayBox: "JB Tray box",
  forkBox: "Box · 10 EA",
  popBowPouch: "Pouch · 12 sets",
};

const VARIANT_SHORT: Record<string, string> = {
  trayBox: "Tray box (5 sets)",
  forkBox: "Fork box (10 EA)",
  popBowPouch: "POP Bow pouch",
};

export function getEquipmentFamily(product: ShopProduct): EquipmentFamilyId | null {
  if (product.fields.includes("jbTray")) return "jb_tray";
  if (product.fields.includes("jbFork")) return "jb_fork";
  if (product.fields.includes("popBow")) return "pop_bow";
  return null;
}

export function groupProductsByFamily(products: ShopProduct[]): Record<EquipmentFamilyId, ShopProduct[]> {
  const grouped: Record<EquipmentFamilyId, ShopProduct[]> = {
    jb_tray: [],
    jb_fork: [],
    pop_bow: [],
  };
  for (const product of products) {
    const family = getEquipmentFamily(product);
    if (family) grouped[family].push(product);
  }
  for (const family of Object.keys(grouped) as EquipmentFamilyId[]) {
    grouped[family].sort((a, b) => a.name.localeCompare(b.name));
  }
  return grouped;
}

export function getVariantBadge(fields: string[]): string | null {
  for (const key of Object.keys(VARIANT_BADGES)) {
    if (fields.includes(key)) return VARIANT_BADGES[key];
  }
  return null;
}

export function getVariantShortLabel(fields: string[]): string {
  for (const key of Object.keys(VARIANT_SHORT)) {
    if (fields.includes(key)) return VARIANT_SHORT[key];
  }
  return "Standard";
}

/** Default SKU for quick equipment purchase from dashboard / readiness flow. */
export function getDefaultProductForFamily(
  products: ShopProduct[],
  family: EquipmentFamilyId
): ShopProduct | undefined {
  if (family === "jb_tray") {
    return products.find((p) => p.fields.includes("jbTray") && p.fields.includes("trayBox"));
  }
  if (family === "jb_fork") {
    return products.find((p) => p.fields.includes("jbFork") && p.fields.includes("forkBox"));
  }
  return products.find((p) => p.fields.includes("popBow") && p.fields.includes("popBowPouch"));
}

export function parseShopFamilyParam(value: string | null): EquipmentFamilyId | null {
  if (value === "jb_tray" || value === "jb_fork" || value === "pop_bow") return value;
  return null;
}

export const SHOP_QUANTITY_MIN = 1;
export const SHOP_QUANTITY_MAX = 20;
