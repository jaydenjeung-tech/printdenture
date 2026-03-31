"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";

// ── Types ──────────────────────────────────────────────────────────────────
type Product = {
  id: string;
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
  toothNumber: string;
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
};

// ── Product data ───────────────────────────────────────────────────────────
const products: Product[] = [
  {
    id: "zirconia",
    name: "Zirconia Crown",
    price: 129,
    turnaround: "5–7 days",
    description: "High-strength milled zirconia. Natural aesthetics, long-lasting durability.",
    accent: "#2563EB",
    fields: ["shade", "toothNumber"],
  },
  {
    id: "printed",
    name: "Printed Crown",
    price: 79,
    turnaround: "3–5 days",
    description: "3D-printed resin crowns. Fast turnaround for temporaries or permanents.",
    accent: "#16A34A",
    fields: ["shade", "toothNumber"],
  },
  {
    id: "nightguard",
    name: "Night Guard",
    price: 89,
    turnaround: "5–7 days",
    description: "Custom-fit digital night guard. Soft, hard, or dual-laminate options.",
    accent: "#D97706",
    fields: ["guardType"],
  },
  {
    id: "sportsguard",
    name: "Sports Guard",
    price: 79,
    turnaround: "5–7 days",
    description: "Impact-resistant custom sports guard. Team colors available.",
    accent: "#9333EA",
    fields: ["color"],
  },
];

