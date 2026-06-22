import {
  CASE_FILE_KIND_META,
  parseStoredCaseFiles,
  type StoredCaseFile,
} from "@/lib/products/case-files";
import { isCompleteDentureCategory } from "@/lib/products/complete-denture-records";

export type DesignOutsourceStatus = "sent" | "completed";

export type DesignOutsourceFields = {
  design_outsource_status: DesignOutsourceStatus | null;
  design_outsource_sent_at: string | null;
  design_outsource_email: string | null;
  design_outsource_notes: string | null;
  design_outsource_sent_by: string | null;
};

export const DESIGN_OUTSOURCE_SIGNED_URL_SECONDS = 72 * 60 * 60;

export function defaultDesignPartnerEmail(): string {
  return process.env.DESIGN_PARTNER_EMAIL?.trim() ?? "";
}

export function orderQualifiesForDesignOutsource(category: string | null | undefined): boolean {
  return isCompleteDentureCategory(category);
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
