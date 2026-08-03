"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createAppClient } from "@/lib/supabase";
import {
  type EquipmentCheckState,
  type EquipmentKind,
  type EquipmentStatus,
  canProceedPastEquipmentStep,
  getRequiredEquipment,
  statusFieldForKind,
  trainedFieldForKind,
  EQUIPMENT_STATUS_LABELS,
} from "@/lib/equipment-requirements";
import { getDefaultProductForFamily } from "@/lib/equipment-shop";

import { JB_FORK_GUIDE_PATH } from "@/lib/guides/jb-fork-guide";
import { JB_TRAY_GUIDE_PATH } from "@/lib/guides/jb-tray-guide";

type EquipmentProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  accent: string;
  fields: string[];
};

type Props = {
  productCategory: string;
  equipmentProducts: EquipmentProduct[];
  initialState: EquipmentCheckState;
  userId: string;
  returnPath: string;
  flowStepLabel?: string;
  onBack: () => void;
  onContinue: (state: EquipmentCheckState) => void;
};

const KIND_META: Record<
  EquipmentKind,
  { title: string; guideHref: string; guideLabel: string; image: string }
> = {
  jb_tray: {
    title: "JB Tray",
    guideHref: JB_TRAY_GUIDE_PATH,
    guideLabel: "JB Tray clinical guide",
    image: "/images/jb-tray/product.jpg",
  },
  jb_fork: {
    title: "JB Fork Radi+",
    guideHref: JB_FORK_GUIDE_PATH,
    guideLabel: "JB Fork clinical guide",
    image: "/images/jb-fork/product.jpg",
  },
};

function productForKind(products: EquipmentProduct[], kind: EquipmentKind): EquipmentProduct | undefined {
  const family = kind === "jb_tray" ? "jb_tray" : "jb_fork";
  return getDefaultProductForFamily(products, family);
}

