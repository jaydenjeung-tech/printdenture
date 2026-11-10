/**
 * User-facing prosthesis groups for PrintDenture order & marketing.
 * DB categories map into these buckets — not the other way around.
 */

import { COMPLETE_DENTURE_INTRO } from "@/lib/products/complete-denture-records";

export type DentureServiceGroupId =
  | "complete"
  | "partial"
  | "overdenture"
  | "removable"
  | "reline"
  | "design";

export type DentureServiceGroup = {
  id: DentureServiceGroupId;
  label: string;
  shortLabel: string;
  description: string;
  categories: readonly string[];
};

/** Order flow & product picker tabs — printed lab services only. */
export const DENTURE_SERVICE_GROUPS: readonly DentureServiceGroup[] = [
  {
    id: "complete",
    label: "Full denture",
    shortLabel: "Full denture",
    description: COMPLETE_DENTURE_INTRO.description,
    categories: ["jb_tray"],
  },
  {
    id: "partial",
    label: "Partial",
    shortLabel: "Partial dentures",
    description: "Printed flexible partials and temporary flippers from a scan.",
    categories: ["partial"],
  },
  {
    id: "removable",
    label: "Night guard",
    shortLabel: "Night guard",
    description: "Printed night guard from an intraoral scan.",
    categories: ["nightguard"],
  },
  {
    id: "design",
    label: "Design",
    shortLabel: "Design",
    description: "Full denture design only, $45 per arch. Fabrication and try-in are not included.",
    categories: ["design"],
  },
] as const;

/** Order page tabs. */
export const ORDER_DENTURE_SERVICE_GROUPS = DENTURE_SERVICE_GROUPS;

/** Pricing page section order (excludes equipment). */
export const DENTURE_PRICING_CATEGORY_ORDER = ["jb_tray", "partial", "nightguard"] as const;

export const PRODUCT_CATEGORY_SECTION_LABELS: Record<string, string> = {
  complete: "JB Tray records",
  jb_tray: "JB Tray records",
  immediate: "Immediate — no JB kit",
  partial: "Partial denture options",
  overdenture: "Implant-retained options",
  reline: "Reline & repair options",
  removable: "Printed night guard",
  nightguard: "Printed night guard",
  design: "Full denture design",
  sportsguard: "Sports guards",
};

export function serviceGroupForCategory(category: string): DentureServiceGroup | undefined {
  return DENTURE_SERVICE_GROUPS.find((group) => group.categories.includes(category));
}

export function isCompleteServiceGroup(groupLabel: string): boolean {
  return groupLabel === "Full denture" || groupLabel === "Complete";
}
