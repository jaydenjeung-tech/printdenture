"use client";

import {
  CASE_FILE_KIND_META,
  downloadCaseFile,
  parseStoredCaseFiles,
  type StoredCaseFile,
} from "@/lib/products/case-files";

type Props = {
  caseFiles: unknown;
  stlFilePath?: string | null;
  compact?: boolean;
};

export function CaseFilesList({ caseFiles, stlFilePath, compact }: Props) {
  const files = parseStoredCaseFiles(caseFiles);
  const legacyOnly =
    files.length === 0 && stlFilePath
      ? [{ kind: "scan" as const, path: stlFilePath, fileName: stlFilePath.split("/").pop() ?? "scan.stl" }]
      : files;

  if (legacyOnly.length === 0) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {legacyOnly.map((file) => (
          <button
            key={file.path}
            type="button"
            onClick={() => downloadCaseFile(file.path)}
            className="text-xs text-[#2563EB] hover:underline"
          >
            {CASE_FILE_KIND_META[file.kind].label}: {file.fileName}
          </button>
        ))}
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {legacyOnly.map((file) => (
        <li
          key={file.path}
          className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E0D8] bg-white px-3 py-2"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#1A1A1A] truncate">{file.fileName}</p>
            <p className="text-xs text-[#9B9B9B]">{CASE_FILE_KIND_META[file.kind].label}</p>
          </div>
          <button
            type="button"
            onClick={() => downloadCaseFile(file.path)}
            className="text-xs font-medium text-[#2563EB] hover:underline shrink-0"
          >
            Download
          </button>
        </li>
      ))}
    </ul>
  );
}
