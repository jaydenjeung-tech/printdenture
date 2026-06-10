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
  | "reline";

export type DentureServiceGroup = {
  id: DentureServiceGroupId;
  label: string;
  shortLabel: string;
  description: string;
  categories: readonly string[];
};

/** Order flow & product picker tabs */
export const DENTURE_SERVICE_GROUPS: readonly DentureServiceGroup[] = [
  {
    id: "complete",
    label: "Complete",
    shortLabel: "Complete dentures",
    description: COMPLETE_DENTURE_INTRO.description,
    categories: ["complete", "jb_tray", "immediate"],
  },
  {
    id: "partial",
    label: "Partial",
    shortLabel: "Partial dentures",
    description:
      "Flexible and cast partials, removable partials, and temporary flippers — scan, upload, and our lab designs the prosthesis.",
    categories: ["partial"],
  },
  {
    id: "overdenture",
    label: "Overdenture / All-on-X",
    shortLabel: "Implant cases",
    description:
      "Locator or bar overdentures and full-arch All-on-X when implant position is in your aligned CBCT / IOS dataset.",
    categories: ["overdenture"],
  },
  {
    id: "removable",
    label: "Removables",
    shortLabel: "Guards",
    description:
      "Custom night guards and sports guards from intraoral scans — not denture prosthetics.",
    categories: ["nightguard", "sportsguard"],
  },
  {
    id: "reline",
    label: "Reline / repair",
    shortLabel: "Maintenance",
    description:
      "Hard or soft reline, tooth fracture, and base repair on prostheses already in the patient's mouth.",
    categories: ["reline"],
  },
] as const;

/** Pricing page section order (excludes equipment). */
export const DENTURE_PRICING_CATEGORY_ORDER = [
  "complete",
  "jb_tray",
  "immediate",
  "partial",
  "overdenture",
  "reline",
  "nightguard",
  "sportsguard",
] as const;

export const PRODUCT_CATEGORY_SECTION_LABELS: Record<string, string> = {
  complete: "JB Fork Radi+ records",
  jb_tray: "JB Tray records",
  immediate: "Immediate — no JB kit",
  partial: "Partial denture options",
  overdenture: "Implant-retained options",
  reline: "Reline & repair options",
  removable: "Night & sports guards",
  nightguard: "Night guards",
  sportsguard: "Sports guards",
};

export function serviceGroupForCategory(category: string): DentureServiceGroup | undefined {
  return DENTURE_SERVICE_GROUPS.find((group) => group.categories.includes(category));
}

export function isCompleteServiceGroup(groupLabel: string): boolean {
  return groupLabel === "Complete";
}