const SHADES = ["A1", "A2", "A3", "A3.5", "B1", "B2", "B3", "C1", "C2", "D2"];
const TEETH = Array.from({ length: 32 }, (_, i) => String(i + 1));
const GUARD_TYPES = ["Soft", "Hard", "Dual-laminate"];
const COLORS = ["Clear", "Blue", "Red", "Green", "Black", "Custom"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

// ── Step indicator ─────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  const steps = ["Select product", "Case details", "Review & pay"];
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
              <div className={`w-16 h-px mb-5 mx-2 ${done ? "bg-[#2563EB]" : "bg-[#E2E0D8]"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 ─────────────────────────────────────────────────────────────────
function Step1({ data, onNext }: { data: OrderData; onNext: (p: Product) => void }) {
  const [selected, setSelected] = useState<Product | null>(data.product);
  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Choose your product</h2>
      <p className="text-[#6B6B6B] mb-8">Select the restoration type for this case.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {products.map((p) => {
          const isSelected = selected?.id === p.id;
          return (
            <button key={p.id} onClick={() => setSelected(p)}
              className={`text-left p-5 rounded-2xl border-2 transition-all
                ${isSelected ? "border-[#1A1A1A] bg-white shadow-md" : "border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE]"}`}>
              <div className="w-8 h-1 rounded-full mb-3" style={{ background: p.accent }} />
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-semibold text-[#1A1A1A]">{p.name}</span>
                <span className="text-lg font-bold text-[#1A1A1A]">${p.price}</span>
              </div>
              <p className="text-sm text-[#6B6B6B] mb-3 leading-relaxed">{p.description}</p>
              <Badge className="text-xs bg-white border border-[#E2E0D8] text-[#6B6B6B]">{p.turnaround}</Badge>
            </button>
          );
        })}
      </div>
      <Button className="w-full h-12 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-xl text-base"
        disabled={!selected} onClick={() => selected && onNext(selected)}>
        Continue
      </Button>
    </div>
  );
}

// ── Step 2 ─────────────────────────────────────────────────────────────────
function Step2({ data, onNext, onBack, onChange, onFileChange }: {
  data: OrderData;
  onNext: () => void;
  onBack: () => void;
  onChange: (k: keyof OrderData, v: string | number) => void;
  onFileChange: (file: File) => void;
}) {
  const p = data.product!;
  const needsShade = p.fields.includes("shade");
  const needsTooth = p.fields.includes("toothNumber");
  const needsGuard = p.fields.includes("guardType");
  const needsColor = p.fields.includes("color");
  const canProceed = data.fileName && (needsShade ? data.shade : true) && (needsTooth ? data.toothNumber : true);

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

      {/* Tooth number */}
      {needsTooth && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Tooth number *</label>
          <select value={data.toothNumber} onChange={(e) => onChange("toothNumber", e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A]">
            <option value="">Select tooth #</option>
            {TEETH.map((t) => <option key={t} value={t}>#{t}</option>)}
          </select>
        </div>
      )}

      {/* Guard type */}
      {needsGuard && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Guard type *</label>
          <div className="flex gap-2">
            {GUARD_TYPES.map((g) => (
              <button key={g} onClick={() => onChange("notes", g)}
                className={`px-4 h-9 rounded-lg text-sm border transition-all
                  ${data.notes === g ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
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
              <button key={c} onClick={() => onChange("notes", c)}
                className={`px-3 h-8 rounded-lg text-sm border transition-all
                  ${data.notes === c ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STL Upload */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">STL file *</label>
        <label className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-all
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
          <input type="file" accept=".stl" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onFileChange(file);
            }} />
        </label>
      </div>

     {/* Notes */}
<div className="mb-8">
  <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
    Notes <span className="text-[#9B9B9B] font-normal">(optional)</span>
  </label>
  <textarea
    value={data.notes}
    onChange={(e) => onChange("notes", e.target.value)}
    placeholder="Any special instructions for the lab..."
    rows={3}
    className="w-full px-3 py-2.5 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm resize-none focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
  />
</div>

      <div className="flex gap-3">
        <Button variant="outline" className="h-12 px-6 rounded-xl border-[#E2E0D8] text-[#6B6B6B]" onClick={onBack}>Back</Button>
        <Button className="flex-1 h-12 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-xl text-base"
          disabled={!canProceed} onClick={onNext}>Continue</Button>
      </div>
    </div>
  );
}
function Field({ label, field, placeholder, half, value, onChange }: {
  label: string;
  field: string;
  placeholder?: string;
  half?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className={half ? "flex-1" : "w-full"}>
      <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]"
      />
    </div>
  );
}
// ── Step 3 ─────────────────────────────────────────────────────────────────
function Step3({ data, onBack, onChange, onSubmit, submitting }: {
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
  const canSubmit = data.firstName && data.lastName && data.practiceName && data.address && data.city && data.state && data.zip;

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
        {data.shade && <p className="text-xs text-[#9B9B9B] ml-4 mb-1">Shade: {data.shade} · Tooth #{data.toothNumber}</p>}
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
          <Field label="First name" field="firstName" placeholder="John" half value={data.firstName} onChange={(v) => onChange("firstName", v)} />
          <Field label="Last name" field="lastName" placeholder="Smith" half value={data.lastName} onChange={(v) => onChange("lastName", v)} />
        </div>
        <Field label="Practice name" field="practiceName" placeholder="Smith Family Dentistry" value={data.practiceName} onChange={(v) => onChange("practiceName", v)} />
       <Field label="Street address" field="address" placeholder="123 Main St" value={data.address} onChange={(v) => onChange("address", v)} />
        <div className="flex gap-3">
          <Field label="City" field="city" placeholder="Los Angeles" half value={data.city} onChange={(v) => onChange("city", v)} />
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">State</label>
            <select value={data.state} onChange={(e) => onChange("state", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A]">
              <option value="">State</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Field label="ZIP" field="zip" placeholder="90001" half value={data.zip} onChange={(v) => onChange("zip", v)} />
        </div>
        <Field label="Phone" field="phone" placeholder="(555) 000-0000" value={data.phone} onChange={(v) => onChange("phone", v)} />
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="h-12 px-6 rounded-xl border-[#E2E0D8] text-[#6B6B6B]" onClick={onBack}>Back</Button>
        <Button
          className="flex-1 h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-base font-semibold"
          disabled={!canSubmit || submitting}
          onClick={onSubmit}>
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
    product: null, quantity: 1, shade: "", toothNumber: "",
    notes: "", file: null, fileName: "",
    firstName: "", lastName: "", practiceName: "",
    address: "", city: "", state: "", zip: "", phone: "",
  });

  function update(key: keyof OrderData, value: string | number) {
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

    // 1. orders 테이블에 저장
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
        tooth_number: data.toothNumber || null,
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

    // 2. STL 파일을 Storage에 업로드 (파일명 = order_id.stl — 환자 정보 없음)
    const filePath = `${user.id}/${order.id}.stl`;
    const { error: uploadError } = await supabase.storage
      .from("stl-files")
      .upload(filePath, data.file);

    if (uploadError) {
      console.error("STL upload error:", uploadError);
      // 파일 업로드 실패해도 주문은 살림
    } else {
      // 3. stl_file_path 업데이트
      await supabase.from("orders").update({ stl_file_path: filePath }).eq("id", order.id);
    }

    // 4. 프로필 배송지 업데이트
    await supabase.from("profiles").update({
      first_name: data.firstName,
      last_name: data.lastName,
      practice_name: data.practiceName,
      address: data.address,
      city: data.city,
      state: data.state,
      zip: data.zip,
      phone: data.phone,
    }).eq("id", user.id);

    router.push("/dashboard?ordered=true");
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
          <Step1 data={data} onNext={(p) => { setData((prev) => ({ ...prev, product: p })); setStep(2); }} />
        )}
        {step === 2 && (
          <Step2 data={data} onChange={update} onFileChange={handleFileChange} onBack={() => setStep(1)} onNext={() => setStep(3)} />
        )}
        {step === 3 && (
          <Step3 data={data} onChange={(k, v) => update(k, v)} onBack={() => setStep(2)} onSubmit={handleSubmit} submitting={submitting} />
        )}
      </div>
    </div>
  );
}