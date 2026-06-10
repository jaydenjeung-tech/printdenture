/** JB Fork Radi+ clinical guide — content aligned with PNUADD / JB & JD Design workflows. */

export const JB_FORK_GUIDE_PATH = "/guides/jb-fork";

export const JB_FORK_HERO = {
  eyebrow: "JB & JD Design · PNUADD",
  title: "JB Fork Radi+",
  subtitle: "One-step jaw relation recording for digital & conventional dentures",
  description:
    "An inter-maxillary relationship device that replaces occlusal wax rims. Capture final impressions, vertical dimension, centric relation, and esthetic references in a single visit — then align facial scan, CBCT, and IOS data with Radi+ markers.",
};

export const JB_FORK_FEATURES = [
  {
    title: "Impression & jaw relation in one visit",
    description:
      "Record final impressions, vertical dimension, Gothic arch tracing, and centric relation simultaneously — reducing visits compared with separate custom trays and wax rims.",
  },
  {
    title: "Digital & analog compatible",
    description:
      "Works with intraoral scanners, model scanners, CBCT object scans, and conventional denture fabrication. Design in 3Shape, Exocad, or your existing CAD workflow.",
  },
  {
    title: "JB Fork Radi+ multi-modal alignment",
    description:
      "Radiopaque anterior markers and guide pins register facial scanner data (e.g. RAYFace), CBCT, and intraoral scans into one verified dataset for implant and full-arch cases.",
  },
  {
    title: "POP Bow integration",
    description:
      "When a facial scanner is unavailable, ADD POP Bow captures occlusal plane, lip line, and anterior tooth position — the same esthetic transfer philosophy as JB Tray.",
  },
] as const;

export const JB_FORK_COMPONENTS = [
  {
    label: "Upper & lower plates",
    image: "/images/jb-fork/components.jpg",
    alt: "JB Fork Radi+ upper and lower plates with anterior markers",
    detail: "Rigid plates for putty/VPS impression and bite registration between arches.",
  },
  {
    label: "Anterior tooth set & screws",
    image: "/images/jb-fork/impression-chairside.jpg",
    alt: "JB Fork intraoral impression with anterior teeth",
    detail: "Six maxillary anterior teeth for midline, lip support, and incisal reference before final bite.",
  },
  {
    label: "Radi+ markers & guide pins",
    image: "/images/jb-fork/product.jpg",
    alt: "JB Fork Radi+ product with radiopaque markers",
    detail: "Anterior markers visible on CBCT and facial scans for cross-modality registration.",
  },
] as const;

export const JB_FORK_RADI_PLUS = [
  "Facial scan — lip line and anterior esthetics aligned to Radi+ markers",
  "CBCT — radiopaque markers visible for implant planning and object scans",
  "Intraoral scan — impression and bite surfaces registered to the same coordinate system",
  "Lab import — merged virtual patient sent to PrintDenture for definitive fabrication",
] as const;

export const JB_FORK_DIGITAL_STEPS = [
  {
    n: 1,
    title: "Baseline scan (optional)",
    body: "If using an intraoral scanner, capture pre-operative or preliminary data. Traditional final impressions are also acceptable when IOS is unavailable.",
  },
  {
    n: 2,
    title: "Maxillary JB Fork application",
    body: "Apply tray adhesive to the maxillary plate. Assemble anterior teeth to the plate — align midline with the facial midline and position incisal edges about 1 mm below the upper lip. Load putty/VPS, insert, and verify lip support, midline, and incisal line.",
  },
  {
    n: 3,
    title: "Mandibular JB Fork application",
    body: "Apply JB Fork to the mandible with putty and VPS using the same chairside protocol.",
  },
  {
    n: 4,
    title: "Vertical dimension & Gothic arch",
    body: "Assemble screws between plates to establish vertical dimension. Perform Gothic arch tracing and mark the centric relation apex (a small hole at the tracing apex aids bite registration retention).",
  },
  {
    n: 5,
    title: "Bite registration",
    body: "Apply VPS bite registration material between the upper and lower plates to fix the specified vertical dimension and centric relation.",
    tip: "Tray adhesive on the plates improves adhesion of silicone bite material.",
  },
  {
    n: 6,
    title: "Occlusal plane & facial reference",
    body: "Capture a 3D facial scan with Radi+ markers visible, or record the occlusal plane with ADD POP Bow when a facial scanner is not available.",
  },
  {
    n: 7,
    title: "Scan & design",
    body: "Scan impressions intraorally, on a model scanner, or as a CBCT object scan. Import aligned datasets into 3Shape or Exocad for digital denture design.",
  },
] as const;

export const JB_FORK_CONVENTIONAL_STEPS = [
  { n: 1, title: "Apply JB Fork", body: "Seat upper and lower JB Fork plates with impression material on both arches." },
  { n: 2, title: "Gothic arch tracing", body: "Establish vertical dimension and record centric relation with tracing." },
  { n: 3, title: "Bite registration", body: "Fix VD and CR with VPS between the plates." },
  {
    n: 4,
    title: "POP Bow (optional)",
    body: "Transfer occlusal plane and anterior esthetics with ADD POP Bow for laboratory mounting.",
  },
] as const;

export const JB_FORK_SCAN_METHODS = [
  "Intraoral scanner",
  "Desktop model scanner",
  "CBCT object scan",
  "3Shape · Exocad workflow",
] as const;

export const JB_FORK_OUTCOMES = [
  {
    image: "/images/jb-fork/records-complete.jpg",
    alt: "Completed JB Fork jaw relation and intraoral records",
    label: "Verified jaw relation & esthetic reference in one session",
  },
  {
    image: "/images/jb-fork/digital-workflow.jpg",
    alt: "Digital denture workflow with JB Fork",
    label: "Aligned digital datasets → definitive denture without try-in",
  },
] as const;

export const JB_FORK_VIDEOS = [
  {
    youtubeId: "gaH8TbxYPWQ",
    title: "Digital complete denture with JB Fork",
    description: "English walkthrough — from JB Fork records to digital denture fabrication.",
  },
  {
    youtubeId: "5D-Hfc9LDM4",
    title: "JB Fork Radi+ & CBCT",
    description: "Guided surgery diagnosis using JB Fork Radi+ markers with CBCT imaging.",
  },
] as const;

export const JB_FORK_ATTRIBUTION = {
  manufacturer: "PNUADD Co., Ltd. (JB & JD Design)",
  note:
    "Clinical content adapted from PNUADD distributor workflows and official PNU ADD instructional videos. JB Fork Radi+ is a product of PNUADD. PrintDenture is an independent California lab — order kits through PrintDenture or send aligned scan sets after chairside records.",
};

export const JB_FORK_GUIDE_SECTIONS = [
  { id: "features", label: "Key features" },
  { id: "components", label: "Components" },
  { id: "radi-plus", label: "Radi+ alignment" },
  { id: "digital", label: "Digital workflow" },
  { id: "conventional", label: "Conventional workflow" },
  { id: "outcomes", label: "Clinical outcomes" },
  { id: "videos", label: "Instructional videos" },
] as const;
