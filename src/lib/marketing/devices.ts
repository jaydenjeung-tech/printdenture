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
    id: "pop-bow",
    name: "POP Bow",
    subtitle: "Occlusal-plane recorder",
    description:
      "An assembled occlusal-plane recording device used with the JB Tray. Transfers occlusal plane, upper lip line, and maxillary anterior tooth position to the lab setup.",
    highlights: [
      "Records occlusal plane for predictable denture setups",
      "Captures lip line and anterior esthetic references chairside",
      "Used with the JB Tray capture protocol",
      "Sold separately — optional add-on to the JB Tray kit",
    ],
    image: "/images/jb-tray/pop-bow.jpg",
    imageAlt: "ADD POP Bow occlusal plane recording device",
    guideHref: JB_TRAY_GUIDE_PATH,
    shopHref: "/shop",
    footnote:
      "POP Bow is an optional pouch sold separately from the JB Tray kit. Provider training covers assembly and clinical use.",
  },
];

export const PROTOCOL_NOTE = {
  title: "JB Tray, with POP Bow when you need it",
  body: "Complete denture records use the JB Tray: border molding, final impression, and jaw relation in one visit. ADD POP Bow is optional and sold separately when you want occlusal plane, lip line, and anterior tooth position transferred to the lab.",
  links: [{ label: "JB Tray guide", href: JB_TRAY_GUIDE_PATH }],
};
