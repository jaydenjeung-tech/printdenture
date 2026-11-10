/** Printed full dentures are captured with the JB Tray. */

export const COMPLETE_DENTURE_INTRO = {
  title: "Printed full denture",
  description:
    "Printed full denture. Record the final impression and jaw relation with the JB Tray, then we print the try-in and the finished denture.",
};

/** Shown wherever a dentist is told the try-in can be changed. */
export const TRY_IN_REVISION_NOTE =
  "The printed try-in is included. If that try-in needs a design change, a design fee is added before the final denture.";

export const RECORD_PROTOCOL_LABELS: Record<
  "complete" | "jb_tray",
  { sectionLabel: string; equipmentNote: string }
> = {
  complete: {
    sectionLabel: "Records: JB Tray",
    equipmentNote: "One-visit tray impression, vertical dimension, and centric relation.",
  },
  jb_tray: {
    sectionLabel: "Records: JB Tray",
    equipmentNote: "One-visit tray impression, vertical dimension, and centric relation.",
  },
};

export const COMPLETE_DENTURE_CATEGORIES = ["complete", "jb_tray"] as const;

export function isCompleteDentureCategory(category: string | null | undefined): boolean {
  return category === "complete" || category === "jb_tray";
}
