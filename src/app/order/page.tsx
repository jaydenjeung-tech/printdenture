"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";


// ── Types ──────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  category: string;  // ← 이거 추가
  name: string;
  price: number;
  turnaround: string;
  description: string;
  accent: string;
  fields: string[];
};

type OrderData = {
  product: Product | null;
  quantity: number;
  shade: string;
  toothNumbers: number[];   // ← 배열로 변경
  notes: string;
  file: File | null;
  fileName: string;
  firstName: string;
  lastName: string;
  practiceName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  // Rx 필드
  marginType: string;
  occlusion: string;
  guardType: string;
  color: string;
  dentistName: string;
  licenseNo: string;
  licenseState: string;
  authorized: boolean;
};

// ── Product data ───────────────────────────────────────────────────────────


const SHADES = ["A1", "A2", "A3", "A3.5", "B1", "B2", "B3", "C1", "C2", "D2"];
const MARGIN_TYPES = ["Feather", "Chamfer", "Shoulder"];
const OCCLUSIONS = ["Light", "Normal", "Heavy"];
const GUARD_TYPES = ["Soft", "Hard", "Dual-laminate"];
const COLORS = ["Clear", "Blue", "Red", "Green", "Black", "Custom"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const UPPER_TEETH = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
const LOWER_TEETH = [32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17];

// ── Tooth Selector ─────────────────────────────────────────────────────────
function ToothSelector({ selected, onChange }: {
  selected: number[];
  onChange: (teeth: number[]) => void;
}) {
  function toggle(n: number) {
    onChange(selected.includes(n) ? selected.filter((t) => t !== n) : [...selected, n]);
  }

 function ToothBtn({ n }: { n: number }) {
  const isSelected = selected.includes(n);
  return (
    <button
      type="button"
      onClick={() => toggle(n)}
      className={`w-7 h-9 rounded-md border text-[10px] font-medium transition-all flex flex-col items-center justify-center gap-0.5
        ${isSelected
          ? "bg-[#1A1A1A] border-[#1A1A1A] text-white"
          : "bg-white border-[#E2E0D8] text-[#6B6B6B] hover:border-[#1A1A1A]"
        }`}
    >
      <div className={`w-3 h-2 rounded-sm ${isSelected ? "bg-white/30" : "bg-[#E2E0D8]"}`} />
      <span>{n}</span>
    </button>
  );
}

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-[#9B9B9B]">← Right</span>
        <span className="text-xs font-medium text-[#1A1A1A]">Upper</span>
        <span className="text-xs text-[#9B9B9B]">Left →</span>
      </div>
      <div className="flex gap-0.5 justify-center mb-1">
        {UPPER_TEETH.map((n) => <ToothBtn key={n} n={n} />)}
      </div>
      <div className="border-t border-dashed border-[#E2E0D8] my-2" />
      <div className="flex gap-0.5 justify-center mb-1">
        {LOWER_TEETH.map((n) => <ToothBtn key={n} n={n} />)}
      </div>
      <div className="flex justify-center">
        <span className="text-xs font-medium text-[#1A1A1A]">Lower</span>
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {[...selected].sort((a, b) => a - b).map((n) => (
            <span key={n} className="px-2 py-0.5 rounded-full bg-[#1A1A1A] text-white text-xs">
              #{n}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  const steps = ["Product", "Case details", "Rx", "Review & pay"];
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((label, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                ${done ? "bg-[#2563EB] text-white" : active ? "bg-[#1A1A1A] text-white" : "bg-[#E2E0D8] text-[#9B9B9B]"}`}>
                {done ? "✓" : idx}
              </div>
              <span className={`text-xs whitespace-nowrap ${active ? "text-[#1A1A1A] font-medium" : "text-[#9B9B9B]"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-px mb-5 mx-1 ${done ? "bg-[#2563EB]" : "bg-[#E2E0D8]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 ─────────────────────────────────────────────────────────────────
// ── Step 1 ─────────────────────────────────────────────────────────────────
const CATEGORY_GROUPS = [
  {
    label: "Crowns",
    categories: ["zirconia", "printed"],
  },
  {
    label: "Guards",
    categories: ["nightguard", "sportsguard"],
  },
];

function Step1({ data, products, onNext }: {
  data: OrderData;
  products: Product[];
  onNext: (p: Product) => void;
}) {
  

  const groups = CATEGORY_GROUPS.map((g) => ({
    ...g,
    items: products.filter((p) => g.categories.includes(p.category)),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Choose your product</h2>
      <p className="text-[#6B6B6B] mb-8">Select the restoration type for this case.</p>

      <div className="space-y-6 mb-8">
        {groups.map((group, gi) => (
          <div key={group.label}>
            {/* Category label */}
            <p className="text-xs font-medium text-[#9B9B9B] uppercase tracking-widest mb-3">
              {group.label}
            </p>

            {/* Product grid */}
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((p) => {
                
                return (
                  // 카드 버튼 onClick 변경
<button
  key={p.id}
  onClick={() => onNext(p)}  // ← setSelected 대신 바로 onNext
  className="text-left p-4 rounded-xl border transition-all border-[#E2E0D8] bg-white hover:border-[#1A1A1A] hover:shadow-sm"
>
                    <div className="w-6 h-0.5 rounded-full mb-3" style={{ background: p.accent }} />
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <span className="text-sm font-medium text-[#1A1A1A] leading-snug">{p.name}</span>
                      <span className="text-sm font-semibold text-[#1A1A1A] whitespace-nowrap flex-shrink-0">
                        ${p.price}
                      </span>
                    </div>
                    <p className="text-xs text-[#9B9B9B] leading-relaxed mb-2">{p.description}</p>
                    <span className="inline-block text-[10px] text-[#9B9B9B] bg-[#F8F7F4] border border-[#E2E0D8] rounded-full px-2 py-0.5">
                      {p.turnaround}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Divider between groups */}
            {gi < groups.length - 1 && (
              <div className="border-b border-[#E2E0D8] mt-6" />
            )}
          </div>
        ))}
      </div>

    </div>
  );
}

// ── Step 2 ─────────────────────────────────────────────────────────────────
function Step2({ data, onNext, onBack, onChange, onFileChange, onTeethChange }: {
  data: OrderData;
  onNext: () => void;
  onBack: () => void;
  onChange: (k: keyof OrderData, v: string | number) => void;
  onFileChange: (file: File) => void;
  onTeethChange: (teeth: number[]) => void;
}) {
  const p = data.product!;
  const needsShade = p.fields.includes("shade");
  const needsTooth = p.fields.includes("toothNumber");
  const needsGuard = p.fields.includes("guardType");
  const needsColor = p.fields.includes("color");
  const canProceed = data.fileName &&
    (needsShade ? data.shade : true) &&
    (needsTooth ? data.toothNumbers.length > 0 : true);

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Case details</h2>
      <p className="text-[#6B6B6B] mb-8">Upload your scan and fill in the case information.</p>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E2E0D8] mb-6">
        <div className="w-2 h-8 rounded-full" style={{ background: p.accent }} />
        <div>
          <p className="font-semibold text-[#1A1A1A] text-sm">{p.name}</p>
          <p className="text-xs text-[#9B9B9B]">${p.price} · {p.turnaround}</p>
        </div>
      </div>

      {/* Quantity */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Quantity</label>
        <div className="flex items-center gap-3">
          <button onClick={() => onChange("quantity", Math.max(1, data.quantity - 1))}
            className="w-9 h-9 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] font-semibold hover:bg-[#F8F7F4]">−</button>
          <span className="w-8 text-center font-semibold text-[#1A1A1A]">{data.quantity}</span>
          <button onClick={() => onChange("quantity", data.quantity + 1)}
            className="w-9 h-9 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] font-semibold hover:bg-[#F8F7F4]">+</button>
        </div>
      </div>

      {/* Tooth selector */}
      {needsTooth && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Tooth number(s) *</label>
          <div className="p-4 rounded-xl bg-white border border-[#E2E0D8] overflow-x-auto">
            <ToothSelector selected={data.toothNumbers} onChange={onTeethChange} />
          </div>
        </div>
      )}

      {/* Shade */}
      {needsShade && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Shade *</label>
          <div className="flex flex-wrap gap-2">
            {SHADES.map((s) => (
              <button key={s} onClick={() => onChange("shade", s)}
                className={`px-3 h-8 rounded-lg text-sm border transition-all
                  ${data.shade === s ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Guard type */}
      {needsGuard && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Guard type *</label>
          <div className="flex gap-2">
            {GUARD_TYPES.map((g) => (
              <button key={g} onClick={() => onChange("guardType", g)}
                className={`px-4 h-9 rounded-lg text-sm border transition-all
                  ${data.guardType === g ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color */}
      {needsColor && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button key={c} onClick={() => onChange("color", c)}
                className={`px-3 h-8 rounded-lg text-sm border transition-all
                  ${data.color === c ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STL Upload */}
<div className="mb-5">
  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">STL file *</label>
  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) onFileChange(file);
    }}
    onClick={() => document.getElementById("stl-input")?.click()}
    className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all
      ${data.fileName ? "border-[#1A1A1A] bg-white" : "border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE]"}`}>
    {data.fileName ? (
      <div className="text-center">
        <p className="text-sm font-medium text-[#1A1A1A]">{data.fileName}</p>
        <p className="text-xs text-[#9B9B9B] mt-1">Click to replace</p>
      </div>
    ) : (
      <div className="text-center px-4">
        <p className="text-sm text-[#6B6B6B]">Drop your STL file here or <span className="text-[#2563EB] font-medium">browse</span></p>
        <p className="text-xs text-[#9B9B9B] mt-1">Supports .stl · Max 100MB</p>
      </div>
    )}
  </div>
  <input
    id="stl-input"
    type="file"
    accept=".stl"
    className="hidden"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) onFileChange(file);
    }}
  />
</div>

      {/* Notes */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Notes <span className="text-[#9B9B9B] font-normal">(optional)</span>
        </label>
        <textarea value={data.notes} onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Any special instructions for the lab..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm resize-none focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]" />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="h-12 px-6 rounded-xl border-[#E2E0D8] text-[#6B6B6B]" onClick={onBack}>Back</Button>
        <Button className="flex-1 h-12 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-xl text-base"
          disabled={!canProceed} onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}

// ── Step 3 — Rx ────────────────────────────────────────────────────────────
function Step3Rx({ data, onNext, onBack, onChange }: {
  data: OrderData;
  onNext: () => void;
  onBack: () => void;
  onChange: (k: keyof OrderData, v: string | boolean) => void;
}) {
  const p = data.product!;
  const needsShade = p.fields.includes("shade");
  const needsTooth = p.fields.includes("toothNumber");

  const canProceed =
    data.dentistName.trim() &&
    data.licenseNo.trim() &&
    data.licenseState &&
    data.authorized;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Lab Rx</h2>
      <p className="text-[#6B6B6B] mb-8">Complete the prescription for this case.</p>

      {/* Case summary */}
      <div className="p-4 rounded-xl bg-white border border-[#E2E0D8] mb-6 space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] mb-2">Case summary</p>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-[#9B9B9B]">Product </span>
            <span className="font-medium text-[#1A1A1A]">{p.name}</span>
          </div>
          {needsTooth && data.toothNumbers.length > 0 && (
            <div>
              <span className="text-[#9B9B9B]">Tooth </span>
              <span className="font-medium text-[#1A1A1A]">
                {[...data.toothNumbers].sort((a, b) => a - b).map((n) => `#${n}`).join(", ")}
              </span>
            </div>
          )}
          {needsShade && data.shade && (
            <div>
              <span className="text-[#9B9B9B]">Shade </span>
              <span className="font-medium text-[#1A1A1A]">{data.shade}</span>
            </div>
          )}
        </div>
      </div>

      {/* Margin & Occlusion (crown only) */}
      {needsTooth && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Margin type</label>
            <div className="flex flex-col gap-1.5">
              {MARGIN_TYPES.map((m) => (
                <button key={m} onClick={() => onChange("marginType", m)}
                  className={`h-9 rounded-lg text-sm border transition-all px-3 text-left
                    ${data.marginType === m ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Occlusion</label>
            <div className="flex flex-col gap-1.5">
              {OCCLUSIONS.map((o) => (
                <button key={o} onClick={() => onChange("occlusion", o)}
                  className={`h-9 rounded-lg text-sm border transition-all px-3 text-left
                    ${data.occlusion === o ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dentist info */}
      <div className="space-y-3 mb-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Dentist name *</label>
          <input type="text" value={data.dentistName}
            onChange={(e) => onChange("dentistName", e.target.value)}
            placeholder="Dr. Jane Smith"
            className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">License # *</label>
            <input type="text" value={data.licenseNo}
              onChange={(e) => onChange("licenseNo", e.target.value)}
              placeholder="D12345"
              className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]" />
          </div>
          <div className="w-28">
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">State *</label>
            <select value={data.licenseState} onChange={(e) => onChange("licenseState", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A]">
              <option value="">—</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Authorization checkbox */}
      <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all mb-8
        ${data.authorized ? "border-[#1A1A1A] bg-white" : "border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE]"}`}>
        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all
          ${data.authorized ? "bg-[#1A1A1A] border-[#1A1A1A]" : "bg-white border-[#C8C6BE]"}`}>
          {data.authorized && <span className="text-white text-xs">✓</span>}
        </div>
        <input type="checkbox" className="hidden"
          checked={data.authorized}
          onChange={(e) => onChange("authorized", e.target.checked)} />
        <p className="text-sm text-[#4B4B4B] leading-relaxed">
          I, <strong>{data.dentistName || "the undersigned dentist"}</strong>, License #{data.licenseNo || "___"} ({data.licenseState || "State"}),
          hereby authorize the fabrication of the dental restoration described above in accordance with this prescription.
          This constitutes my electronic signature under the E-SIGN Act.
        </p>
      </label>

      <div className="flex gap-3">
        <Button variant="outline" className="h-12 px-6 rounded-xl border-[#E2E0D8] text-[#6B6B6B]" onClick={onBack}>Back</Button>
        <Button className="flex-1 h-12 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-xl text-base"
          disabled={!canProceed} onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}

// ── Field helper ───────────────────────────────────────────────────────────
function Field({ label, placeholder, half, value, onChange }: {
  label: string; field?: string; placeholder?: string; half?: boolean;
  value: string; onChange: (v: string) => void;
}) {
  return (
    <div className={half ? "flex-1" : "w-full"}>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]" />
    </div>
  );
}

// ── Step 4 — Review & Pay ──────────────────────────────────────────────────
function Step4({ data, onBack, onChange, onSubmit, submitting }: {
  data: OrderData;
  onBack: () => void;
  onChange: (k: keyof OrderData, v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const p = data.product!;
  const subtotal = p.price * data.quantity;
  const shipping = 15;
  const total = subtotal + shipping;
  const canSubmit = data.firstName && data.lastName && data.practiceName &&
    data.address && data.city && data.state && data.zip;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Review & shipping</h2>
      <p className="text-[#6B6B6B] mb-8">Confirm your order and enter your shipping address.</p>

      {/* Order summary */}
      <div className="p-5 rounded-xl bg-white border border-[#E2E0D8] mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] mb-4">Order summary</p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 rounded-full" style={{ background: p.accent }} />
            <span className="text-sm text-[#1A1A1A]">{p.name} × {data.quantity}</span>
          </div>
          <span className="text-sm font-medium text-[#1A1A1A]">${subtotal}</span>
        </div>
        {data.shade && (
          <p className="text-xs text-[#9B9B9B] ml-4 mb-1">
            Shade: {data.shade}
            {data.toothNumbers.length > 0 && ` · Tooth ${[...data.toothNumbers].sort((a,b)=>a-b).map(n=>`#${n}`).join(", ")}`}
          </p>
        )}
        {data.marginType && <p className="text-xs text-[#9B9B9B] ml-4 mb-1">Margin: {data.marginType} · Occlusion: {data.occlusion}</p>}
        <p className="text-xs text-[#9B9B9B] ml-4 mb-1">Rx: Dr. {data.dentistName} · #{data.licenseNo} ({data.licenseState})</p>
        {data.fileName && <p className="text-xs text-[#9B9B9B] ml-4 mb-3">File: {data.fileName}</p>}
        <div className="border-t border-[#F0EEE8] pt-3 space-y-1.5">
          <div className="flex justify-between text-sm text-[#6B6B6B]">
            <span>Shipping (FedEx)</span><span>${shipping}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-[#1A1A1A]">
            <span>Total</span><span>${total}</span>
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] mb-4">Shipping address</p>
      <div className="space-y-3 mb-8">
        <div className="flex gap-3">
          <Field label="First name" placeholder="John" half value={data.firstName} onChange={(v) => onChange("firstName", v)} />
          <Field label="Last name" placeholder="Smith" half value={data.lastName} onChange={(v) => onChange("lastName", v)} />
        </div>
        <Field label="Practice name" placeholder="Smith Family Dentistry" value={data.practiceName} onChange={(v) => onChange("practiceName", v)} />
        <Field label="Street address" placeholder="123 Main St" value={data.address} onChange={(v) => onChange("address", v)} />
        <div className="flex gap-3">
          <Field label="City" placeholder="Los Angeles" half value={data.city} onChange={(v) => onChange("city", v)} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">State</label>
            <select value={data.state} onChange={(e) => onChange("state", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A]">
              <option value="">State</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Field label="ZIP" placeholder="90001" half value={data.zip} onChange={(v) => onChange("zip", v)} />
        </div>
        <Field label="Phone" placeholder="(555) 000-0000" value={data.phone} onChange={(v) => onChange("phone", v)} />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="h-12 px-6 rounded-xl border-[#E2E0D8] text-[#6B6B6B]" onClick={onBack}>Back</Button>
        <Button className="flex-1 h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-base font-semibold"
          disabled={!canSubmit || submitting} onClick={onSubmit}>
          {submitting ? "Placing order..." : `Place order · $${total}`}
        </Button>
      </div>
      <p className="text-xs text-center text-[#9B9B9B] mt-4">
        Secure checkout · HIPAA compliant · Free remake guarantee
      </p>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function OrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<OrderData>({
    product: null, quantity: 1, shade: "", toothNumbers: [],
    notes: "", file: null, fileName: "",
    firstName: "", lastName: "", practiceName: "",
    address: "", city: "", state: "", zip: "", phone: "",
    marginType: "", occlusion: "", guardType: "", color: "",
    dentistName: "", licenseNo: "", licenseState: "", authorized: false,
  });
  const [products, setProducts] = useState<Product[]>([]);
const [productsLoading, setProductsLoading] = useState(true);
// 프로필 자동완성
useEffect(() => {
  const supabase = createClient();

  async function init() {
    // 유저 확인
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    // 제품 목록 로드
    const { data: productData } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("sort_order");
    setProducts(productData || []);
    setProductsLoading(false);

    // 프로필 자동완성
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, practice_name, address, city, state, zip, phone, dentist_name, license_no, license_state")
      .eq("id", user.id)
      .single();

    if (profile) {
      setData((prev) => ({
        ...prev,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        practiceName: profile.practice_name || "",
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        zip: profile.zip || "",
        phone: profile.phone || "",
        dentistName: profile.dentist_name || "",
        licenseNo: profile.license_no || "",
        licenseState: profile.license_state || "",
      }));
    }
  }

  init();
}, []);
  function update(key: keyof OrderData, value: string | number | boolean | number[]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(file: File) {
    setData((prev) => ({ ...prev, file, fileName: file.name }));
  }

  async function handleSubmit() {
    if (!data.product || !data.file) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const p = data.product;
    const subtotal = p.price * data.quantity;
    const total = subtotal + 15;

    // 1. orders 저장
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        product_id: p.id,
        product_name: p.name,
        quantity: data.quantity,
        unit_price: p.price,
        total_price: total,
        shade: data.shade || null,
        tooth_number: data.toothNumbers[0]?.toString() || null,
        tooth_numbers: data.toothNumbers,
        notes: data.notes || null,
        status: "received",
      })
      .select()
      .single();

    if (orderError || !order) {
      alert("Failed to place order. Please try again.");
      setSubmitting(false);
      return;
    }

    // 2. rx 저장
    const { data: rx, error: rxError } = await supabase
      .from("rx")
      .insert({
        order_id: order.id,
        user_id: user.id,
        tooth_numbers: data.toothNumbers,
        shade: data.shade || null,
        margin_type: data.marginType || null,
        occlusion: data.occlusion || null,
        guard_type: data.guardType || null,
        color: data.color || null,
        dentist_name: data.dentistName,
        dentist_license_no: data.licenseNo,
        license_state: data.licenseState,
        authorized: data.authorized,
        authorized_at: new Date().toISOString(),
        notes: data.notes || null,
      })
      .select()
      .single();

    if (!rxError && rx) {
      await supabase.from("orders").update({ rx_id: rx.id }).eq("id", order.id);
    }

    // 3. STL 업로드
    const filePath = `${user.id}/${order.id}.stl`;
    const { error: uploadError } = await supabase.storage
      .from("stl-files")
      .upload(filePath, data.file);

    if (!uploadError) {
      await supabase.from("orders").update({ stl_file_path: filePath }).eq("id", order.id);
    }

    // 4. 프로필 업데이트
   await supabase.from("profiles").update({
  first_name: data.firstName,
  last_name: data.lastName,
  practice_name: data.practiceName,
  address: data.address,
  city: data.city,
  state: data.state,
  zip: data.zip,
  phone: data.phone,
  // 추가
  dentist_name: data.dentistName,
  license_no: data.licenseNo,
  license_state: data.licenseState,
}).eq("id", user.id);

    // 기존 router.push 대신
const res = await fetch("/api/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ orderId: order.id }),
});

const { url, error } = await res.json();
if (error) {
  alert("Payment error: " + error);
  setSubmitting(false);
  return;
}

window.location.href = url;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <div className="h-14 border-b border-[#E2E0D8] bg-white flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">PC</span>
          </div>
          <span className="font-semibold text-[#1A1A1A]">Print<span className="text-[#2563EB]">Crown</span></span>
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-6 py-12">
        <StepIndicator current={step} />
        {step === 1 && (
  productsLoading ? (
    <div className="flex items-center justify-center py-20">
      <p className="text-sm text-[#9B9B9B]">Loading products...</p>
    </div>
  ) : (
    <Step1
      data={data}
      products={products}
      onNext={(p) => { setData((prev) => ({ ...prev, product: p })); setStep(2); }}
    />
  )
)}
        {step === 2 && (
          <Step2 data={data} onChange={update} onFileChange={handleFileChange}
            onTeethChange={(teeth) => update("toothNumbers", teeth)}
            onBack={() => setStep(1)} onNext={() => setStep(3)} />
        )}
        {step === 3 && (
          <Step3Rx data={data} onChange={update} onBack={() => setStep(2)} onNext={() => setStep(4)} />
        )}
        {step === 4 && (
          <Step4 data={data} onChange={(k, v) => update(k, v)} onBack={() => setStep(3)}
            onSubmit={handleSubmit} submitting={submitting} />
        )}
      </div>
    </div>
  );
}