export default function EquipmentReadinessStep({
  productCategory,
  equipmentProducts,
  initialState,
  userId,
  returnPath,
  flowStepLabel,
  onBack,
  onContinue,
}: Props) {
  const [state, setState] = useState<EquipmentCheckState>(initialState);
  const [saving, setSaving] = useState(false);
  const [orderingKind, setOrderingKind] = useState<EquipmentKind | null>(null);
  const [error, setError] = useState("");

  const required = getRequiredEquipment(productCategory);
  const canContinue = canProceedPastEquipmentStep(productCategory, state);

  function setStatus(kind: EquipmentKind, status: EquipmentStatus) {
    setState((prev) => ({ ...prev, [statusFieldForKind(kind)]: status }));
  }

  function setTrained(kind: EquipmentKind, trained: boolean) {
    setState((prev) => ({ ...prev, [trainedFieldForKind(kind)]: trained }));
  }

  async function saveProfile(next: EquipmentCheckState) {
    const supabase = createAppClient();
    const { error: saveError } = await supabase
      .from("profiles")
      .update({
        jb_tray_status: next.jb_tray_status,
        jb_fork_status: next.jb_fork_status,
        jb_tray_trained: next.jb_tray_trained,
        jb_fork_trained: next.jb_fork_trained,
      })
      .eq("id", userId);
    if (saveError) throw new Error(saveError.message);
  }

  async function handleContinue() {
    if (!canContinue) return;
    setSaving(true);
    setError("");
    try {
      await saveProfile(state);
      onContinue(state);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save equipment status.");
    } finally {
      setSaving(false);
    }
  }

  async function handleOrderEquipment(kind: EquipmentKind) {
    const product = productForKind(equipmentProducts, kind);
    if (!product) {
      setError("Equipment product is not available. Please contact support.");
      return;
    }
    setOrderingKind(kind);
    setError("");
    try {
      const res = await fetch("/api/equipment-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
          returnTo: returnPath,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");

      // Profile "ordered" is set by Stripe webhook after payment — not before redirect.
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start checkout.");
      setOrderingKind(null);
    }
  }

  return (
    <div>
      {flowStepLabel && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0F6E56] mb-2">
          {flowStepLabel}
        </p>
      )}
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Record equipment check</h2>
      <p className="text-[#6B6B6B] mb-6 leading-relaxed">
        This case uses a JB workflow. Confirm your practice has the required chairside equipment,
        or order it from PrintDenture before you take records.
      </p>

      <div className="space-y-4 mb-6">
        {required.map((kind) => {
          const meta = KIND_META[kind];
          const status = kind === "jb_tray" ? state.jb_tray_status : state.jb_fork_status;
          const trained = kind === "jb_tray" ? state.jb_tray_trained : state.jb_fork_trained;
          const equipProduct = productForKind(equipmentProducts, kind);

          return (
            <div key={kind} className="rounded-2xl border border-[#E2E0D8] bg-white overflow-hidden">
              <div className="flex gap-4 p-4 sm:p-5 border-b border-[#F0EEE8]">
                <div
                  className="w-16 h-16 rounded-xl bg-[#F8F7F4] bg-cover bg-center shrink-0 border border-[#E2E0D8]"
                  style={{ backgroundImage: `url(${meta.image})` }}
                  role="img"
                  aria-label={meta.title}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-[#1A1A1A]">{meta.title}</h3>
                  <p className="text-sm text-[#6B6B6B] mt-1 leading-relaxed">
                    Required for this case type. Order here if your practice does not have it yet.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-[13px]">
                    <Link href={meta.guideHref} className="text-[#0F6E56] font-medium hover:underline">
                      {meta.guideLabel} →
                    </Link>
                    {kind === "jb_tray" && (
                      <Link
                        href={`${JB_TRAY_GUIDE_PATH}#videos`}
                        className="text-[#378ADD] font-medium hover:underline"
                      >
                        JB Tray videos →
                      </Link>
                    )}
                    {kind === "jb_fork" && (
                      <Link
                        href={`${JB_FORK_GUIDE_PATH}#videos`}
                        className="text-[#378ADD] font-medium hover:underline"
                      >
                        JB Fork videos →
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-4">
                <div>
                  <p className="text-sm font-medium text-[#1A1A1A] mb-2">Equipment status</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {(["have", "need", "ordered"] as EquipmentStatus[]).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setStatus(kind, value)}
                        className={`flex-1 h-10 rounded-lg text-sm border px-3 transition-all text-left sm:text-center
                          ${status === value
                            ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                            : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}
                      >
                        {EQUIPMENT_STATUS_LABELS[value]}
                      </button>
                    ))}
                  </div>
                </div>

                {status === "need" && equipProduct && (
                  <div className="rounded-xl border border-[#9FE1CB] bg-[#E1F5EE]/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-[#085041]">{equipProduct.name}</p>
                      <p className="text-xs text-[#0F6E56] mt-1">
                        ${equipProduct.price} + shipping · {equipProduct.turnaround}
                      </p>
                    </div>
                    <Button
                      className="h-10 px-5 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white shrink-0"
                      disabled={orderingKind === kind}
                      onClick={() => handleOrderEquipment(kind)}
                    >
                      {orderingKind === kind ? "Redirecting…" : `Order ${meta.title}`}
                    </Button>
                  </div>
                )}

                {status === "ordered" && (
                  <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    You can prepare this case now. Submit payment after equipment arrives and you mark it
                    received on your dashboard.
                  </p>
                )}

                <label
                  className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all
                    ${trained ? "border-[#1A1A1A] bg-white" : "border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE]"}`}
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border transition-all
                      ${trained ? "bg-[#1A1A1A] border-[#1A1A1A]" : "bg-white border-[#C8C6BE]"}`}
                  >
                    {trained && <span className="text-white text-xs">✓</span>}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={trained}
                    onChange={(e) => setTrained(kind, e.target.checked)}
                  />
                  <p className="text-sm text-[#4B4B4B] leading-relaxed">
                    Our team is trained on the {meta.title} chairside protocol (impression, VD/CR, and
                    scan handoff to the lab).
                  </p>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {!canContinue && (
        <p className="text-sm text-[#6B6B6B] mb-4">
          Order any missing equipment or confirm status as &ldquo;In practice&rdquo;, then check the training
          confirmation for each item.
        </p>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="h-12 px-6 rounded-xl border-[#E2E0D8] text-[#6B6B6B]"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          className="flex-1 h-12 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-xl text-base"
          disabled={!canContinue || saving}
          onClick={handleContinue}
        >
          {saving ? "Saving…" : "Continue to case details"}
        </Button>
      </div>
    </div>
  );
}
