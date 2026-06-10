"use client";

import {
  fileKindsHintForItem,
  isChecklistItemSatisfied,
} from "@/lib/products/record-upload-checklist";
import type {
  RecordChecklistContext,
  RecordChecklistItem,
  RecordUploadChecklist,
} from "@/lib/products/record-upload-checklist";

type Props = {
  checklist: RecordUploadChecklist;
  context: RecordChecklistContext;
  onAcknowledgmentChange: (itemId: string, value: boolean) => void;
};

function ChecklistItemRow({
  item,
  context,
  onAcknowledgmentChange,
}: {
  item: RecordChecklistItem;
  context: RecordChecklistContext;
  onAcknowledgmentChange: (itemId: string, value: boolean) => void;
}) {
  const satisfied = isChecklistItemSatisfied(item, context);
  const isAck = item.satisfier.type === "acknowledgment";
  const hint = fileKindsHintForItem(item);
  const isRequired = item.tier === "required";

  return (
    <label
      className={`flex gap-3 rounded-lg border px-3 py-2.5 transition-colors
        ${satisfied
          ? "border-[#0F6E56] bg-white"
          : isRequired
            ? "border-[#C5E8DC] bg-white/60"
            : "border-[#E2E0D8] bg-white/40"
        } ${isAck ? "cursor-pointer hover:border-[#0F6E56]/50" : ""}`}
    >
      {isAck ? (
        <input
          type="checkbox"
          className="mt-0.5 shrink-0"
          checked={!!context.acknowledgments[item.id]}
          onChange={(e) => onAcknowledgmentChange(item.id, e.target.checked)}
        />
      ) : (
        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
            ${satisfied
              ? "bg-[#0F6E56] text-white"
              : isRequired
                ? "bg-[#E2E0D8] text-[#9B9B9B]"
                : "bg-[#F0EEE8] text-[#C8C6BE]"
            }`}
          aria-hidden
        >
          {satisfied ? "✓" : ""}
        </span>
      )}
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="block text-sm font-medium text-[#1A1A1A] leading-snug">
            {item.label}
          </span>
          <span
            className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full border
              ${isRequired
                ? "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]"
                : "bg-[#F8F7F4] text-[#6B6B6B] border-[#E2E0D8]"
              }`}
          >
            {isRequired ? "Required" : "Recommended"}
          </span>
          {hint && !satisfied && isRequired && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              Needs: {hint}
            </span>
          )}
        </span>
        {item.detail && (
          <span className="block text-xs text-[#6B6B6B] mt-1 leading-relaxed">
            {item.detail}
          </span>
        )}
      </span>
    </label>
  );
}

export function RecordUploadChecklistPanel({
  checklist,
  context,
  onAcknowledgmentChange,
}: Props) {
  const requiredItems = checklist.items.filter((item) => item.tier === "required");
  const recommendedItems = checklist.items.filter((item) => item.tier === "recommended");
  const requiredDone = requiredItems.filter((item) =>
    isChecklistItemSatisfied(item, context)
  ).length;
  const recommendedDone = recommendedItems.filter((item) =>
    isChecklistItemSatisfied(item, context)
  ).length;

  return (
    <div className="mb-6 rounded-xl border border-[#9FE1CB] bg-[#E1F5EE]/30 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0F6E56]">
            Try-in–skip records
          </p>
          <h3 className="text-sm font-semibold text-[#085041] mt-1">{checklist.title}</h3>
        </div>
        <p className="text-xs text-[#0F6E56] shrink-0">
          Required {requiredDone}/{requiredItems.length}
          {recommendedItems.length > 0 && ` · Recommended ${recommendedDone}/${recommendedItems.length}`}
        </p>
      </div>

      <p className="text-sm text-[#0F6E56] leading-relaxed mb-2">{checklist.intro}</p>
      {checklist.jbNote && (
        <p className="text-xs text-[#085041] mb-4 leading-relaxed">{checklist.jbNote}</p>
      )}

      {requiredItems.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#085041] mb-2">
            Required to submit
          </p>
          <ul className="space-y-2">
            {requiredItems.map((item) => (
              <li key={item.id}>
                <ChecklistItemRow
                  item={item}
                  context={context}
                  onAcknowledgmentChange={onAcknowledgmentChange}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendedItems.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6B6B6B] mb-2">
            Recommended — helps avoid try-in
          </p>
          <ul className="space-y-2">
            {recommendedItems.map((item) => (
              <li key={item.id}>
                <ChecklistItemRow
                  item={item}
                  context={context}
                  onAcknowledgmentChange={onAcknowledgmentChange}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
