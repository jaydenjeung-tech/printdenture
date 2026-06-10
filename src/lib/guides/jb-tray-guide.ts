/** JB Tray clinical guide — content aligned with JB & JD Design (PNUADD). */

export const JB_TRAY_GUIDE_PATH = "/guides/jb-tray";

export const JB_TRAY_HERO = {
  eyebrow: "JB & JD Design · PNUADD",
  title: "JB Tray — Just Border",
  subtitle: "The dental impression tray that replaces individual trays",
  description:
    "Designed to complete both the final impression and jaw relation recording in a single streamlined procedure.",
};

export const JB_TRAY_FEATURES = [
  {
    title: "One-step final impression & jaw relation",
    description:
      "After tray alteration and border molding, take the final impression while simultaneously recording vertical dimension and centric relation. Eliminates individual trays and occlusal wax rims.",
  },
  {
    title: "Fewer patient visits",
    description:
      "Reduce visits from the conventional five to three — with a simplified workflow, as few as two visits in some cases.",
  },
  {
    title: "Digital & analog solution",
    description:
      "Compatible with traditional denture fabrication and digital workflows using intra-oral or model scanners. Supports two-visit digital denture production.",
  },
  {
    title: "POP Bow system integration",
    description:
      "When used with the POP Bow, occlusal plane, upper lip position, and maxillary anterior tooth location transfer accurately to the technician.",
  },
] as const;

export const JB_TRAY_PACKAGE = [
  {
    label: "One box · 5 upper + lower sets",
    image: "/images/jb-tray/product.jpg",
    alt: "JB Tray retail box — five upper and lower tray sets",
  },
  {
    label: "Upper & lower tray per set",
    image: "/images/jb-tray/upper-tray.jpg",
    alt: "JB Tray upper and lower trays",
  },
  {
    label: "ADD POP Bow sold separately",
    image: "/images/jb-tray/pop-bow.jpg",
    alt: "ADD POP Bow — optional pouch, not included in tray box",
  },
] as const;

export const JB_TRAY_MAXILLA_PARTS = [
  "Moldable part — thermoplastic section",
  "Frame — rigid structural frame",
  "Handle — tray handle",
  "POP Bow connection — attachment point for POP Bow",
  "V-cut — pre-scored line for handle removal",
] as const;

export const JB_TRAY_MANDIBLE_PARTS = [
  "Moldable part — thermoplastic section",
  "Frame — rigid structural frame",
  "Handle — tray handle",
  "VD rods — anterior 5 mm / posterior 4 mm, 1 mm graduations",
] as const;

export const JB_TRAY_MAXILLA_STEPS = [
  {
    n: 1,
    title: "Tray softening",
    body: "Soften in warm water at 70–75°C for about 1 minute until the moldable section is pliable.",
  },
  {
    n: 2,
    title: "Border molding & shaping",
    body: "Working time over 2 minutes; repeat softening if needed for precise adaptation to the patient’s oral anatomy.",
  },
  {
    n: 3,
    title: "Tray adhesive & impression",
    body: "Apply adhesive and impression material for the final maxillary impression.",
    tip: "The POP Bow can attach to the tray handle. Remove the handle if both jaws are taken at once — this allows free lip movement and easier facial feature evaluation.",
  },
] as const;

export const JB_TRAY_MANDIBLE_STEPS = [
  { n: 1, title: "Tray softening", body: "70–75°C for approximately 1 minute." },
  {
    n: 2,
    title: "Border molding & shaping",
    body: "Repeat as needed for accurate adaptation to the mandibular anatomy.",
  },
  {
    n: 3,
    title: "Vertical dimension",
    body: "Adjust VD rods using 1 mm graduations (anterior 5 mm / posterior 4 mm).",
  },
  {
    n: 4,
    title: "Tray adhesive & impression",
    body: "Closed-mouth impression technique with tray adhesive and impression material.",
  },
  {
    n: 5,
    title: "Centric relation",
    body: "Record centric relation with silicone bite registration or wax.",
    tip: "In rest position, attach the POP Bow to the lower border of the upper lip to transfer occlusal plane, upper lip position, and anterior teeth location to the technician.",
  },
] as const;

export const JB_TRAY_OUTCOMES = [
  {
    image: "/images/jb-tray/articulator.jpg",
    alt: "Articulator mounting based on POP Bow plane",
    label: "Articulator mounting based on POP Bow plane",
  },
  {
    image: "/images/jb-tray/denture-fabrication.jpg",
    alt: "Artificial teeth arrangement and denture fabrication",
    label: "Artificial teeth arrangement & denture fabrication",
  },
] as const;

export const JB_TRAY_VIDEOS = [
  {
    youtubeId: "Ui7JlqtdmGQ",
    title: "JB Tray Manual",
    description: "Step-by-step chairside demonstration of the JB Tray protocol.",
  },
  {
    youtubeId: "t350UzijWys",
    title: "JB Tray — Dental Laboratory",
    description: "Laboratory workflow from JB Tray records to denture fabrication.",
  },
] as const;

export const JB_TRAY_ATTRIBUTION = {
  manufacturer: "PNUADD Co., Ltd. (JB & JD Design)",
  note:
    "Clinical content adapted from the official JB & JD Design guide. JB Tray is a product of PNUADD. PrintDenture is an independent California lab — order kits through PrintDenture or send cases after chairside records.",
};

export const JB_TRAY_GUIDE_SECTIONS = [
  { id: "features", label: "Key features" },
  { id: "package", label: "Package contents" },
  { id: "structure", label: "Tray structure" },
  { id: "maxilla", label: "Maxillary application" },
  { id: "mandible", label: "Mandibular application" },
  { id: "outcomes", label: "Clinical outcomes" },
  { id: "videos", label: "Instructional videos" },
] as const;
