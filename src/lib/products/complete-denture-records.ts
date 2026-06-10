/** Complete dentures share one prosthesis type — JB Fork vs JB Tray is the records protocol. */

export const COMPLETE_DENTURE_INTRO = {
  title: "Complete dentures",
  description:
    "Full-arch removable prosthetics. Pick one PNUADD record protocol per case — JB Fork Radi+ (Radi+ alignment) or JB Tray (one-visit tray impressions). Immediate cases skip JB kits and upload scans directly.",
};

export const RECORD_PROTOCOL_LABELS: Record<
  "complete" | "jb_tray",
  { sectionLabel: string; equipmentNote: string }
> = {
  complete: {
    sectionLabel: "Records: JB Fork Radi+",
    equipmentNote: "Radi+ aligns facial, CBCT, and IOS — choose for digital full-arch & implant cases.",
  },
  jb_tray: {
    sectionLabel: "Records: JB Tray",
    equipmentNote: "One-visit tray impression + VD/CR — choose when Radi+ alignment is not needed.",
  },
};

export const COMPLETE_DENTURE_CATEGORIES = ["complete", "jb_tray"] as const;

export function isCompleteDentureCategory(category: string | null | undefined): boolean {
  return category === "complete" || category === "jb_tray";
}
