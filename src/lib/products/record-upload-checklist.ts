/**
 * Scan-upload checklist for try-in–skip denture workflows.
 * Shown on Case details before STL upload — JB and non-JB paths.
 */

export type RecordChecklistItem = {
  id: string;
  label: string;
  detail?: string;
};

export type RecordUploadChecklist = {
  title: string;
  intro: string;
  jbNote?: string;
  items: RecordChecklistItem[];
};

const TRYIN_SKIP_BASE: RecordChecklistItem[] = [
  {
    id: "full_arch_scan",
    label: "Full-arch scan or model with complete peripheral borders",
    detail: "Ridge anatomy, vestibule, and retromolar pads must be visible — not a partial scan.",
  },
  {
    id: "occlusion_documented",
    label: "Occlusal relationship / vertical dimension is documented",
    detail: "CR or intended occlusal vertical must be reproducible from the files or notes.",
  },
  {
    id: "shade_reference",
    label: "Shade or tooth reference is included",
    detail: "Selected shade, photos, or adjacent tooth context for setup.",
  },
  {
    id: "tryin_skip_ack",
    label: "I understand try-in may be required if records are incomplete",
    detail: "PrintDenture fabricates from your upload. Missing VD, borders, or relation may require a try-in or remake.",
  },
];

const JB_FORK_ITEMS: RecordChecklistItem[] = [
  {
    id: "jb_fork_alignment",
    label: "JB Fork Radi+ alignment set is captured",
    detail: "Facial, CBCT, and intraoral datasets registered to the fork protocol.",
  },
  {
    id: "jb_fork_cbct",
    label: "CBCT includes fork and anterior markers in field",
  },
  {
    id: "jb_fork_ios",
    label: "Intraoral scan matches the aligned reference arch",
  },
];

const JB_TRAY_ITEMS: RecordChecklistItem[] = [
  {
    id: "jb_tray_impression",
    label: "JB Tray final impression with VD rods captured",
    detail: "One-visit impression and jaw-relation per JB Tray protocol.",
  },
  {
    id: "jb_tray_centric",
    label: "Centric relation / occlusal vertical recorded chairside",
  },
  {
    id: "jb_tray_pop",
    label: "POP Bow or anterior plane transfer included when esthetics are critical",
  },
];

const IMMEDIATE_ITEMS: RecordChecklistItem[] = [
  {
    id: "immediate_preop",
    label: "Pre-op or delivery-day scan shows ridge and extraction landmarks",
  },
  {
    id: "immediate_socket",
    label: "Socket / soft-tissue contour visible for immediate setup",
  },
];

const OVERDENTURE_ITEMS: RecordChecklistItem[] = [
  {
    id: "implant_position",
    label: "Implant position data included (aligned CBCT + IOS or scan bodies)",
  },
  {
    id: "prosthetic_space",
    label: "Tissue height and prosthetic space captured for bar / locator / All-on-X",
  },
];

const CHECKLISTS: Record<string, RecordUploadChecklist> = {
  complete: {
    title: "JB Fork Radi+ record checklist",
    intro:
      "To deliver without a try-in, your upload must contain a complete record set. JB Fork items apply when using the kit; baseline items apply to every complete denture case.",
    jbNote: "Using JB Fork Radi+? Confirm the JB-specific items below.",
    items: [...JB_FORK_ITEMS, ...TRYIN_SKIP_BASE],
  },
  jb_tray: {
    title: "JB Tray record checklist",
    intro:
      "To deliver without a try-in, your upload must reflect the one-visit JB Tray impression and jaw-relation workflow. Baseline items apply even if you use a different capture method.",
    jbNote: "Using JB Tray? Confirm the JB-specific items below.",
    items: [...JB_TRAY_ITEMS, ...TRYIN_SKIP_BASE],
  },
  immediate: {
    title: "Immediate denture record checklist",
    intro:
      "Immediate cases still need try-in–quality records from pre-op or delivery scans. Incomplete ridge or socket detail may require a try-in visit.",
    items: [...IMMEDIATE_ITEMS, ...TRYIN_SKIP_BASE],
  },
  overdenture: {
    title: "Overdenture / All-on-X record checklist",
    intro:
      "Implant cases need aligned implant-level data plus full-arch prosthetic records. JB Fork is typical — confirm implant and baseline items before uploading.",
    jbNote: "JB Fork Radi+ is the usual capture path for aligned implant datasets.",
    items: [...OVERDENTURE_ITEMS, ...JB_FORK_ITEMS, ...TRYIN_SKIP_BASE],
  },
};

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
  checked: Record<string, boolean>
): boolean {
  const list = getRecordUploadChecklist(category);
  if (!list) return true;
  return list.items.every((item) => checked[item.id]);
}

export function emptyRecordChecklistForCategory(
  category: string | null | undefined
): Record<string, boolean> {
  const list = getRecordUploadChecklist(category);
  if (!list) return {};
  return Object.fromEntries(list.items.map((item) => [item.id, false]));
}
