"use client";

import Link from "next/link";
import { SHIPPING_LABEL } from "@/lib/shipping";
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
  const showJbTrayGuide = activeFlowStep === "product" && requiredEquipment.includes("jb_tray");
  const showJbForkGuide = activeFlowStep === "product" && requiredEquipment.includes("jb_fork");

  return (
    <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
      <div className="border border-[var(--pd-border)] bg-white p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">
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
                className={`w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-[var(--pd-navy)] text-white"
                    : isComplete
                      ? "hover:bg-[var(--pd-surface)] cursor-pointer"
                      : "opacity-60 cursor-default"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold ${
                    isActive
                      ? "bg-white text-[var(--pd-navy)]"
                      : isComplete
                        ? "bg-[var(--pd-teal)] text-white"
                        : "bg-[var(--pd-border)] text-[var(--pd-muted)]"
                  }`}
                >
                  {isComplete ? "✓" : stepNumber}
                </span>
                <span className="min-w-0 pt-0.5">
                  <span
                    className={`block text-[14px] font-semibold leading-tight ${
                      isActive ? "text-white" : "text-[var(--pd-navy)]"
                    }`}
                  >
                    {ORDER_FLOW_STEP_LABELS[flowStep]}
                  </span>
                  <span
                    className={`block text-[11px] mt-0.5 leading-snug ${
                      isActive ? "text-white/75" : "text-[var(--pd-muted)]"
                    }`}
                  >
                    {ORDER_FLOW_STEP_HINTS[flowStep].title}
                  </span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {productName && pricing && (
        <div className="border border-[var(--pd-border)] bg-white p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">
            Estimate
          </p>
          <p className="text-[14px] font-semibold text-[var(--pd-navy)] mt-2 leading-snug">{productName}</p>
          <p className="text-[12px] text-[var(--pd-muted)] mt-1">Qty {quantity}</p>
          <p className="text-2xl font-semibold text-[var(--pd-navy)] mt-3">${pricing.total}</p>
          <p className="text-[11px] text-[var(--pd-muted)] mt-1 leading-relaxed">
            ${pricing.subtotal} product · ${pricing.shipping} {SHIPPING_LABEL}
            {pricing.designFee > 0 ? ` · $${pricing.designFee} CAD` : ""}
          </p>
        </div>
      )}

      {activeHint && (
        <div className="border border-[#9FE1CB] bg-[#E1F5EE]/40 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-teal-dark)]">
            This step
          </p>
          <p className="text-[14px] font-semibold text-[var(--pd-navy)] mt-2">{activeHint.title}</p>
          <p className="text-[13px] text-[var(--pd-teal-dark)] mt-1 leading-relaxed">{activeHint.description}</p>
          {activeHint.bullets && activeHint.bullets.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {activeHint.bullets.map((item) => (
                <li key={item} className="flex gap-2 text-[12px] text-[var(--pd-teal-dark)] leading-relaxed">
                  <span className="text-[var(--pd-teal)] shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
          {(showJbTrayGuide || showJbForkGuide) && (
            <div className="mt-4 flex flex-col gap-1.5 text-[12px]">
              {showJbTrayGuide && (
                <Link href="/guides/jb-tray" className="text-[var(--pd-teal-dark)] font-medium hover:underline">
                  JB Tray guide →
                </Link>
              )}
              {showJbForkGuide && (
                <Link href="/guides/jb-fork" className="text-[var(--pd-teal-dark)] font-medium hover:underline">
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
    <div className="lg:hidden mb-6 border border-[var(--pd-border)] bg-white p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-[12px] font-semibold text-[var(--pd-navy)]">
          Step {step} of {orderFlow.length}
        </p>
        <p className="text-[12px] text-[var(--pd-muted)]">{activeLabel}</p>
      </div>
      <div className="flex gap-1 mb-2">
        {orderFlow.map((flowStep, index) => {
          const stepNumber = index + 1;
          const isActive = step === stepNumber;
          const isComplete = step > stepNumber;
          return (
            <div
              key={flowStep}
              className={`h-1 flex-1 ${isComplete || isActive ? "bg-[var(--pd-teal)]" : "bg-[var(--pd-border)]"}`}
            />
          );
        })}
      </div>
      {activeHint && <p className="text-[12px] text-[var(--pd-slate)] leading-relaxed">{activeHint}</p>}
      {productName && total != null && (
        <p className="text-[12px] text-[var(--pd-navy)] font-medium mt-2 truncate">
          {productName} · ${total}
        </p>
      )}
    </div>
  );
}
