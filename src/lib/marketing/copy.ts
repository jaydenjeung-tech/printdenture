import { CAPTURE_DEVICES } from "./devices";

export const SITE_TAGLINE =
  "A clinically-developed capture workflow that cuts denture chair time in half — from capture to finished prosthesis, in one place.";

/** U.S. fulfillment lab — shown on marketing, order, and provider portal. */
export const LAB_PARTNER = {
  name: "IDOC Dental Lab",
  shortName: "IDOC",
  website: "https://idocdentallab.com",
  heroLine: "Cases designed & manufactured by IDOC Dental Lab",
  headerLine: "Lab partner · IDOC Dental Lab",
  workflowLine: "IDOC Dental Lab designs, prints your try-in, and ships the finished case.",
  orderNotice:
    "Submitting to IDOC Dental Lab — design, printed try-in, QC, and delivery. You capture in-office; your lab partner handles the rest.",
  dashboardLine: "Fulfilled by IDOC Dental Lab",
} as const;

export const TRUST_BADGES = [
  { icon: "lab", label: "Fulfillment by IDOC Dental Lab" },
  { icon: "shield", label: "FDA-registered devices" },
  { icon: "academic", label: "Developed by university prosthodontics faculty" },
  { icon: "certificate", label: "CE-accredited provider training" },
] as const;

export const HUH_JUNGBO_PROFILE = {
  src: "/images/clinical/huh-jungbo-profile.png",
  alt: "Prof. Huh Jung-bo, DDS, PhD — Professor of Prosthodontics, Pusan National University",
} as const;

export const NAV_LINKS = [
  { label: "How it works", href: "/how-it-works" },
  { label: "The system", href: "/the-system" },
  { label: "Clinical", href: "/clinical" },
  { label: "Providers", href: "/providers" },
  { label: "Pricing", href: "/pricing" },
] as const;

export const HERO_STATS = [
  { value: "2 visits", label: "vs. 5 in the traditional workflow" },
  { value: "~50%", label: "less chair time per case" },
  { value: "1 appointment", label: "to capture impression, bite & occlusal plane" },
  { value: "Printed try-in", label: "included before final delivery" },
] as const;

/** Landing hero — first-case launch offer */
export const HERO_PROMO = {
  eyebrow: "First case · 50% off",
  headline: "Full dentures in two visits.",
  headlineAccent: "Not five.",
  support: "Capture once chairside. We design, print, and finish.",
  lead:
    "A single-appointment capture system — impression, bite, and occlusal plane in one sitting — developed by a university prosthodontics faculty. You capture; we design, fabricate, and finish. New providers get 50% off their first lab case.",
  cta: "Claim your first-case offer",
  primaryCta: "Request a clinical demo",
  secondaryCta: "See the workflow",
} as const;

/**
 * Landing hero photo — Pexels (free for commercial use, attribution optional).
 * Photo by Gustavo Fring — https://www.pexels.com/photo/5622026/
 * License: https://www.pexels.com/license/
 */
export const HERO_IMAGE = {
  src: "/images/hero/clinic-senior-consult.jpg",
  alt: "Dental team consulting with a senior patient in a modern clinic",
  credit: {
    name: "Gustavo Fring",
    url: "https://www.pexels.com/photo/5622026/",
  },
} as const;

export const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Capture",
    subtitle: "Single appointment",
    description:
      "Using the JB capture system, take the impression, jaw relation, and occlusal plane in one sitting. Scan and upload.",
  },
  {
    step: "02",
    title: "IDOC designs & fabricates",
    subtitle: "Lab-controlled QC",
    description:
      "IDOC Dental Lab designs your case, prints a try-in, and handles finishing and QC — no in-office printing or post-processing.",
  },
  {
    step: "03",
    title: "Verify & deliver",
    subtitle: "Two visits total",
    description:
      "Confirm esthetics and occlusion with the printed try-in, then deliver the finished prosthesis. Two visits, verified result.",
  },
] as const;

export const SYSTEM_DEVICES = CAPTURE_DEVICES.map((d) => ({
  name: d.name,
  description: d.description,
  image: d.image,
}));

export const COMPARISON_ROWS = [
  { label: "Visits", traditional: "5+", inHouse: "2–3", printDenture: "2" },
  { label: "Equipment cost", traditional: "—", inHouse: "High", printDenture: "None" },
  {
    label: "Post-processing labor",
    traditional: "High",
    inHouse: "High (you)",
    printDenture: "None (we do it)",
  },
  { label: "Try-in verification", traditional: "Yes", inHouse: "Variable", printDenture: "Yes (printed)" },
  {
    label: "Consistency / QC",
    traditional: "Variable",
    inHouse: "Variable",
    printDenture: "Lab-controlled",
  },
] as const;

