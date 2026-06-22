"use client";

import { useState, useRef, type DragEvent } from "react";
import { cn } from "@/lib/utils";
import {
  CASE_FILE_KIND_META,
  createPendingCaseFile,
  inferCaseFileKind,
  type CaseFileKind,
  type PendingCaseFile,
  validateCaseFile,
} from "@/lib/products/case-files";
import { ORDER_LABEL_CLASS } from "@/components/marketing/order-ui";

type Props = {
  requiredKinds: CaseFileKind[];
  recommendedKinds: CaseFileKind[];
  files: PendingCaseFile[];
  onAdd: (file: PendingCaseFile) => void;
  onRemove: (id: string) => void;
  error: string | null;
  onError: (message: string | null) => void;
};

function readDroppedFiles(dataTransfer: DataTransfer): File[] {
  return Array.from(dataTransfer.files ?? []);
}

function FileKindBlock({
  kind,
  required,
  files,
  onAdd,
  onRemove,
  onError,
}: {
  kind: CaseFileKind;
  required: boolean;
  files: PendingCaseFile[];
  onAdd: (file: PendingCaseFile) => void;
  onRemove: (id: string) => void;
  onError: (message: string | null) => void;
}) {
  const meta = CASE_FILE_KIND_META[kind];
  const kindFiles = files.filter((f) => f.kind === kind);
  const inputId = `case-file-${kind}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  function handleFiles(picked: FileList | File[] | null) {
    if (!picked?.length) return;

    let added = 0;
    let lastError: string | null = null;

    for (const file of Array.from(picked)) {
      const validationError = validateCaseFile(file, kind);
      if (validationError) {
        lastError = validationError;
        continue;
      }
      onAdd(createPendingCaseFile(file, kind));
      added += 1;
    }

    if (added > 0) onError(null);
    else if (lastError) onError(lastError);
  }

  function handleDragEnter(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    dragDepth.current = 0;
    setIsDragging(false);
    handleFiles(readDroppedFiles(e.dataTransfer));
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "border p-4 transition-colors",
        required ? "border-[#9FE1CB] bg-[#E1F5EE]/20" : "border-[var(--pd-border)] bg-[var(--pd-surface)]/60",
        isDragging && "border-[var(--pd-teal)] bg-[#E1F5EE]/40 ring-1 ring-[var(--pd-teal)]/30"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <div>
          <p className="text-[14px] font-medium text-[var(--pd-navy)]">
            {meta.label}
            <span
              className={`ml-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 border ${
                required
                  ? "bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]"
                  : "bg-white text-[var(--pd-slate)] border-[var(--pd-border)]"
              }`}
            >
              {required ? "Required" : "Recommended"}
            </span>
          </p>
          <p className="text-[12px] text-[var(--pd-slate)] mt-0.5">{meta.hint}</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-9 px-4 border border-[var(--pd-border)] bg-white text-[13px] text-[var(--pd-navy)] hover:border-[var(--pd-navy)] shrink-0 transition-colors"
        >
          Browse files
        </button>
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={meta.accept}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "w-full border border-dashed px-4 py-6 text-center transition-colors",
          isDragging
            ? "border-[var(--pd-teal)] bg-white/80"
            : "border-[var(--pd-border)] bg-white/50 hover:border-[var(--pd-teal)]/60 hover:bg-white/80"
        )}
      >
        <p className="text-[13px] font-medium text-[var(--pd-navy)]">
          {isDragging ? "Drop files here" : "Drag & drop files here"}
        </p>
        <p className="text-[12px] text-[var(--pd-muted)] mt-1">
          or click to browse · {meta.accept}
        </p>
      </button>

      {kindFiles.length === 0 ? (
        <p className="text-[12px] text-[var(--pd-muted)] mt-3">
          {required
            ? `Upload at least one ${meta.label.toLowerCase()} file to continue.`
            : `No ${meta.label.toLowerCase()} yet — optional but helpful.`}
        </p>
      ) : (
        <ul className="space-y-2 mt-3">
          {kindFiles.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 border border-[var(--pd-border)] bg-white px-3 py-2"
            >
              <span className="text-[14px] text-[var(--pd-navy)] truncate">{f.fileName}</span>
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                className="text-[12px] text-[var(--pd-muted)] hover:text-red-500 shrink-0"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UnifiedDropZone({
  allowedKinds,
  onAdd,
  onError,
}: {
  allowedKinds: CaseFileKind[];
  onAdd: (file: PendingCaseFile) => void;
  onError: (message: string | null) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragDepth = useRef(0);

  function resolveKind(file: File): CaseFileKind | null {
    const inferred = inferCaseFileKind(file.name);
    if (!inferred) return null;
    if (inferred === "archive" && allowedKinds.includes("cbct") && file.name.toLowerCase().endsWith(".zip")) {
      return "cbct";
    }
    if (allowedKinds.includes(inferred)) return inferred;
    return null;
  }

  function handleFiles(picked: File[] | FileList | null) {
    if (!picked?.length) return;

    let added = 0;
    let lastError: string | null = null;

    for (const file of Array.from(picked)) {
      const kind = resolveKind(file);
      if (!kind) {
        lastError = `"${file.name}" is not a supported file type for this case.`;
        continue;
      }
      const validationError = validateCaseFile(file, kind);
      if (validationError) {
        lastError = validationError;
        continue;
      }
      onAdd(createPendingCaseFile(file, kind));
      added += 1;
    }

    if (added > 0) onError(null);
    else if (lastError) onError(lastError);
  }

  function handleDragEnter(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragDepth.current += 1;
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    dragDepth.current -= 1;
    if (dragDepth.current <= 0) {
      dragDepth.current = 0;
      setIsDragging(false);
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        dragDepth.current = 0;
        setIsDragging(false);
        handleFiles(readDroppedFiles(e.dataTransfer));
      }}
      className={cn(
        "border border-dashed px-5 py-8 text-center transition-colors",
        isDragging
          ? "border-[var(--pd-teal)] bg-[#E1F5EE]/40 ring-1 ring-[var(--pd-teal)]/30"
          : "border-[var(--pd-border)] bg-[var(--pd-surface)] hover:border-[var(--pd-teal)]/50"
      )}
    >
      <p className="text-[14px] font-medium text-[var(--pd-navy)]">
        {isDragging ? "Drop case files here" : "Drag & drop all case files here"}
      </p>
      <p className="text-[12px] text-[var(--pd-slate)] mt-1.5 max-w-md mx-auto leading-relaxed">
        Scans (STL, PLY, OBJ) are required. CBCT, photos, PDFs, and ZIP bundles are sorted into the
        matching section below automatically.
      </p>
    </div>
  );
}

export function CaseFileUploadSection({
  requiredKinds,
  recommendedKinds,
  files,
  onAdd,
  onRemove,
  error,
  onError,
}: Props) {
  const recommendedOnly = recommendedKinds.filter((k) => !requiredKinds.includes(k));
  const allowedKinds = [...new Set([...requiredKinds, ...recommendedOnly])];

  return (
    <div className="mb-6 space-y-4">
      <div>
        <label className={ORDER_LABEL_CLASS}>Case files</label>
        <p className="text-[12px] text-[var(--pd-slate)] leading-relaxed">
          <strong>Required:</strong> at least one scan (STL, PLY, or OBJ) to place the order.
          <strong className="font-normal"> Recommended files</strong> (CBCT, photos, documents) improve
          try-in–skip success but are not required to submit. Drag & drop or browse below.
        </p>
      </div>

      <UnifiedDropZone allowedKinds={allowedKinds} onAdd={onAdd} onError={onError} />

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--pd-teal-dark)]">
          Required uploads
        </p>
        {requiredKinds.map((kind) => (
          <FileKindBlock
            key={kind}
            kind={kind}
            required
            files={files}
            onAdd={onAdd}
            onRemove={onRemove}
            onError={onError}
          />
        ))}
      </div>

      {recommendedOnly.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--pd-slate)]">
            Recommended uploads
          </p>
          {recommendedOnly.map((kind) => (
            <FileKindBlock
              key={kind}
              kind={kind}
              required={false}
              files={files}
              onAdd={onAdd}
              onRemove={onRemove}
              onError={onError}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 px-3 py-2">{error}</p>
      )}
    </div>
  );
}
