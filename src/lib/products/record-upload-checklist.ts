/**
 * Scan-upload checklist for try-in–skip denture workflows.
 * Required items gate submission; recommended items guide richer uploads.
 */

import {
  CASE_FILE_KIND_ORDER,
  type CaseFileKind,
} from "@/lib/products/case-files";
import { TRY_IN_REVISION_NOTE } from "@/lib/products/complete-denture-records";

export type ChecklistItemTier = "required" | "recommended";

export type CaseFileSatisfier =
  | { type: "file"; kinds: CaseFileKind[] }
  | { type: "file_all"; groups: CaseFileKind[][] }
  | { type: "shade_or_photo" }
  | { type: "acknowledgment" };

export type RecordChecklistItem = {
  id: string;
  label: string;
  detail?: string;
  satisfier: CaseFileSatisfier;
  tier: ChecklistItemTier;
};

export type RecordUploadChecklist = {
  title: string;
  intro: string;
  jbNote?: string;
  items: RecordChecklistItem[];
};

export type RecordChecklistContext = {
  files: readonly { kind: CaseFileKind }[];
  shade: string;
  acknowledgments: Record<string, boolean>;
};

const TRYIN_SKIP_BASE: RecordChecklistItem[] = [
  {
    id: "full_arch_scan",
    label: "Full-arch scan or model with complete peripheral borders",
    detail: "Ridge anatomy, vestibule, and retromolar pads visible — not a partial scan.",
    tier: "recommended",
    satisfier: { type: "file", kinds: ["scan"] },
  },
  {
    id: "occlusion_documented",
    label: "Occlusal relationship / vertical dimension is documented",
    detail: "CR or intended occlusal vertical reproducible from files or notes.",
    tier: "recommended",
    satisfier: { type: "file", kinds: ["scan", "document"] },
  },
  {
    id: "shade_reference",
    label: "Shade or tooth reference is included",
    detail: "Select a shade above, upload reference photos, or both.",
    tier: "recommended",
    satisfier: { type: "shade_or_photo" },
  },
  {
    id: "tryin_skip_ack",
    label: "I understand a design change after the printed try-in adds a design fee",
    detail: TRY_IN_REVISION_NOTE,
    tier: "required",
    satisfier: { type: "acknowledgment" },
  },
];

const JB_TRAY_ITEMS: RecordChecklistItem[] = [
  {
    id: "jb_tray_impression",
    label: "JB Tray final impression with VD rods captured",
    detail: "One-visit impression and jaw-relation per JB Tray protocol.",
    tier: "required",
    satisfier: { type: "file", kinds: ["scan"] },
  },
  {
    id: "jb_tray_centric",
    label: "Centric relation / occlusal vertical recorded chairside",
    tier: "recommended",
    satisfier: { type: "file", kinds: ["scan", "document"] },
  },
  {
    id: "jb_tray_pop",
    label: "POP Bow or anterior plane transfer when esthetics are critical",
    tier: "recommended",
    satisfier: { type: "file", kinds: ["photo", "document", "scan"] },
  },
];

const IMMEDIATE_ITEMS: RecordChecklistItem[] = [
  {
    id: "immediate_preop",
    label: "Pre-op or delivery-day scan shows ridge and extraction landmarks",
    tier: "recommended",
    satisfier: { type: "file", kinds: ["scan"] },
  },
  {
    id: "immediate_socket",
    label: "Socket / soft-tissue contour visible for immediate setup",
    tier: "recommended",
    satisfier: { type: "file", kinds: ["scan"] },
  },
];

const OVERDENTURE_ITEMS: RecordChecklistItem[] = [
  {
    id: "implant_position",
    label: "Implant position data included (aligned CBCT + IOS or scan bodies)",
    tier: "recommended",
    satisfier: { type: "file_all", groups: [["scan"], ["cbct", "archive"]] },
  },
  {
    id: "prosthetic_space",
    label: "Tissue height and prosthetic space captured for bar / locator / All-on-X",
    tier: "recommended",
    satisfier: { type: "file", kinds: ["scan"] },
  },
];

const CHECKLISTS: Record<string, RecordUploadChecklist> = {
  complete: {
    title: "JB Tray record checklist",
    intro: `Upload the JB Tray impression scan. ${TRY_IN_REVISION_NOTE}`,
    jbNote: "The impression scan is required. Jaw-relation notes and POP Bow photos help the setup.",
    items: [...JB_TRAY_ITEMS, ...TRYIN_SKIP_BASE],
  },
  jb_tray: {
    title: "JB Tray record checklist",
    intro: `Upload the JB Tray impression scan. ${TRY_IN_REVISION_NOTE}`,
    jbNote: "The impression scan is required. Jaw-relation notes and POP Bow photos help the setup.",
    items: [...JB_TRAY_ITEMS, ...TRYIN_SKIP_BASE],
  },
  immediate: {
    title: "Immediate denture record checklist",
    intro:
      "One scan file and the confirmation below are required. Pre-op ridge and socket detail in the scan reduces try-in risk.",
    items: [...IMMEDIATE_ITEMS, ...TRYIN_SKIP_BASE],
  },
  overdenture: {
    title: "Overdenture / All-on-X record checklist",
    intro:
      "One scan file and the confirmation below are required. Implant-level CBCT and aligned IOS data are strongly recommended.",
    items: [...OVERDENTURE_ITEMS, ...TRYIN_SKIP_BASE],
  },
};

