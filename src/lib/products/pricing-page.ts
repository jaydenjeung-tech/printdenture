import {
  DENTURE_SERVICE_GROUPS,
  PRODUCT_CATEGORY_SECTION_LABELS,
} from "@/lib/products/denture-service-groups";
import {
  EQUIPMENT_FAMILIES,
  getEquipmentFamily,
  type EquipmentFamilyId,
} from "@/lib/equipment-shop";

export type PricingProduct = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  accent: string;
  fields?: string[];
  sites?: string[] | null;
};

export type PricingLabGroup = {
  id: string;
  label: string;
  description: string;
  features: string[];
  accent: string;
  sections?: { label: string; items: PricingProduct[] }[];
  items?: PricingProduct[];
};

export type PricingDeviceGroup = {
  id: EquipmentFamilyId;
  label: string;
  description: string;
  image: string;
  accent: string;
  items: PricingProduct[];
};

const LAB_GROUP_META: Record<
  string,
  { features: string[]; accent: string }
> = {
  complete: {
    accent: "#0F6E56",
    features: ["JB Fork or JB Tray records", "Printed try-in included", "Lab CAD design", "Free remake guarantee"],
  },
  partial: {
    accent: "#1D9E75",
    features: ["Flexible & cast partial", "Removable partial & flipper", "Digital clasp design", "Free remake guarantee"],
  },
  overdenture: {
    accent: "#378ADD",
    features: ["Implant-level records", "Bar, locator & All-on-X", "Lab design & fab", "Free remake guarantee"],
  },
  removable: {
    accent: "#D97706",
    features: ["Night & sports guards", "Soft, hard & dual-laminate", "Custom colors", "Free remake guarantee"],
  },
  reline: {
    accent: "#1B2B3A",
    features: ["Mail-in or digital", "Same-week options", "Quality check included", "Free remake guarantee"],
  },
};

const DEVICE_ACCENT = "#5DCAA5";

export function splitPricingProducts(products: PricingProduct[]) {
  const equipment = products.filter((p) => p.category === "equipment");
  const lab = products.filter((p) => p.category !== "equipment");
  return { equipment, lab };
}

export function buildDevicePricingGroups(products: PricingProduct[]): PricingDeviceGroup[] {
  const byFamily: Record<EquipmentFamilyId, PricingProduct[]> = {
    jb_tray: [],
    jb_fork: [],
    pop_bow: [],
  };

  for (const product of products) {
    const family = getEquipmentFamily({
      ...product,
      fields: product.fields ?? [],
    });
    if (family) byFamily[family].push(product);
  }

  return EQUIPMENT_FAMILIES.map((family) => ({
    id: family.id,
    label: family.label,
    description: family.description,
    image: family.image,
    accent: DEVICE_ACCENT,
    items: byFamily[family.id].sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);
}

export function buildLabPricingGroups(
  products: PricingProduct[],
  categoryMeta: (cat: string, sample?: PricingProduct) => { label: string; description: string; features: string[] }
): PricingLabGroup[] {
  return DENTURE_SERVICE_GROUPS.flatMap((serviceGroup) => {
    const sections = serviceGroup.categories
      .map((cat) => ({
        label: PRODUCT_CATEGORY_SECTION_LABELS[cat] ?? categoryMeta(cat).label,
        items: products.filter((p) => p.category === cat),
      }))
      .filter((section) => section.items.length > 0);

    if (sections.length === 0) return [];

    const meta = LAB_GROUP_META[serviceGroup.id];
    return [
      {
        id: serviceGroup.id,
        label: serviceGroup.label,
        description: serviceGroup.description,
        features: meta?.features ?? categoryMeta(serviceGroup.categories[0]).features,
        accent: meta?.accent ?? "#0F6E56",
        sections: sections.length > 1 ? sections : undefined,
        items: sections.length === 1 ? sections[0].items : undefined,
      },
    ];
  });
}

export type PricingNavItem = {
  id: string;
  label: string;
  accent: string;
  tier: "devices" | "lab";
};

export function buildPricingNav(
  deviceGroups: PricingDeviceGroup[],
  labGroups: PricingLabGroup[]
): PricingNavItem[] {
  const items: PricingNavItem[] = [];

  if (deviceGroups.length > 0) {
    items.push({
      id: "devices",
      label: "Capture devices",
      accent: DEVICE_ACCENT,
      tier: "devices",
    });
  }

  for (const group of labGroups) {
    items.push({
      id: group.id,
      label: group.label,
      accent: group.accent,
      tier: "lab",
    });
  }

  return items;
}