/**
 * PNU ADD digital denture visit pathways — clinical protocol comparison
 * (Conventional digital → JB Fork → JB Tray).
 */
export type VisitProtocolStep = {
  title: string;
  detail: string;
  combined: boolean;
  image: string;
  imageAlt: string;
};

export type VisitProtocol = {
  id: string;
  name: string;
  visits: number;
  visitsLabel: string;
  summary: string;
  device: string | null;
  highlighted: boolean;
  steps: VisitProtocolStep[];
};

export const VISIT_PROTOCOLS: VisitProtocol[] = [
  {
    id: "conventional",
    name: "Conventional digital",
    visits: 4,
    visitsLabel: "4 visits",
    summary: "Separate scans, wax-rim records, temporary, and final delivery.",
    device: null,
    highlighted: false,
    steps: [
      {
        title: "Initial scans",
        detail: "Edentulous arch scans",
        combined: false,
        image: "/images/visit-protocols/step-intraoral-scan.jpg",
        imageAlt: "Chairside intraoral scan and digital arch model",
      },
      {
        title: "Definitive impression",
        detail: "With wax rims",
        combined: false,
        image: "/images/visit-protocols/step-wax-rim-impression.jpg",
        imageAlt: "Definitive impression with wax rim on articulator",
      },
      {
        title: "Temporary denture",
        detail: "Try-in / provisional delivery",
        combined: false,
        image: "/images/visit-protocols/step-wax-setup.jpg",
        imageAlt: "Temporary denture setup on articulator",
      },
      {
        title: "Final denture",
        detail: "Definitive delivery",
        combined: false,
        image: "/images/visit-protocols/step-final-denture.jpg",
        imageAlt: "Finished definitive denture",
      },
    ],
  },
  {
    id: "jb-fork",
    name: "JB Fork",
    visits: 3,
    visitsLabel: "3 visits",
    summary: "Jaw relation and initial records combined chairside with JB Fork.",
    device: "JB Fork Radi+",
    highlighted: false,
    steps: [
      {
        title: "Scans & jaw relation",
        detail: "Initial scans with JB Fork",
        combined: true,
        image: "/images/visit-protocols/hero-jb-fork.jpg",
        imageAlt: "JB Fork Radi+ jaw-relation device",
      },
      {
        title: "Definitive impression",
        detail: "With temporary denture",
        combined: false,
        image: "/images/visit-protocols/step-fork-records.jpg",
        imageAlt: "Definitive impression records with temporary denture",
      },
      {
        title: "Final denture",
        detail: "Definitive delivery",
        combined: false,
        image: "/images/visit-protocols/step-final-denture.jpg",
        imageAlt: "Finished definitive denture",
      },
    ],
  },
  {
    id: "jb-tray",
    name: "JB Tray",
    visits: 2,
    visitsLabel: "2 visits",
    summary: "Definitive impression and jaw relation in one appointment — PrintDenture path.",
    device: "JB Tray",
    highlighted: true,
    steps: [
      {
        title: "Definitive impression & jaw relation",
        detail: "Single visit with JB Tray",
        combined: true,
        image: "/images/visit-protocols/step-tray-upper.jpg",
        imageAlt: "JB Tray upper impression tray for single-visit capture",
      },
      {
        title: "Final denture",
        detail: "Digital or conventional delivery",
        combined: false,
        image: "/images/visit-protocols/step-final-denture.jpg",
        imageAlt: "Finished definitive denture",
      },
    ],
  },
];

export const VISIT_PROTOCOL_NOTE =
  "Protocols developed by PNU ADD (Pusan National University Advanced Digital Dentistry). With PrintDenture, IDOC fabricates from your verified digital record set — including a printed try-in before final delivery.";

export const PROVIDER_BENEFITS = [
  "Faculty-led clinical training & certification",
  "CE credits",
  "Early access to the workflow and new devices",
  "Co-authorship / research participation opportunities",
  "Regional provider positioning",
] as const;

/** Shown on /providers#demo — sets expectations before and after submit. */
export const CLINICAL_DEMO_INTRO =
  "A clinical demo is a guided first case — not instant portal access. After you submit, our team contacts you to help select an appropriate case, review records, and walk you through the workflow before you scan and order.";

export const CLINICAL_DEMO_NEXT_STEPS = [
  "Submit your contact details below.",
  "Our clinical team reaches out within 2 business days by phone or email.",
  "We confirm your first demo case type, records checklist, and any starter equipment needs.",
  "You receive step-by-step case guidance, then submit your first guided order in the portal.",
] as const;

export const CLINICAL_DEMO_SUCCESS_LEAD =
  "Thank you — your request is in our queue. A member of our clinical team will contact you within 2 business days to schedule your guided demo case.";
