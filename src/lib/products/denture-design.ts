/** Full denture design only. Fabrication stays a separate case. Ultran assigns JBJD. */

export const DENTURE_DESIGN_NAME = "Full Denture Design";
export const DENTURE_DESIGN_PRICE_PER_ARCH = 45;

export const DESIGN_SHADE_LETTERS = ["A", "B", "C", "D", "Bleach"] as const;
export const DESIGN_SHADE_NUMBERS = ["1", "2", "3", "3.5", "4"] as const;
export const DESIGN_OCCLUSIONS = [
  "Balanced Occlusion",
  "Lingualized Occlusion",
  "Monoplane Occlusion",
] as const;

export type DesignShadeLetter = (typeof DESIGN_SHADE_LETTERS)[number];
export type DesignShadeNumber = (typeof DESIGN_SHADE_NUMBERS)[number];
export type DesignOcclusion = (typeof DESIGN_OCCLUSIONS)[number];

export function isDentureDesignProduct(product: {
  name?: string | null;
  category?: string | null;
}): boolean {
  if (product.category === "design") return true;
  return /\bfull denture design\b/i.test(product.name ?? "");
}

export function dentureDesignShade(letter: string, number: string): string {
  if (!letter || !number) return "";
  if (letter === "Bleach") return `Bleach ${number}`;
  return `${letter}${number}`;
}

export function dentureDesignJaw(arch: string): "Upper" | "Lower" | "Both jaws" | null {
  if (arch === "upper") return "Upper";
  if (arch === "lower") return "Lower";
  if (arch === "both") return "Both jaws";
  return null;
}

/** Work order text Ultran's JBJD form can read back. */
export function formatDentureDesignWorkOrder(input: {
  arch: string;
  shadeLetter: string;
  shadeNumber: string;
  occlusion: string;
  directions?: string;
}): string {
  const jaw = dentureDesignJaw(input.arch);
  const lines = [
    "Service type: Complete Denture",
    "Print & milling: No",
    "24-hour express: No",
    `Jaw: ${jaw ?? ""}`,
    `Teeth shade letter: ${input.shadeLetter}`,
    `Teeth shade number: ${input.shadeNumber}`,
    `Occlusion: ${input.occlusion}`,
  ];
  const directions = input.directions?.trim();
  if (directions) lines.push(`Additional directions: ${directions}`);
  return lines.join("\n");
}
