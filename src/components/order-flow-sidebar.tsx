"use client";

import Link from "next/link";
import { SHIPPING_CARRIER } from "@/lib/shipping";
import {
  ORDER_FLOW_STEP_HINTS,
  ORDER_FLOW_STEP_LABELS,
  getRequiredEquipment,
  type OrderFlowStep,
} from "@/lib/equipment-requirements";

type OrderPricing = {
  subtotal: number;
  shipping: number;
  designFee: number;
  total: number;
};

type OrderFlowSidebarProps = {
  step: number;
  orderFlow: OrderFlowStep[];
  activeFlowStep: OrderFlowStep | undefined;
  productCategory?: string | null;
  productName: string | null;
  quantity: number;
  pricing: OrderPricing | null;
  onGoToStep: (target: OrderFlowStep) => void;
};

export function OrderFlowSidebar({
  step,
  orderFlow,
  activeFlowStep,
  productCategory,
  productName,
  quantity,
  pricing,
  onGoToStep,
}: OrderFlowSidebarProps) {
  const activeHint = activeFlowStep ? ORDER_FLOW_STEP_HINTS[activeFlowStep] : null;
  const requiredEquipment = productCategory ? getRequiredEquipment(productCategory) : [];
  const showJbTrayGuide =
    activeFlowStep === "product" && requiredEquipment.includes("jb_tray");
  const showJbForkGuide =
    activeFlowStep === "product" && requiredEquipment.includes("jb_fork");

  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-[#E2E0D8] bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B9B9B]">
          Order progress
        </p>
        <nav className="mt-4 space-y-1" aria-label="Order steps">
          {orderFlow.map((flowStep, index) => {
            const stepNumber = index + 1;
            const isActive = step === stepNumber;
            const isComplete = step > stepNumber;
            const canNavigate = isComplete;

            return (
              <button
                key={flowStep}
                type="button"
                disabled={!canNavigate}
                onClick={() => canNavigate && onGoToStep(flowStep)}
                className={`w-full flex items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors
                  ${isActive ? "bg-[#1A1A1A] text-white" : isComplete ? "hover:bg-[#F8F7F4] cursor-pointer" : "opacity-60 cursor-default"}`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold
                    ${isActive
                      ? "bg-white text-[#1A1A1A]"
                      : isComplete
                        ? "bg-[#0F6E56] text-white"
                        : "bg-[#E2E0D8] text-[#9B9B9B]"}`}
                >
                  {isComplete ? "✓" : stepNumber}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span className={`block text-sm font-semibold leading-tight ${isActive ? "text-white" : "text-[#1A1A1A]"}`}>
                    {ORDER_FLOW_STEP_LABELS[flowStep]}
                  </span>
                  <span className={`block text-[11px] mt-0.5 leading-snug ${isActive ? "text-white/75" : "text-[#9B9B9B]"}`}>
                    {ORDER_FLOW_STEP_HINTS[flowStep].title}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {productName && pricing && (
        <div className="rounded-2xl border border-[#E2E0D8] bg-white p-5 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9B9B9B]">
            Estimate
          </p>
          <p className="text-sm font-semibold text-[#1A1A1A] mt-2 leading-snug">{productName}</p>
          <p className="text-xs text-[#9B9B9B] mt-1">Qty {quantity}</p>
          <p className="text-2xl font-semibold text-[#1A1A1A] mt-3">${pricing.total}</p>
          <p className="text-[11px] text-[#9B9B9B] mt-1 leading-relaxed">
            ${pricing.subtotal} product · ${pricing.shipping} {SHIPPING_CARRIER}
            {pricing.designFee > 0 ? ` · $${pricing.designFee} CAD` : ""}
          </p>
        </div>
      )}

      {activeHint && (
        <div className="rounded-2xl border border-[#9FE1CB] bg-[#E1F5EE]/40 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#0F6E56]">
            This step
          </p>
          <p className="text-sm font-semibold text-[#085041] mt-2">{activeHint.title}</p>
          <p className="text-[13px] text-[#0F6E56] mt-1 leading-relaxed">{activeHint.description}</p>
          {activeHint.bullets && activeHint.bullets.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {activeHint.bullets.map((item) => (
                <li key={item} className="flex gap-2 text-[12px] text-[#085041] leading-relaxed">
                  <span className="text-[#0F6E56] shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {(showJbTrayGuide || showJbForkGuide) && (
            <div className="mt-4 flex flex-col gap-1.5 text-[12px]">
              {showJbTrayGuide && (
                <Link href="/guides/jb-tray" className="text-[#0F6E56] font-medium hover:underline">
                  JB Tray guide →
                </Link>
              )}
              {showJbForkGuide && (
                <Link href="/guides/jb-fork" className="text-[#0F6E56] font-medium hover:underline">
                  JB Fork guide →
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

export function OrderFlowMobileProgress({
  step,
  orderFlow,
  activeFlowStep,
  productName,
  total,
}: {
  step: number;
  orderFlow: OrderFlowStep[];
  activeFlowStep: OrderFlowStep | undefined;
  productName?: string | null;
  total?: number | null;
}) {
  const activeLabel = activeFlowStep ? ORDER_FLOW_STEP_LABELS[activeFlowStep] : "";
  const activeHint = activeFlowStep ? ORDER_FLOW_STEP_HINTS[activeFlowStep].title : "";

  return (
    <div className="lg:hidden mb-6 rounded-xl border border-[#E2E0D8] bg-white p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-semibold text-[#1A1A1A]">
          Step {step} of {orderFlow.length}
        </p>
        <p className="text-xs text-[#9B9B9B]">{activeLabel}</p>
      </div>
      <div className="flex gap-1 mb-2">
        {orderFlow.map((flowStep, index) => {
          const stepNumber = index + 1;
          const isActive = step === stepNumber;
          const isComplete = step > stepNumber;
          return (
            <div
              key={flowStep}
              className={`h-1.5 flex-1 rounded-full ${isComplete || isActive ? "bg-[#0F6E56]" : "bg-[#E2E0D8]"}`}
            />
          );
        })}
      </div>
      {activeHint && <p className="text-[12px] text-[#6B6B6B] leading-relaxed">{activeHint}</p>}
      {productName && total != null && (
        <p className="text-[12px] text-[#1A1A1A] font-medium mt-2 truncate">
          {productName} · ${total}
        </p>
      )}
    </div>
  );
}
