"use client";

import type { RecordUploadChecklist } from "@/lib/products/record-upload-checklist";

type Props = {
  checklist: RecordUploadChecklist;
  checked: Record<string, boolean>;
  onChange: (itemId: string, value: boolean) => void;
};

export function RecordUploadChecklistPanel({ checklist, checked, onChange }: Props) {
  const doneCount = checklist.items.filter((item) => checked[item.id]).length;

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
          {doneCount} / {checklist.items.length} confirmed
        </p>
      </div>

      <p className="text-sm text-[#0F6E56] leading-relaxed mb-2">{checklist.intro}</p>
      {checklist.jbNote && (
        <p className="text-xs text-[#085041] mb-4 leading-relaxed">{checklist.jbNote}</p>
      )}

      <ul className="space-y-2">
        {checklist.items.map((item) => {
          const isChecked = !!checked[item.id];
          return (
            <li key={item.id}>
              <label
                className={`flex gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors
                  ${isChecked
                    ? "border-[#0F6E56] bg-white"
                    : "border-[#C5E8DC] bg-white/60 hover:border-[#0F6E56]/50"}`}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0"
                  checked={isChecked}
                  onChange={(e) => onChange(item.id, e.target.checked)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-[#1A1A1A] leading-snug">
                    {item.label}
                  </span>
                  {item.detail && (
                    <span className="block text-xs text-[#6B6B6B] mt-1 leading-relaxed">
                      {item.detail}
                    </span>
                  )}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
