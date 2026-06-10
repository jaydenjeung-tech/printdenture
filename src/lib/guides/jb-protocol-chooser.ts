/** PNUADD-aligned Fork vs Tray decision criteria — shared across shop, order, and marketing. */

import { JB_FORK_GUIDE_PATH } from "@/lib/guides/jb-fork-guide";
import { JB_TRAY_GUIDE_PATH } from "@/lib/guides/jb-tray-guide";

export type JbProtocolId = "jb_tray" | "jb_fork";

export const JB_PROTOCOL_CHOOSER = {
  eyebrow: "JB & JD Design · PNUADD",
  title: "Which JB protocol?",
  subtitle:
    "Most visits use one device — Fork or Tray. Pick based on how you capture and align records. PNUADD teaching also describes sequential workflows and mixed practices where both kits add value (see below).",
  decisionQuestion: "Do you need Radi+ to align facial scan, CBCT, and intraoral scan in one dataset?",
  decisionYes: "Yes — use JB Fork Radi+",
  decisionNo: "No — use JB Tray",
  notBothNote:
    "Same record visit: use Fork or Tray, not both at once. ADD POP Bow is sold separately (pouch, 12 sets) — optional for esthetic transfer with either protocol.",
  bothHelpTitle: "When both kits help",
  attribution:
    "Criteria adapted from PNUADD JB Tray & JB Fork guides, Dr. Jung-Bo Huh integrated-workflow demos, and PNUADD full-arch implant case reports.",
} as const;

export type JbProtocolBothScenario = {
  id: string;
  title: string;
  summary: string;
  steps?: readonly string[];
  bestFor: string;
  /** Clarifies common misconceptions (e.g. All-on-X) */
  note?: string;
  kitsNeeded: readonly JbProtocolId[];
};

/** Sequential or practice-level setups where owning / using both Fork and Tray is worthwhile. */
export const JB_PROTOCOL_BOTH_SCENARIOS: readonly JbProtocolBothScenario[] = [
  {
    id: "digital-complete-tray-fork",
    title: "Digital complete denture — Tray impression, then Fork after scan",
    summary:
      "PNUADD’s integrated digital workflow: border-molded final impressions with JB Tray, intraoral scan, then post-scan jaw relation with JB Fork overlaid on the scan dataset.",
    steps: [
      "Final impression with JB Tray (border mold + VD/CR as taught)",
      "Intraoral or model scan of the impression / master cast",
      "Post-scan jaw relation recorded with JB Fork and merged in CAD",
    ],
    bestFor:
      "Digital complete dentures when you want Tray-quality peripheral impressions plus Fork bite registration on the scanned virtual cast.",
    note: "Documented in PNUADD clinician demos (Dr. Jung-Bo Huh) — a sequential same-case workflow, not two devices in one step.",
    kitsNeeded: ["jb_tray", "jb_fork"],
  },
  {
    id: "all-on-x-fork-primary",
    title: "All-on-X & full-arch implant — Fork Radi+ on the definitive record visit",
    summary:
      "PNUADD full-arch implant case reports use JB Fork for one-step jaw relation with fixture-level or IOS master data, facial scan, and Radi+ alignment — not JB Tray on that definitive visit.",
    steps: [
      "Fixture-level impression or IOS of implant positions",
      "Same visit: JB Fork for VD, Gothic arch, bite registration, and anterior esthetics",
      "Facial scan / CBCT with Radi+ markers merged for virtual patient design",
    ],
    bestFor:
      "Definitive All-on-X, bar overdenture, and full-arch implant prostheses sent to a digital lab.",
    note:
      "All-on-X is primarily a Fork (Radi+) case — not “Tray plus Fork on the same record visit.” Many implant practices still keep a Tray kit for other patients or earlier treatment phases.",
    kitsNeeded: ["jb_fork"],
  },
  {
    id: "implant-healing-plus-definitive",
    title: "Implant journey — Tray interim, Fork definitive (different visits)",
    summary:
      "During healing or prosthetic space development, JB Tray can fabricate immediate trays or complete interim dentures. After integration, JB Fork Radi+ captures the definitive implant jaw-relation set.",
    bestFor:
      "Full-mouth rehab where the same patient needs interim removable prosthetics (Tray) before implant definitive records (Fork).",
    kitsNeeded: ["jb_tray", "jb_fork"],
  },
  {
    id: "mixed-practice-inventory",
    title: "Mixed removable + implant practice — stock both kits",
    summary:
      "Different patients, different protocols: routine edentulous completes on JB Tray; implant and digital full-arch cases on JB Fork Radi+.",
    bestFor: "Offices that submit both complete-denture and overdenture / All-on-X lab cases to PrintDenture.",
    kitsNeeded: ["jb_tray", "jb_fork"],
  },
  {
    id: "fork-pop-bow-restock",
    title: "Fork cases without a facial scanner — ADD POP Bow pouch",
    summary:
      "When using JB Fork without facial scan, ADD POP Bow transfers occlusal plane and anterior esthetics — order the separate pouch (12 sets).",
    bestFor:
      "Fork-protocol cases where you need POP Bow esthetic transfer — still a Fork case, not Fork plus Tray.",
    kitsNeeded: ["jb_fork"],
  },
] as const;

export type JbProtocolOption = {
  id: JbProtocolId;
  label: string;
  tagline: string;
  chooseWhen: readonly string[];
  recordsInclude: readonly string[];
  guidePath: string;
  shopFamily: JbProtocolId;
};

export const JB_PROTOCOL_OPTIONS: readonly JbProtocolOption[] = [
  {
    id: "jb_tray",
    label: "JB Tray",
    tagline: "One-visit final impression tray — upper & lower sets per box",
    chooseWhen: [
      "Routine edentulous complete dentures",
      "Chairside thermoplastic tray — border mold, final impression, VD, CR",
      "IOS or model scan after impressions — no Radi+ alignment stack",
      "Analog or digital denture workflow without CBCT / facial fusion",
    ],
    recordsInclude: [
      "Final maxillary & mandibular impressions",
      "Vertical dimension (VD rods) & centric relation",
      "POP Bow — occlusal plane, lip line, anterior tooth position",
    ],
    guidePath: JB_TRAY_GUIDE_PATH,
    shopFamily: "jb_tray",
  },
  {
    id: "jb_fork",
    label: "JB Fork Radi+",
    tagline: "Jaw-relation device with radiopaque markers for multi-modal alignment",
    chooseWhen: [
      "Digital complete dentures with aligned scan sets",
      "All-on-X, bar overdenture, and full-arch implant definitive records",
      "Facial scanner + CBCT + IOS registered via Radi+ markers",
      "Guided surgery or CBCT object-scan workflows",
    ],
    recordsInclude: [
      "Final impressions + Gothic arch + bite registration",
      "Radi+ markers visible on facial scan and CBCT",
      "Optional ADD POP Bow when facial scanner is unavailable",
    ],
    guidePath: JB_FORK_GUIDE_PATH,
    shopFamily: "jb_fork",
  },
] as const;

export const JB_PROTOCOL_SKIP_JB = {
  label: "No JB kit needed",
  cases: [
    "Immediate / extraction dentures — submit pre-op or day-of scans directly",
    "Partials, guards, reline & repair — standard scan upload, no JB protocol",
  ],
} as const;

export function getProtocolOption(id: JbProtocolId): JbProtocolOption {
  return JB_PROTOCOL_OPTIONS.find((o) => o.id === id)!;
}
