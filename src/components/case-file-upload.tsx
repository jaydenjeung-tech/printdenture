"use client";

import {
  CASE_FILE_KIND_META,
  createPendingCaseFile,
  type CaseFileKind,
  type PendingCaseFile,
  validateCaseFile,
} from "@/lib/products/case-files";

type Props = {
  requiredKinds: CaseFileKind[];
  recommendedKinds: CaseFileKind[];
  files: PendingCaseFile[];
  onAdd: (file: PendingCaseFile) => void;
  onRemove: (id: string) => void;
  error: string | null;
  onError: (message: string | null) => void;
};

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

  function handlePick(picked: FileList | null) {
    const file = picked?.[0];
    if (!file) return;
    const validationError = validateCaseFile(file, kind);
    if (validationError) {
      onError(validationError);
      return;
    }
    onError(null);
    onAdd(createPendingCaseFile(file, kind));
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        required
          ? "border-[#9FE1CB] bg-[#E1F5EE]/20"
          : "border-[#E2E0D8] bg-[#F8F7F4]/60"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {meta.label}
            <span
              className={`ml-2 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border
                ${required
                  ? "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]"
                  : "bg-white text-[#6B6B6B] border-[#E2E0D8]"
                }`}
            >
              {required ? "Required" : "Recommended"}
            </span>
          </p>
          <p className="text-xs text-[#6B6B6B] mt-0.5">{meta.hint}</p>
        </div>
        <button
          type="button"
          onClick={() => document.getElementById(inputId)?.click()}
          className="h-9 px-4 rounded-lg border border-[#E2E0D8] bg-white text-sm text-[#1A1A1A] hover:border-[#1A1A1A] shrink-0"
        >
          Add file
        </button>
      </div>

      <input
        id={inputId}
        type="file"
        accept={meta.accept}
        className="hidden"
        onChange={(e) => {
          handlePick(e.target.files);
          e.target.value = "";
        }}
      />

      {kindFiles.length === 0 ? (
        <p className="text-xs text-[#9B9B9B]">
          {required
            ? `Upload at least one ${meta.label.toLowerCase()} file to continue.`
            : `No ${meta.label.toLowerCase()} yet — optional but helpful.`}
        </p>
      ) : (
        <ul className="space-y-2">
          {kindFiles.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#E2E0D8] bg-white px-3 py-2"
            >
              <span className="text-sm text-[#1A1A1A] truncate">{f.fileName}</span>
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                className="text-xs text-[#9B9B9B] hover:text-red-500 shrink-0"
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

  return (
    <div className="mb-6 space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Case files</label>
        <p className="text-xs text-[#6B6B6B] leading-relaxed">
          <strong>Required:</strong> at least one scan (STL, PLY, or OBJ) to place the order.
          <strong className="font-normal"> Recommended files</strong> (CBCT, photos, documents) improve
          try-in–skip success but are not required to submit.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#085041]">
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
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6B6B]">
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
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}
