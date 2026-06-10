/**
 * Case file kinds for PrintDenture lab orders — scans, CBCT, photos, etc.
 */

export type CaseFileKind = "scan" | "cbct" | "photo" | "document" | "archive";

export type PendingCaseFile = {
  id: string;
  kind: CaseFileKind;
  file: File;
  fileName: string;
};

export type StoredCaseFile = {
  kind: CaseFileKind;
  path: string;
  fileName: string;
};

export type CaseFileDraftMeta = {
  id: string;
  kind: CaseFileKind;
  fileName: string;
};

export const CASE_FILE_KIND_ORDER: CaseFileKind[] = [
  "scan",
  "cbct",
  "photo",
  "document",
  "archive",
];

export const CASE_FILE_KIND_META: Record<
  CaseFileKind,
  { label: string; hint: string; accept: string; maxBytes: number }
> = {
  scan: {
    label: "Scan files",
    hint: "Intraoral or model scan — STL, PLY, or OBJ",
    accept: ".stl,.ply,.obj",
    maxBytes: 100 * 1024 * 1024,
  },
  cbct: {
    label: "CBCT / imaging",
    hint: "ZIP of DICOM slices or exported CBCT volume",
    accept: ".zip,.dcm",
    maxBytes: 500 * 1024 * 1024,
  },
  photo: {
    label: "Photos",
    hint: "Shade tabs, smile reference, or adjacent teeth",
    accept: ".jpg,.jpeg,.png,.webp,.heic,.heif",
    maxBytes: 25 * 1024 * 1024,
  },
  document: {
    label: "Documents",
    hint: "PDF jaw-relation records or clinical notes",
    accept: ".pdf",
    maxBytes: 25 * 1024 * 1024,
  },
  archive: {
    label: "Scanner export bundle",
    hint: "ZIP from IOS, facial scanner, or multi-file export",
    accept: ".zip",
    maxBytes: 500 * 1024 * 1024,
  },
};

const EXTENSION_KIND: Record<string, CaseFileKind> = {
  stl: "scan",
  ply: "scan",
  obj: "scan",
  zip: "archive",
  dcm: "cbct",
  jpg: "photo",
  jpeg: "photo",
  png: "photo",
  webp: "photo",
  heic: "photo",
  heif: "photo",
  pdf: "document",
};

export function inferCaseFileKind(fileName: string): CaseFileKind | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  if (ext === "zip") return "archive";
  return EXTENSION_KIND[ext] ?? null;
}

export function validateCaseFile(
  file: File,
  kind: CaseFileKind
): string | null {
  const meta = CASE_FILE_KIND_META[kind];
  if (file.size > meta.maxBytes) {
    return `${meta.label} must be under ${Math.round(meta.maxBytes / (1024 * 1024))}MB.`;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext) return "File must have an extension.";
  const allowed = meta.accept.split(",").map((s) => s.trim().replace(".", ""));
  if (!allowed.includes(ext)) {
    return `${meta.label} accepts: ${meta.accept}`;
  }
  return null;
}

export function createPendingCaseFile(file: File, kind: CaseFileKind): PendingCaseFile {
  return {
    id: crypto.randomUUID(),
    kind,
    file,
    fileName: file.name,
  };
}

export function primaryScanFile(files: readonly PendingCaseFile[]): PendingCaseFile | null {
  return files.find((f) => f.kind === "scan") ?? null;
}

export function hasRequiredScan(files: readonly PendingCaseFile[]): boolean {
  return files.some((f) => f.kind === "scan");
}

export function parseStoredCaseFiles(value: unknown): StoredCaseFile[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((row) => {
    if (!row || typeof row !== "object") return [];
    const r = row as Record<string, unknown>;
    if (
      typeof r.kind !== "string" ||
      typeof r.path !== "string" ||
      typeof r.fileName !== "string"
    ) {
      return [];
    }
    if (!CASE_FILE_KIND_ORDER.includes(r.kind as CaseFileKind)) return [];
    return [{ kind: r.kind as CaseFileKind, path: r.path, fileName: r.fileName }];
  });
}

export async function downloadCaseFile(filePath: string) {
  const { createAppClient } = await import("@/lib/supabase");
  const supabase = createAppClient();
  const { data } = await supabase.storage.from("stl-files").createSignedUrl(filePath, 60);
  if (data?.signedUrl) window.open(data.signedUrl, "_blank");
}