function satisfiesFileKinds(
  kinds: CaseFileKind[],
  files: readonly { kind: CaseFileKind }[]
): boolean {
  return files.some((f) => kinds.includes(f.kind));
}

export function isChecklistItemSatisfied(
  item: RecordChecklistItem,
  ctx: RecordChecklistContext
): boolean {
  switch (item.satisfier.type) {
    case "acknowledgment":
      return !!ctx.acknowledgments[item.id];
    case "shade_or_photo":
      return !!ctx.shade || ctx.files.some((f) => f.kind === "photo");
    case "file":
      return satisfiesFileKinds(item.satisfier.kinds, ctx.files);
    case "file_all":
      return item.satisfier.groups.every((group) => satisfiesFileKinds(group, ctx.files));
    default:
      return false;
  }
}

function collectKindsFromSatisfier(
  satisfier: CaseFileSatisfier,
  kinds: Set<CaseFileKind>,
  tier: ChecklistItemTier,
  itemTier: ChecklistItemTier
) {
  if (tier !== itemTier) return;
  if (satisfier.type === "file") {
    satisfier.kinds.forEach((k) => kinds.add(k));
  } else if (satisfier.type === "file_all") {
    satisfier.groups.flat().forEach((k) => kinds.add(k));
  } else if (satisfier.type === "shade_or_photo") {
    kinds.add("photo");
  }
}

/** File kinds marked required on checklist items — always includes scan minimum. */
export function requiredFileKindsForChecklist(
  checklist: RecordUploadChecklist | null
): CaseFileKind[] {
  if (!checklist) return ["scan"];
  const kinds = new Set<CaseFileKind>(["scan"]);
  for (const item of checklist.items) {
    if (item.tier !== "required") continue;
    collectKindsFromSatisfier(item.satisfier, kinds, "required", item.tier);
  }
  return CASE_FILE_KIND_ORDER.filter((k) => kinds.has(k));
}

export function recommendedFileKindsForChecklist(
  checklist: RecordUploadChecklist | null
): CaseFileKind[] {
  if (!checklist) return [];
  const kinds = new Set<CaseFileKind>();
  for (const item of checklist.items) {
    if (item.tier !== "recommended") continue;
    collectKindsFromSatisfier(item.satisfier, kinds, "recommended", item.tier);
  }
  return CASE_FILE_KIND_ORDER.filter((k) => kinds.has(k));
}

export function fileKindsHintForItem(item: RecordChecklistItem): string | null {
  switch (item.satisfier.type) {
    case "file":
      return item.satisfier.kinds.join(", ");
    case "file_all":
      return item.satisfier.groups.map((g) => g.join(" or ")).join(" + ");
    case "shade_or_photo":
      return "shade or photo";
    case "acknowledgment":
      return null;
  }
}

export function getRecordUploadChecklist(
  category: string | null | undefined
): RecordUploadChecklist | null {
  if (!category) return null;
  return CHECKLISTS[category] ?? null;
}

export function isRecordChecklistRequired(category: string | null | undefined): boolean {
  return getRecordUploadChecklist(category) !== null;
}

export function isRecordChecklistComplete(
  category: string | null | undefined,
  ctx: RecordChecklistContext
): boolean {
  const list = getRecordUploadChecklist(category);
  if (!list) return true;
  return list.items
    .filter((item) => item.tier === "required")
    .every((item) => isChecklistItemSatisfied(item, ctx));
}

export function buildRecordChecklistSnapshot(
  category: string | null | undefined,
  ctx: RecordChecklistContext
): {
  confirmedAt: string;
  items: Record<string, boolean>;
  tiers: Record<string, ChecklistItemTier>;
} | null {
  const list = getRecordUploadChecklist(category);
  if (!list) return null;
  return {
    confirmedAt: new Date().toISOString(),
    items: Object.fromEntries(
      list.items.map((item) => [item.id, isChecklistItemSatisfied(item, ctx)])
    ),
    tiers: Object.fromEntries(list.items.map((item) => [item.id, item.tier])),
  };
}

export function emptyRecordChecklistForCategory(
  category: string | null | undefined
): Record<string, boolean> {
  const list = getRecordUploadChecklist(category);
  if (!list) return {};
  return Object.fromEntries(
    list.items
      .filter((item) => item.satisfier.type === "acknowledgment")
      .map((item) => [item.id, false])
  );
}
