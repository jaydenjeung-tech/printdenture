import { CAPTURE_DEVICES } from "./devices";

export const SITE_TAGLINE =
  "A clinically-developed capture workflow that cuts denture chair time in half — from capture to finished prosthesis, in one place.";

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

export const TRUST_BADGES = [
  { icon: "shield", label: "FDA-registered devices" },
  { icon: "academic", label: "Developed by university prosthodontics faculty" },
  { icon: "certificate", label: "CE-accredited provider training" },
] as const;

export const HERO_STATS = [
  { value: "2 visits", label: "vs. 5 in the traditional workflow" },
  { value: "~50%", label: "less chair time per case" },
  { value: "1 appointment", label: "to capture impression, bite & occlusal plane" },
  { value: "Printed try-in", label: "included before final delivery" },
] as const;

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
    title: "We design & fabricate",
    subtitle: "Lab-controlled QC",
    description:
      "Our lab designs the denture and prints a try-in. Full QC and finishing handled for you — no equipment, no post-processing.",
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

export const PROVIDER_BENEFITS = [
  "Faculty-led clinical training & certification",
  "CE credits",
  "Early access to the workflow and new devices",
  "Co-authorship / research participation opportunities",
  "Regional provider positioning",
] as const;
