import {
  CASE_FILE_KIND_META,
  parseStoredCaseFiles,
  type StoredCaseFile,
} from "@/lib/products/case-files";

export type DesignOutsourceStatus = "sent" | "completed";

export type DesignOutsourceFields = {
  design_outsource_status: DesignOutsourceStatus | null;
  design_outsource_sent_at: string | null;
  design_outsource_email: string | null;
  design_outsource_notes: string | null;
  design_outsource_sent_by: string | null;
};

/** Denture prosthetics eligible for JD CAD outsource (not guards). */
export const DESIGN_OUTSOURCE_CATEGORIES = [
  "complete",
  "jb_tray",
  "immediate",
  "partial",
  "overdenture",
  "reline",
] as const;

export const DESIGN_OUTSOURCE_CATEGORY_LABELS: Record<string, string> = {
  complete: "Complete denture (JB Fork)",
  jb_tray: "Complete denture (JB Tray)",
  immediate: "Immediate denture",
  partial: "Partial denture",
  overdenture: "Overdenture / All-on-X",
  reline: "Reline / repair",
};

export const DESIGN_OUTSOURCE_SIGNED_URL_SECONDS = 72 * 60 * 60;

export type DesignPartnerConfig = {
  name: string;
  email: string;
};

export function getDesignPartnerConfig(): DesignPartnerConfig {
  return {
    name: process.env.DESIGN_PARTNER_NAME?.trim() || "JD",
    email: process.env.DESIGN_PARTNER_EMAIL?.trim() || "",
  };
}

export function defaultDesignPartnerEmail(): string {
  return getDesignPartnerConfig().email;
}

export function defaultDesignPartnerName(): string {
  return getDesignPartnerConfig().name;
}

export function orderQualifiesForDesignOutsource(category: string | null | undefined): boolean {
  if (!category) return false;
  return (DESIGN_OUTSOURCE_CATEGORIES as readonly string[]).includes(category);
}

/** Fallback when orders lack product_id or the products join fails. */
export function inferProductCategoryFromName(productName: string | null | undefined): string | null {
  if (!productName?.trim()) return null;
  const lower = productName.toLowerCase();
  if (lower.includes("jb tray")) return "jb_tray";
  if (lower.includes("jb fork") || lower.includes("radi+")) return "complete";
  if (lower.includes("immediate")) return "immediate";
  if (lower.includes("partial") || lower.includes("flipper") || lower.includes("nesbit")) return "partial";
  if (lower.includes("overdenture") || lower.includes("all-on") || lower.includes("locator")) return "overdenture";
  if (lower.includes("reline") || lower.includes("repair")) return "reline";
  if (lower.includes("complete denture") || lower.includes("full set")) return "complete";
  if (lower.includes("denture")) return "complete";
  return null;
}

export function resolveOrderProductCategory(
  dbCategory: string | null | undefined,
  productName: string | null | undefined
): string | null {
  const trimmed = dbCategory?.trim();
  if (trimmed) return trimmed;
  return inferProductCategoryFromName(productName);
}

export function orderQualifiesForDesignOutsourceFromOrder(order: {
  productCategory?: string | null;
  product_name?: string | null;
}): boolean {
  const category = resolveOrderProductCategory(order.productCategory, order.product_name);
  return orderQualifiesForDesignOutsource(category);
}

export function collectOrderCaseFiles(order: {
  case_files: unknown;
  stl_file_path: string | null;
}): StoredCaseFile[] {
  const files = parseStoredCaseFiles(order.case_files);
  if (files.length > 0) return files;
  if (order.stl_file_path) {
    return [
      {
        kind: "scan",
        path: order.stl_file_path,
        fileName: order.stl_file_path.split("/").pop() ?? "scan.stl",
      },
    ];
  }
  return [];
}

export function outsourceFileSummary(files: StoredCaseFile[]): string {
  const counts = files.reduce(
    (acc, file) => {
      acc[file.kind] = (acc[file.kind] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  return Object.entries(counts)
    .map(([kind, count]) => `${CASE_FILE_KIND_META[kind as keyof typeof CASE_FILE_KIND_META]?.label ?? kind} (${count})`)
    .join(", ");
}
