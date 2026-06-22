import { JB_FORK_GUIDE_PATH } from "@/lib/guides/jb-fork-guide";
import { JB_TRAY_GUIDE_PATH } from "@/lib/guides/jb-tray-guide";

export type CaptureDevice = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  highlights: string[];
  image: string;
  imageAlt: string;
  guideHref: string;
  shopHref?: string;
  footnote?: string;
};

export const CAPTURE_DEVICES: CaptureDevice[] = [
  {
    id: "jb-tray",
    name: "JB Tray",
    subtitle: "Just Border",
    description:
      "A thermoplastic impression tray that replaces separate custom trays and occlusal wax rims. Capture border molding, final impression, and jaw relation in a single chairside visit — then scan and upload to PrintDenture.",
    highlights: [
      "Single-step border molding and final impression in one tray",
      "Records vertical dimension and centric relation at the same visit",
      "Compatible with analog and digital denture workflows",
      "Integrates with POP Bow for occlusal-plane and esthetic transfer",
    ],
    image: "/images/jb-tray/product.jpg",
    imageAlt: "JB Tray — Just Border impression tray",
    guideHref: JB_TRAY_GUIDE_PATH,
    shopHref: "/shop?family=jb_tray",
    footnote:
      "One box includes five upper + lower tray sets. ADD POP Bow is sold separately. Step-by-step protocols and demonstration videos are on the full JB Tray guide.",
  },
  {
    id: "jb-fork",
    name: "JB Fork",
    subtitle: "Radi+",
    description:
      "An inter-maxillary jaw-relation device that replaces occlusal wax rims. Capture final impressions, vertical dimension, and centric relation in one visit — with Radi+ markers to align facial scan, CBCT, and intraoral scan data.",
    highlights: [
      "Final impression, VD, and centric relation in one chairside visit",
      "Radi+ markers align facial scan, CBCT, and IOS into one dataset",
      "Suited to complete dentures, overdentures, and full-arch cases",
      "POP Bow available when a facial scanner is not used",
    ],
    image: "/images/jb-fork/product.jpg",
    imageAlt: "JB Fork Radi+ jaw relation recording device",
    guideHref: JB_FORK_GUIDE_PATH,
    shopHref: "/shop?family=jb_fork",
    footnote:
      "One box includes ten units (POP Bow not included). Most record visits use JB Fork Radi+ or JB Tray — not both at once. All-on-X definitive records typically use Fork (Radi+).",
  },
  {
    id: "pop-bow",
    name: "POP Bow",
    subtitle: "Occlusal-plane recorder",
    description:
      "An assembled occlusal-plane recording device used with JB Tray or JB Fork when a facial scanner is unavailable. Transfers occlusal plane, upper lip line, and maxillary anterior tooth position to the lab setup.",
    highlights: [
      "Records occlusal plane for predictable denture setups",
      "Captures lip line and anterior esthetic references chairside",
      "Works with both JB Tray and JB Fork capture protocols",
      "Sold separately — optional add-on to the capture system",
    ],
    image: "/images/jb-tray/pop-bow.jpg",
    imageAlt: "ADD POP Bow occlusal plane recording device",
    guideHref: JB_TRAY_GUIDE_PATH,
    shopHref: "/shop",
    footnote:
      "POP Bow is an optional pouch sold separately from JB Tray and JB Fork kits. Provider training covers assembly and clinical use.",
  },
];

export const PROTOCOL_NOTE = {
  title: "JB Tray or JB Fork — which protocol?",
  body: "Most practices choose one capture path per case. JB Fork Radi+ is typical for complete dentures, overdentures, and All-on-X when multi-modal scan alignment is needed. JB Tray suits streamlined complete denture workflows where a single thermoplastic tray captures impression and jaw relation. Some digital workflows use Tray for the impression visit, then Fork after scan — see the clinical guides for step-by-step protocols.",
  links: [
    { label: "JB Tray guide", href: JB_TRAY_GUIDE_PATH },
    { label: "JB Fork guide", href: JB_FORK_GUIDE_PATH },
  ],
};
