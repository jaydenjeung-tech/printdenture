/** Shared 6-digit case number formatting (e.g. 000042). */

export function formatCaseNumber(caseNumber: number | null | undefined): string | null {
  if (caseNumber == null || !Number.isFinite(caseNumber)) return null;
  return String(Math.trunc(caseNumber)).padStart(6, "0");
}

/** Display label with optional legacy UUID fallback before migration backfill. */
export function formatCaseNumberLabel(
  caseNumber: number | null | undefined,
  fallbackOrderId?: string
): string {
  return formatCaseNumber(caseNumber) ?? fallbackOrderId?.slice(0, 6).toUpperCase() ?? "------";
}

export function formatCaseNumberHash(
  caseNumber: number | null | undefined,
  fallbackOrderId?: string
): string {
  return `#${formatCaseNumberLabel(caseNumber, fallbackOrderId)}`;
}

export type CaseScanInput =
  | { kind: "uuid"; value: string }
  | { kind: "case_number"; value: number }
  | { kind: "uuid_prefix"; value: string };

/** Parse barcode / manual scan input for lab floor lookup. */
export function parseCaseScanInput(raw: string): CaseScanInput {
  const value = raw.trim();
  if (value.length === 36 && value.includes("-")) {
    return { kind: "uuid", value };
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length >= 1 && digits.length <= 6) {
    return { kind: "case_number", value: parseInt(digits, 10) };
  }

  return { kind: "uuid_prefix", value: value.toLowerCase() };
}
