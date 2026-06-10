"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createAppClient, getClientUser } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { isOrderShippingComplete } from "@/lib/profile-requirements";
import { SHIPPING_CARRIER, SHIPPING_FLAT_RATE } from "@/lib/shipping";
import {
  saveOrderDraft,
  loadOrderDraft,
  clearOrderDraft,
  formatDraftSavedAt,
  type OrderDraftStored,
} from "@/lib/order-draft";
import { CURRENT_SITE } from "@/lib/products/site-catalog";
import { prepareCatalogProducts } from "@/lib/products/guard-catalog";
import {
  DENTURE_SERVICE_GROUPS,
  isCompleteServiceGroup,
} from "@/lib/products/denture-service-groups";
import { JbShopBanner } from "@/components/jb-shop-banner";
import { JbProtocolChooser } from "@/components/jb-protocol-chooser";
import { RecordUploadChecklistPanel } from "@/components/record-upload-checklist";
import { OrderFlowMobileProgress, OrderFlowSidebar } from "@/components/order-flow-sidebar";
import Link from "next/link";
import {
  buildOrderFlow,
  canSubmitLabCase,
  canStartJbLabCase,
  equipmentBlockReason,
  flowStepToIndex,
  getEquipmentNoticeForCategory,
  isJbWorkflowCategory,
  productRequiresEquipmentCheck,
  resolveDraftStepIndex,
  shopHrefForProductCategory,
  stepIndexToFlowStep,
  ORDER_FLOW_STEP_LABELS,
  type EquipmentProfile,
  type OrderFlowStep,
} from "@/lib/equipment-requirements";
import {
  emptyRecordChecklistForCategory,
  getRecordUploadChecklist,
  isRecordChecklistComplete,
} from "@/lib/products/record-upload-checklist";
import {
  ARCH_OPTIONS,
  formatArchLabel,
  formatOrderProductName,
  formatProductPriceHint,
  productNeedsArchSelection,
  resolveLegacyProductSelection,
  resolveLineItemPrice,
} from "@/lib/products/arch-pricing";

// ── Types ──────────────────────────────────────────────────────────────────
type Product = {
  id: string;
  category: string;
  name: string;
  price: number;
  turnaround: string;
  description: string;
  accent: string;
  fields: string[];
  sites?: string[] | null;
};

type OrderData = {
  product: Product | null;
  quantity: number;
  shade: string;
  toothNumbers: number[];
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
  marginType: string;
  occlusion: string;
  guardType: string;
  color: string;
  arch: string;
  dentistName: string;
  licenseNo: string;
  licenseState: string;
  authorized: boolean;
  aiDesignStatus: "idle" | "processing" | "ready" | "failed";
  aiDesignApproved: boolean;
  aiDesignSummary: string;
  aiDesignedFileName: string;
  aiDesignError: string;
  designChoice: "ai" | "cad" | "";
  recordChecklist: Record<string, boolean>;
};

const CAD_DESIGN_FEE = 5;

function getOrderPricing(data: OrderData) {
  const product = data.product;
  const unitPrice = product ? resolveLineItemPrice(product, data.arch) : 0;
  const subtotal = unitPrice * data.quantity;
  const shipping = SHIPPING_FLAT_RATE;
  const designFee = data.designChoice === "cad" ? CAD_DESIGN_FEE : 0;
  return { subtotal, shipping, designFee, unitPrice, total: subtotal + shipping + designFee };
}

function resolveActiveProductSelection(
  candidate: Product,
  activeCatalog: Product[]
): { product: Product; arch: string } {
  if (activeCatalog.some((p) => p.id === candidate.id)) {
    return { product: candidate, arch: "" };
  }
  const legacy = resolveLegacyProductSelection(candidate, activeCatalog);
  if (legacy) return { product: legacy.product, arch: legacy.arch };
  return { product: candidate, arch: "" };
}

function needsDentbirdDesign(product: Product | null) {
  return !!product
    && ["zirconia", "printed"].includes(product.category)
    && product.fields.includes("toothNumber");
}

function draftFieldsFromStored(draft: OrderDraftStored, product: Product): Partial<OrderData> {
  return {
    product,
    quantity: draft.quantity,
    shade: draft.shade,
    toothNumbers: draft.toothNumbers,
    notes: draft.notes,
    file: null,
    fileName: draft.fileName,
    firstName: draft.firstName,
    lastName: draft.lastName,
    practiceName: draft.practiceName,
    address: draft.address,
    city: draft.city,
    state: draft.state,
    zip: draft.zip,
    phone: draft.phone,
    marginType: draft.marginType,
    occlusion: draft.occlusion,
    guardType: draft.guardType,
    color: draft.color,
    arch: draft.arch,
    dentistName: draft.dentistName,
    licenseNo: draft.licenseNo,
    licenseState: draft.licenseState,
    authorized: draft.authorized,
    aiDesignStatus: draft.aiDesignStatus === "processing" ? "idle" : draft.aiDesignStatus,
    aiDesignApproved: draft.aiDesignApproved,
    aiDesignSummary: draft.aiDesignSummary,
    aiDesignedFileName: draft.aiDesignedFileName,
    aiDesignError: draft.aiDesignError,
    designChoice: draft.designChoice,
    recordChecklist: draft.recordChecklist ?? emptyRecordChecklistForCategory(product.category),
  };
}

const SHADES = ["A1", "A2", "A3", "A3.5", "B1", "B2", "B3", "C1", "C2", "D2"];
const MARGIN_TYPES = ["Feather", "Chamfer", "Shoulder"];
const OCCLUSIONS = ["Light", "Normal", "Heavy"];
const GUARD_TYPES = ["Soft", "Hard", "Dual-laminate"];
const COLORS = ["Clear", "Blue", "Red", "Green", "Black", "Custom"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const UPPER_TEETH = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16];
const LOWER_TEETH = [32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17];

const CATEGORY_GROUPS =
  CURRENT_SITE === "printdenture"
    ? DENTURE_SERVICE_GROUPS.map((group) => ({
        label: group.label,
        description: group.description,
        categories: [...group.categories],
      }))
    : [
        { label: "Crowns", description: "Zirconia, printed & implant crowns", categories: ["zirconia", "printed", "implant"] },
        { label: "Guards", description: "Night guards & sports guards", categories: ["nightguard", "sportsguard"] },
      ];

const UPPER_RIGHT = UPPER_TEETH.slice(0, 8);
const UPPER_LEFT = UPPER_TEETH.slice(8);
const LOWER_RIGHT = LOWER_TEETH.slice(0, 8);
const LOWER_LEFT = LOWER_TEETH.slice(8);

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
        aria-label={`Tooth ${n}`}
        aria-pressed={isSelected}
        className={`flex h-9 w-8 shrink-0 flex-col items-center justify-center rounded-md border text-[10px] font-semibold transition-all
          ${isSelected
            ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-sm"
            : "bg-white border-[#E2E0D8] text-[#6B6B6B] hover:border-[#1A1A1A]"}`}
      >
        <span className={`mb-0.5 h-1.5 w-3 rounded-sm ${isSelected ? "bg-white/35" : "bg-[#E2E0D8]"}`} />
        <span>{n}</span>
      </button>
    );
  }

  function ArchRow({ label, rightTeeth, leftTeeth }: {
    label: string;
    rightTeeth: number[];
    leftTeeth: number[];
  }) {
    return (
      <div>
        <p className="mb-2 text-center text-xs font-medium text-[#6B6B6B]">{label}</p>
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="mx-auto flex w-max items-center gap-2 px-1">
            <div className="flex gap-1">
              {rightTeeth.map((n) => <ToothBtn key={n} n={n} />)}
            </div>
            <div className="h-9 w-px shrink-0 bg-[#E2E0D8]" aria-hidden="true" />
            <div className="flex gap-1">
              {leftTeeth.map((n) => <ToothBtn key={n} n={n} />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between px-1 text-xs text-[#9B9B9B]">
        <span>Patient right</span>
        <span>Patient left</span>
      </div>

      <ArchRow label="Upper" rightTeeth={UPPER_RIGHT} leftTeeth={UPPER_LEFT} />

      <div className="border-t border-dashed border-[#E2E0D8]" />

      <ArchRow label="Lower" rightTeeth={LOWER_RIGHT} leftTeeth={LOWER_LEFT} />

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[...selected].sort((a, b) => a - b).map((n) => (
            <span key={n} className="px-2 py-0.5 rounded-full bg-[#1A1A1A] text-white text-xs">#{n}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function EquipmentNoticeCard({
  notice,
  onDismiss,
  compact,
}: {
  notice: NonNullable<ReturnType<typeof getEquipmentNoticeForCategory>>;
  onDismiss?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-[#9FE1CB] bg-[#E1F5EE]/50 ${
        compact ? "px-3 py-2.5" : "px-4 py-3"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-semibold text-[#085041] ${compact ? "text-xs" : "text-sm"}`}>
            {notice.title}
          </p>
          <p className={`text-[#0F6E56] leading-relaxed mt-1 ${compact ? "text-[11px]" : "text-xs"}`}>
            {notice.body}
          </p>
          <Link
            href="/shop"
            className={`inline-block mt-2 font-medium text-[#0F6E56] hover:underline ${
              compact ? "text-[11px]" : "text-xs"
            }`}
          >
            {notice.shopLabel} →
          </Link>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 w-7 h-7 rounded-full text-[#0F6E56] hover:bg-[#9FE1CB]/40 text-sm"
            aria-label="Dismiss notice"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// ── Step 1 ─────────────────────────────────────────────────────────────────
function Step1({ products, selectedProduct, onSelect, onContinue, flowStepLabel }: {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (p: Product) => void;
  onContinue: () => void;
  flowStepLabel?: string;
}) {
  const groups = CATEGORY_GROUPS.map((g) => ({
    ...g,
    items: products.filter((p) => g.categories.includes(p.category)),
  }));
  const visibleGroups =
    CURRENT_SITE === "printdenture" ? groups : groups.filter((g) => g.items.length > 0);

  const [activeGroup, setActiveGroup] = useState(visibleGroups[0]?.label ?? "");

  useEffect(() => {
    if (!selectedProduct) return;
    const match = visibleGroups.find((group) => group.items.some((product) => product.id === selectedProduct.id));
    if (match) setActiveGroup(match.label);
  }, [selectedProduct, products, visibleGroups]);

  const currentGroup = visibleGroups.find((group) => group.label === activeGroup) ?? visibleGroups[0];

  function handleSelect(product: Product) {
    onSelect(product);
  }

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0F6E56] mb-2">
        {flowStepLabel ?? "Product"}
      </p>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">What are you ordering?</h2>
      <p className="text-[#6B6B6B] mb-6">
        Pick the prosthesis and record protocol here. You will choose upper, lower, or both arches in case
        details.
      </p>

      {visibleGroups.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
          {visibleGroups.map((group) => {
            const active = group.label === activeGroup;
            return (
              <button
                key={group.label}
                type="button"
                onClick={() => setActiveGroup(group.label)}
                className={`rounded-xl border p-4 text-left transition-all
                  ${active
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm"
                    : "bg-white text-[#6B6B6B] border-[#E2E0D8] hover:border-[#1A1A1A]/40 hover:text-[#1A1A1A]"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{group.label}</span>
                  <span className={`text-xs ${active ? "text-white/70" : "text-[#9B9B9B]"}`}>
                    {group.items.length} items
                  </span>
                </div>
                {"description" in group && group.description && (
                  <p className={`text-xs mt-1.5 leading-relaxed ${active ? "text-white/75" : "text-[#9B9B9B]"}`}>
                    {group.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isCompleteServiceGroup(activeGroup) && (
        <div className="mb-6 rounded-xl border border-[#9FE1CB] bg-[#E1F5EE]/60 overflow-hidden">
          <JbProtocolChooser variant="compact" />
        </div>
      )}

      <div className="space-y-3 mb-8">
        {(currentGroup?.items ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E2E0D8] bg-white px-5 py-8 text-center">
            <p className="text-sm font-medium text-[#1A1A1A]">No products in this category yet</p>
            <p className="text-xs text-[#6B6B6B] mt-2 leading-relaxed max-w-md mx-auto">
              {currentGroup?.label} products will appear here once they are active in the catalog.
              Contact support if you expected to see options.
            </p>
          </div>
        ) : (
        <>
        {(currentGroup?.items ?? [])
          .sort((a, b) => {
            const order = currentGroup?.categories ?? [];
            return order.indexOf(a.category) - order.indexOf(b.category);
          })
          .map((product) => {
          const selected = selectedProduct?.id === product.id;
          return (
            <div key={product.id}>
            <button
              type="button"
              onClick={() => handleSelect(product)}
              aria-pressed={selected}
              className={`w-full text-left rounded-2xl border transition-all
                ${selected
                  ? "border-[#1A1A1A] bg-white shadow-sm ring-2 ring-[#1A1A1A]/10"
                  : "border-[#E2E0D8] bg-white hover:border-[#1A1A1A]/40"}`}
            >
              <div className="flex items-start gap-4 p-4 sm:p-5">
                <div className="w-1.5 self-stretch rounded-full shrink-0" style={{ background: product.accent }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-[#1A1A1A]">{product.name}</h3>
                      <p className="text-sm text-[#6B6B6B] mt-1 leading-relaxed">{product.description}</p>
                      {productRequiresEquipmentCheck(product.category) ? (
                        <p className="text-[11px] text-[#6B6B6B] mt-2 leading-relaxed">
                          {getEquipmentNoticeForCategory(product.category)?.equipmentLabel} starter kit
                          from PrintDenture — then capture records and submit this case.
                        </p>
                      ) : null}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold text-[#1A1A1A]">
                        {formatProductPriceHint(product)}
                      </p>
                      <p className="text-xs text-[#9B9B9B] mt-1">{product.turnaround}</p>
                    </div>
                  </div>
                </div>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm shrink-0 transition-all
                    ${selected
                      ? "border-[#1A1A1A] bg-[#1A1A1A] text-white"
                      : "border-[#E2E0D8] bg-[#F8F7F4] text-transparent"}`}
                  aria-hidden="true"
                >
                  ✓
                </span>
              </div>
            </button>
            </div>
          );
        })}
        </>
        )}
      </div>

      <div className="rounded-2xl border border-[#E2E0D8] bg-white p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[#9B9B9B]">Selected product</p>
            <p className="text-sm font-semibold text-[#1A1A1A] mt-1">
              {selectedProduct ? selectedProduct.name : "Choose a product to continue"}
            </p>
            {selectedProduct && (
              <p className="text-xs text-[#9B9B9B] mt-1">
                ${selectedProduct.price} · {selectedProduct.turnaround}
              </p>
            )}
          </div>
          <Button
            className="h-12 px-6 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white w-full sm:w-auto shrink-0"
            disabled={!selectedProduct}
            onClick={onContinue}
          >
            Continue to case details
          </Button>
        </div>
        {selectedProduct && productRequiresEquipmentCheck(selectedProduct.category) && (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-amber-950 leading-relaxed">
              {getEquipmentNoticeForCategory(selectedProduct.category)?.equipmentLabel} starter kit
              recommended — order from Shop, or continue to confirm your scan records on the next step.
            </p>
            {shopHrefForProductCategory(selectedProduct.category) && (
              <Link
                href={shopHrefForProductCategory(selectedProduct.category)!}
                className="inline-flex h-9 shrink-0 items-center justify-center rounded-lg bg-[#0F6E56] px-4 text-xs font-medium text-white hover:bg-[#085041]"
              >
                Open Shop
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 2 ─────────────────────────────────────────────────────────────────
function Step2({ data, onNext, onBack, onChange, onFileChange, onTeethChange, flowStepLabel, onChecklistChange, showJbShopBanner }: {
  data: OrderData;
  onNext: () => void;
  onBack: () => void;
  onChange: (k: keyof OrderData, v: string | number) => void;
  onFileChange: (file: File) => void;
  onTeethChange: (teeth: number[]) => void;
  flowStepLabel?: string;
  onChecklistChange: (itemId: string, value: boolean) => void;
  showJbShopBanner: boolean;
}) {
  const p = data.product!;
  const needsShade = p.fields.includes("shade");
  const needsTooth = p.fields.includes("toothNumber");
  const needsGuard = p.fields.includes("guardType");
  const needsColor = p.fields.includes("color");
  const needsArch = productNeedsArchSelection(p.fields);
  const recordChecklistDef = getRecordUploadChecklist(p.category);
  const checklistComplete = isRecordChecklistComplete(p.category, data.recordChecklist);
  const linePrice = resolveLineItemPrice(p, data.arch);
  const canProceed = data.fileName &&
    checklistComplete &&
    (needsShade ? data.shade : true) &&
    (needsTooth ? data.toothNumbers.length > 0 : true) &&
    (needsGuard ? (data.guardType && data.arch) : true) &&
    (needsArch ? !!data.arch : true);

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0F6E56] mb-2">
        {flowStepLabel ?? "Case details"}
      </p>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Upload scans & preferences</h2>
      <p className="text-[#6B6B6B] mb-8">
        Send your scan files and case details — our lab handles denture design and fabrication.
      </p>

      <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-[#E2E0D8] mb-6">
        <div className="w-2 h-8 rounded-full" style={{ background: p.accent }} />
        <div>
          <p className="font-semibold text-[#1A1A1A] text-sm">{p.name}</p>
          <p className="text-xs text-[#9B9B9B]">
            {data.arch ? `$${linePrice} · ${formatArchLabel(data.arch)}` : formatProductPriceHint(p)}
            {" · "}{p.turnaround}
          </p>
        </div>
      </div>

      {showJbShopBanner && <JbShopBanner productCategory={p.category} />}

      {needsArch && !needsGuard && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Arch *</label>
          <p className="text-xs text-[#6B6B6B] mb-3 leading-relaxed">
            Select which arch(es) this lab case covers. Price updates based on your selection.
          </p>
          <div className="flex flex-wrap gap-2">
            {ARCH_OPTIONS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => onChange("arch", a.value)}
                className={`px-4 h-9 rounded-lg text-sm border transition-all
                  ${data.arch === a.value
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {recordChecklistDef && (
        <RecordUploadChecklistPanel
          checklist={recordChecklistDef}
          checked={data.recordChecklist}
          onChange={onChecklistChange}
        />
      )}

      {needsTooth && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-3">Tooth chart *</label>
          <p className="text-sm text-[#6B6B6B] mb-3">Tap teeth on the chart. Quantity updates with your selection.</p>
          <div className="p-4 rounded-xl bg-white border border-[#E2E0D8]">
            <ToothSelector selected={data.toothNumbers} onChange={onTeethChange} />
          </div>
        </div>
      )}

      <div className="mb-5">
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Quantity</label>
        {needsTooth ? (
          <div className="rounded-xl border border-[#E2E0D8] bg-[#F8F7F4] px-4 py-3">
            <p className="text-2xl font-semibold text-[#1A1A1A]">{data.toothNumbers.length}</p>
            <p className="text-sm text-[#6B6B6B] mt-1">
              {data.toothNumbers.length === 0
                ? "Select teeth on the chart to set quantity."
                : data.toothNumbers.length === 1
                  ? "unit for 1 selected tooth"
                  : `units for ${data.toothNumbers.length} selected teeth`}
            </p>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button onClick={() => onChange("quantity", Math.max(1, data.quantity - 1))}
              className="w-9 h-9 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] font-semibold hover:bg-[#F8F7F4]">−</button>
            <span className="w-8 text-center font-semibold text-[#1A1A1A]">{data.quantity}</span>
            <button onClick={() => onChange("quantity", data.quantity + 1)}
              className="w-9 h-9 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] font-semibold hover:bg-[#F8F7F4]">+</button>
          </div>
        )}
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

      {/* Guard type + Arch */}
      {needsGuard && (
        <>
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
          <div className="mb-5">
            <label className="block text-sm font-medium text-[#1A1A1A] mb-2">Arch *</label>
            <div className="flex gap-2">
              {[
                { value: "upper", label: "Upper" },
                { value: "lower", label: "Lower" },
                { value: "both", label: "Both" },
              ].map((a) => (
                <button key={a.value} onClick={() => onChange("arch", a.value)}
                  className={`px-4 h-9 rounded-lg text-sm border transition-all
                    ${data.arch === a.value ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </>
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
        {recordChecklistDef && !checklistComplete && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2 leading-relaxed">
            Confirm every checklist item above before uploading — incomplete records may require a try-in visit.
          </p>
        )}
        <div onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const file = e.dataTransfer.files?.[0]; if (file) onFileChange(file); }}
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
        <input id="stl-input" type="file" accept=".stl" className="hidden"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) onFileChange(file); }} />
      </div>

      {/* Notes */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
          Notes <span className="text-[#9B9B9B] font-normal">(optional)</span>
        </label>
        <textarea value={data.notes} onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Any special instructions for the lab..." rows={3}
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
function Step3Rx({ data, onNext, onBack, onChange, flowStepLabel }: {
  data: OrderData;
  onNext: () => void;
  onBack: () => void;
  onChange: (k: keyof OrderData, v: string | boolean) => void;
  flowStepLabel?: string;
}) {
  const p = data.product!;
  const needsShade = p.fields.includes("shade");
  const needsTooth = p.fields.includes("toothNumber");
  const canProceed = data.dentistName.trim() && data.licenseNo.trim() && data.licenseState && data.authorized;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0F6E56] mb-2">
        {flowStepLabel ?? "Rx"}
      </p>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Prescription & authorization</h2>
      <p className="text-[#6B6B6B] mb-8">Complete the Rx so our technicians can release the case to production.</p>

      <div className="p-4 rounded-xl bg-white border border-[#E2E0D8] mb-6 space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] mb-2">Case summary</p>
        <div className="flex gap-6 text-sm">
          <div><span className="text-[#9B9B9B]">Product </span><span className="font-medium text-[#1A1A1A]">{p.name}</span></div>
          {needsTooth && data.toothNumbers.length > 0 && (
            <div>
              <span className="text-[#9B9B9B]">Tooth </span>
              <span className="font-medium text-[#1A1A1A]">
                {[...data.toothNumbers].sort((a, b) => a - b).map((n) => `#${n}`).join(", ")}
              </span>
            </div>
          )}
          {needsShade && data.shade && (
            <div><span className="text-[#9B9B9B]">Shade </span><span className="font-medium text-[#1A1A1A]">{data.shade}</span></div>
          )}
        </div>
      </div>

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

      <div className="space-y-3 mb-5">
        <div>
          <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Dentist name *</label>
          <input type="text" value={data.dentistName} onChange={(e) => onChange("dentistName", e.target.value)}
            placeholder="Dr. Jane Smith"
            className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">License # *</label>
            <input type="text" value={data.licenseNo} onChange={(e) => onChange("licenseNo", e.target.value)}
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

      <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all mb-8
        ${data.authorized ? "border-[#1A1A1A] bg-white" : "border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE]"}`}>
        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all
          ${data.authorized ? "bg-[#1A1A1A] border-[#1A1A1A]" : "bg-white border-[#C8C6BE]"}`}>
          {data.authorized && <span className="text-white text-xs">✓</span>}
        </div>
        <input type="checkbox" className="hidden" checked={data.authorized}
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

// ── Step 4 — Dentbird AI crown design ──────────────────────────────────────
function Step4Dentbird({ data, onBack, onNext, onDesignChange, onRetry }: {
  data: OrderData;
  onBack: () => void;
  onNext: () => void;
  onDesignChange: (patch: Partial<OrderData>) => void;
  onRetry: () => void;
}) {
  const p = data.product!;
  const requestStarted = useRef(false);

  useEffect(() => {
    if (requestStarted.current || !data.file || data.aiDesignStatus === "ready") return;
    requestStarted.current = true;

    async function runDesign() {
      onDesignChange({
        aiDesignStatus: "processing",
        aiDesignError: "",
        aiDesignApproved: false,
        aiDesignSummary: "",
        aiDesignedFileName: "",
      });

      try {
        const formData = new FormData();
        formData.append("stl", data.file!);
        formData.append("productCategory", p.category);
        formData.append("productName", p.name);
        formData.append("shade", data.shade);
        formData.append("toothNumbers", JSON.stringify(data.toothNumbers));
        formData.append("marginType", data.marginType);
        formData.append("occlusion", data.occlusion);

        const response = await fetch("/api/dentbird/design", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || "Dentbird design failed.");
        }

        onDesignChange({
          aiDesignStatus: "ready",
          aiDesignSummary: result.summary,
          aiDesignedFileName: result.designedFileName,
          aiDesignError: "",
        });
      } catch (error) {
        onDesignChange({
          aiDesignStatus: "failed",
          aiDesignError: error instanceof Error ? error.message : "Dentbird design failed.",
        });
      }
    }

    runDesign();
  }, [data.aiDesignStatus, data.file, data.marginType, data.occlusion, data.shade, data.toothNumbers, onDesignChange, p.category, p.name]);

  const teeth = data.toothNumbers.length
    ? [...data.toothNumbers].sort((a, b) => a - b).map((tooth) => `#${tooth}`).join(", ")
    : "—";

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">AI crown design review</h2>
      <p className="text-[#6B6B6B] mb-8">
        Dentbird generates a crown proposal from your scan. Approve it or request CAD design instead.
      </p>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] mb-6">
        <div className="rounded-xl border border-[#E2E0D8] bg-white overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] px-4 pt-4 pb-2">Your scan</p>
          <div className="mx-4 mb-4 aspect-[4/3] rounded-xl bg-gradient-to-br from-[#F8F7F4] to-[#E8E6DE] border border-dashed border-[#C8C6BE] flex flex-col items-center justify-center text-center px-4">
            <svg className="w-10 h-10 text-[#9B9B9B] mb-2" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p className="text-sm font-medium text-[#1A1A1A] break-all">{data.fileName || "No STL"}</p>
            <p className="text-[11px] text-[#9B9B9B] mt-1">Intraoral STL upload</p>
          </div>
          <div className="px-4 pb-4 space-y-1">
            <p className="text-xs text-[#9B9B9B]">Teeth: {teeth}</p>
            {data.shade && <p className="text-xs text-[#9B9B9B]">Shade: {data.shade}</p>}
            {data.marginType && <p className="text-xs text-[#9B9B9B]">Margin: {data.marginType}</p>}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center text-[#C8C6BE] text-2xl font-light">→</div>

        <div className="rounded-xl border border-[#E2E0D8] bg-white overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] px-4 pt-4 pb-2">Dentbird proposal</p>
          <div className="mx-4 mb-4 aspect-[4/3] rounded-xl bg-gradient-to-br from-[#F0F9FF] to-[#E1F5EE] border border-[#BFDBFE] flex flex-col items-center justify-center text-center px-4">
            {data.aiDesignStatus === "processing" && (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-[#378ADD] border-t-transparent animate-spin mb-3" />
                <p className="text-sm text-[#085041]">Generating crown design…</p>
              </>
            )}
            {data.aiDesignStatus === "failed" && (
              <>
                <p className="text-sm text-red-600">{data.aiDesignError || "Design failed."}</p>
                <button type="button" onClick={() => { requestStarted.current = false; onRetry(); }}
                  className="mt-3 text-sm font-medium text-[#2563EB] hover:underline">
                  Try again
                </button>
              </>
            )}
            {data.aiDesignStatus === "ready" && (
              <>
                <svg className="w-10 h-10 text-[#378ADD] mb-2" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
                <p className="text-sm font-medium text-[#1A1A1A] break-all">{data.aiDesignedFileName}</p>
                <p className="text-[11px] text-[#378ADD] mt-1">AI crown proposal ready</p>
              </>
            )}
            {data.aiDesignStatus === "idle" && (
              <p className="text-sm text-[#6B6B6B]">Waiting for design…</p>
            )}
          </div>
          {data.aiDesignStatus === "ready" && data.aiDesignSummary && (
            <div className="px-4 pb-4">
              <p className="text-sm text-[#4B4B4B] leading-relaxed">{data.aiDesignSummary}</p>
            </div>
          )}
        </div>
      </div>

      {data.aiDesignStatus === "ready" && (
        <p className="text-xs text-[#6B6B6B] bg-[#F8F7F4] border border-[#E2E0D8] rounded-lg px-3 py-2 mb-6 leading-relaxed">
          Interactive 3D preview is coming soon. For now, review the proposal summary and tooth parameters above before approving.
        </p>
      )}

      <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] mb-3">Design path</p>
      <div className="grid gap-3 mb-6">
        <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all
          ${data.designChoice === "ai" ? "border-[#1A1A1A] bg-white" : "border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE]"}`}>
          <input
            type="radio"
            name="designChoice"
            className="hidden"
            checked={data.designChoice === "ai"}
            onChange={() => onDesignChange({ designChoice: "ai", aiDesignApproved: false })}
          />
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all
            ${data.designChoice === "ai" ? "border-[#1A1A1A]" : "border-[#C8C6BE] bg-white"}`}>
            {data.designChoice === "ai" && <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">Approve the AI crown design</p>
            <p className="text-sm text-[#6B6B6B] mt-1 leading-relaxed">
              Continue with the Dentbird proposal. No additional design fee.
            </p>
          </div>
        </label>

        <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all
          ${data.designChoice === "cad" ? "border-[#1A1A1A] bg-white" : "border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE]"}`}>
          <input
            type="radio"
            name="designChoice"
            className="hidden"
            checked={data.designChoice === "cad"}
            onChange={() => onDesignChange({ designChoice: "cad", aiDesignApproved: false })}
          />
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all
            ${data.designChoice === "cad" ? "border-[#1A1A1A]" : "border-[#C8C6BE] bg-white"}`}>
            {data.designChoice === "cad" && <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">Request CAD design instead</p>
            <p className="text-sm text-[#6B6B6B] mt-1 leading-relaxed">
              If the AI proposal is not right for this case, our team will design the crown in CAD.
              A ${CAD_DESIGN_FEE} design fee is added at checkout.
            </p>
          </div>
        </label>
      </div>

      {data.designChoice === "ai" && (
        <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all mb-8
          ${data.aiDesignApproved ? "border-[#1A1A1A] bg-white" : "border-[#E2E0D8] bg-[#F8F7F4] hover:border-[#C8C6BE]"}`}>
          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all
            ${data.aiDesignApproved ? "bg-[#1A1A1A] border-[#1A1A1A]" : "bg-white border-[#C8C6BE]"}`}>
            {data.aiDesignApproved && <span className="text-white text-xs">✓</span>}
          </div>
          <input
            type="checkbox"
            className="hidden"
            checked={data.aiDesignApproved}
            disabled={data.aiDesignStatus !== "ready"}
            onChange={(e) => onDesignChange({ aiDesignApproved: e.target.checked })}
          />
          <p className="text-sm text-[#4B4B4B] leading-relaxed">
            I reviewed the Dentbird crown design and approve it for this case.
          </p>
        </label>
      )}

      {data.designChoice === "cad" && (
        <div className="rounded-xl border border-[#E2E0D8] bg-white p-4 mb-8">
          <p className="text-sm text-[#4B4B4B] leading-relaxed">
            CAD design will be prepared from your scan and Rx after checkout. The ${CAD_DESIGN_FEE} design fee
            appears on the review step before payment.
          </p>
        </div>
      )}

      {data.designChoice === "" && <div className="mb-8" />}

      <div className="flex gap-3">
        <Button variant="outline" className="h-12 px-6 rounded-xl border-[#E2E0D8] text-[#6B6B6B]" onClick={onBack}>Back</Button>
        <Button
          className="flex-1 h-12 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white rounded-xl text-base"
          disabled={
            data.designChoice === ""
            || (data.designChoice === "ai" && (data.aiDesignStatus !== "ready" || !data.aiDesignApproved))
            || (data.designChoice === "cad" && data.aiDesignStatus === "idle")
          }
          onClick={onNext}
        >
          Continue to review
        </Button>
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
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]" />
    </div>
  );
}

// ── Step 4 ─────────────────────────────────────────────────────────────────
function Step4({ data, onBack, onChange, onSubmit, submitting, equipmentBlock }: {
  data: OrderData;
  onBack: () => void;
  onChange: (k: keyof OrderData, v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  equipmentBlock?: string | null;
}) {
  const p = data.product!;
  const { subtotal, shipping, designFee, total } = getOrderPricing(data);
  const canSubmit = data.firstName && data.lastName && data.practiceName &&
    data.address && data.city && data.state && data.zip && data.phone && !equipmentBlock;

  return (
    <div>
      <h2 className="text-2xl font-bold text-[#1A1A1A] mb-1">Review & shipping</h2>
      <p className="text-[#6B6B6B] mb-8">Confirm your order and enter your shipping address.</p>

      {equipmentBlock && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <p className="font-medium mb-1">Starter kit required before checkout</p>
          <p className="leading-relaxed">{equipmentBlock}</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            {shopHrefForProductCategory(p.category) && (
              <Link
                href={shopHrefForProductCategory(p.category)!}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#0F6E56] px-5 text-sm font-medium text-white hover:bg-[#085041]"
              >
                Open Shop — order starter kit
              </Link>
            )}
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-amber-300 bg-white px-5 text-sm font-medium text-amber-950 hover:bg-amber-100/80"
            >
              Mark kit received
            </Link>
          </div>
        </div>
      )}

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
        {data.guardType && <p className="text-xs text-[#9B9B9B] ml-4 mb-1">Guard: {data.guardType} · Arch: {formatArchLabel(data.arch)}</p>}
        {data.arch && !data.guardType && (
          <p className="text-xs text-[#9B9B9B] ml-4 mb-1">Arch: {formatArchLabel(data.arch)}</p>
        )}
        {data.marginType && <p className="text-xs text-[#9B9B9B] ml-4 mb-1">Margin: {data.marginType} · Occlusion: {data.occlusion}</p>}
        <p className="text-xs text-[#9B9B9B] ml-4 mb-1">Rx: Dr. {data.dentistName} · #{data.licenseNo} ({data.licenseState})</p>
        {data.fileName && <p className="text-xs text-[#9B9B9B] ml-4 mb-1">Scan: {data.fileName}</p>}
        {data.designChoice === "cad" && (
          <p className="text-xs text-[#9B9B9B] ml-4 mb-3">CAD design requested</p>
        )}
        {data.designChoice === "ai" && data.aiDesignApproved && data.aiDesignedFileName && (
          <p className="text-xs text-[#9B9B9B] ml-4 mb-3">Dentbird design: {data.aiDesignedFileName}</p>
        )}
        {data.designChoice !== "cad" && !(data.aiDesignApproved && data.aiDesignedFileName) && data.fileName && (
          <div className="mb-3" />
        )}
        <div className="border-t border-[#F0EEE8] pt-3 space-y-1.5">
          {designFee > 0 && (
            <div className="flex justify-between text-sm text-[#6B6B6B]">
              <span>CAD design fee</span><span>${designFee}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-[#6B6B6B]">
            <span>Shipping ({SHIPPING_CARRIER})</span><span>${shipping}</span>
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
        <Field label="Phone *" placeholder="(555) 000-0000" value={data.phone} onChange={(v) => onChange("phone", v)} />
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

// ── Main Content ───────────────────────────────────────────────────────────
function OrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<OrderData>({
    product: null, quantity: 1, shade: "", toothNumbers: [],
    notes: "", file: null, fileName: "",
    firstName: "", lastName: "", practiceName: "",
    address: "", city: "", state: "", zip: "", phone: "",
    marginType: "", occlusion: "", guardType: "", color: "", arch: "",
    dentistName: "", licenseNo: "", licenseState: "", authorized: false,
    aiDesignStatus: "idle", aiDesignApproved: false, aiDesignSummary: "",
    aiDesignedFileName: "", aiDesignError: "", designChoice: "",
    recordChecklist: {},
  });
  const [labProducts, setLabProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [equipmentProfile, setEquipmentProfile] = useState<EquipmentProfile | null>(null);
  const [equipmentBanner, setEquipmentBanner] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [draftPrompt, setDraftPrompt] = useState<{
    savedAt: string;
    productName: string;
    needsStlReupload: boolean;
  } | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createAppClient();
    async function init() {
      const { user } = await getClientUser(supabase);
      if (!user) {
        const nextPath = `/order${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
        router.replace(`/auth?next=${encodeURIComponent(nextPath)}`);
        return;
      }
      setUserId(user.id);

      const { data: productData } = await supabase
        .from("products").select("*").eq("active", true).order("sort_order");
      const visibleProducts = prepareCatalogProducts(productData || []);
      setLabProducts(visibleProducts.filter((p: Product) => p.category !== "equipment"));
      setProductsLoading(false);

      const productId = searchParams.get("product");
      const resumeDraft = searchParams.get("resume") === "draft";
      const storedDraft = loadOrderDraft();

      const labOnly = visibleProducts.filter((p: Product) => p.category !== "equipment");
      let deepLinkProduct: Product | null = null;
      let draftProductForRestore: Product | null = null;
      let pendingDraftRestore: OrderDraftStored | null = null;

      const allLabProducts = (productData || []).filter(
        (p: Product) => p.category !== "equipment"
      );

      if (productId && allLabProducts.length) {
        const candidate = allLabProducts.find((p: Product) => p.id === productId);
        if (candidate) {
          const resolved = resolveActiveProductSelection(candidate, labOnly);
          deepLinkProduct = resolved.product;
          setData((prev) => ({
            ...prev,
            product: resolved.product,
            arch: resolved.arch || prev.arch,
          }));
        }
      } else if (storedDraft?.productId && allLabProducts.length) {
        const candidate = allLabProducts.find((p: Product) => p.id === storedDraft.productId);
        if (candidate) {
          const resolved = resolveActiveProductSelection(candidate, labOnly);
          if (resolved.product && storedDraft.step >= 2) {
            draftProductForRestore = resolved.product;
            if (resumeDraft) {
              setData((prev) => ({
                ...prev,
                ...draftFieldsFromStored(storedDraft, resolved.product),
                arch: storedDraft.arch || resolved.arch || prev.arch,
              }));
              pendingDraftRestore = storedDraft;
              setDraftRestored(true);
              if (storedDraft.fileName) {
                setDraftPrompt({
                  savedAt: storedDraft.savedAt,
                  productName: resolved.product.name,
                  needsStlReupload: true,
                });
              }
            } else {
              setDraftPrompt({
                savedAt: storedDraft.savedAt,
                productName: resolved.product.name,
                needsStlReupload: !!storedDraft.fileName,
              });
            }
          }
        }
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, practice_name, address, city, state, zip, phone, dentist_name, license_no, license_state")
        .eq("id", user.id)
        .maybeSingle();

      const { data: equipmentRow } = await supabase
        .from("profiles")
        .select("jb_tray_status, jb_fork_status, jb_tray_trained, jb_fork_trained")
        .eq("id", user.id)
        .maybeSingle();

      const equipProfile: EquipmentProfile | null = equipmentRow
        ? {
            jb_tray_status: equipmentRow.jb_tray_status,
            jb_fork_status: equipmentRow.jb_fork_status,
            jb_tray_trained: equipmentRow.jb_tray_trained,
            jb_fork_trained: equipmentRow.jb_fork_trained,
          }
        : null;

      if (equipProfile) setEquipmentProfile(equipProfile);

      if (deepLinkProduct) {
        const flow = buildOrderFlow(needsDentbirdDesign(deepLinkProduct));
        setStep(flowStepToIndex(flow, "case"));
      } else if (pendingDraftRestore && draftProductForRestore) {
        setStep(
          resolveDraftStepIndex(
            pendingDraftRestore.step,
            pendingDraftRestore.flowStep,
            draftProductForRestore,
            equipProfile,
            needsDentbirdDesign(draftProductForRestore)
          )
        );
      }

      if (profile) {
        setData((prev) => ({
          ...prev,
          firstName: profile.first_name || prev.firstName,
          lastName: profile.last_name || prev.lastName,
          practiceName: profile.practice_name || prev.practiceName,
          address: profile.address || prev.address,
          city: profile.city || prev.city,
          state: profile.state || prev.state,
          zip: profile.zip || prev.zip,
          phone: profile.phone || prev.phone,
          dentistName: profile.dentist_name || prev.dentistName,
          licenseNo: profile.license_no || prev.licenseNo,
          licenseState: profile.license_state || prev.licenseState,
        }));
      }

      setPageLoading(false);
    }
    init();
  }, [router, searchParams]);

  useEffect(() => {
    if (searchParams.get("equipment") === "ordered") {
      const kind = searchParams.get("kind");
      const label = kind === "jb_tray" ? "JB Tray" : kind === "jb_fork" ? "JB Fork" : "Equipment";
      setEquipmentBanner(
        `${label} order confirmed. You can continue preparing this case — submit payment after you mark the kit received on your dashboard.`
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (pageLoading) return;
    if (!data.product && step === 1) return;
    const timer = setTimeout(() => {
      const showAi = needsDentbirdDesign(data.product);
      const flow = buildOrderFlow(showAi);

      saveOrderDraft({
        step,
        flowStep: stepIndexToFlowStep(step, flow),
        product: data.product,
        quantity: data.quantity,
        shade: data.shade,
        toothNumbers: data.toothNumbers,
        notes: data.notes,
        fileName: data.fileName,
        firstName: data.firstName,
        lastName: data.lastName,
        practiceName: data.practiceName,
        address: data.address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        phone: data.phone,
        marginType: data.marginType,
        occlusion: data.occlusion,
        guardType: data.guardType,
        color: data.color,
        arch: data.arch,
        dentistName: data.dentistName,
        licenseNo: data.licenseNo,
        licenseState: data.licenseState,
        authorized: data.authorized,
        aiDesignStatus: data.aiDesignStatus,
        aiDesignApproved: data.aiDesignApproved,
        aiDesignSummary: data.aiDesignSummary,
        aiDesignedFileName: data.aiDesignedFileName,
        aiDesignError: data.aiDesignError,
        designChoice: data.designChoice,
        recordChecklist: data.recordChecklist,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [pageLoading, step, data, equipmentProfile]);

  function continueFromDraft() {
    const storedDraft = loadOrderDraft();
    if (!storedDraft?.productId) return;
    const found = labProducts.find((p) => p.id === storedDraft.productId);
    if (!found) return;
    setData((prev) => ({ ...prev, ...draftFieldsFromStored(storedDraft, found) }));
    setStep(
      resolveDraftStepIndex(
        storedDraft.step,
        storedDraft.flowStep,
        found,
        equipmentProfile,
        needsDentbirdDesign(found)
      )
    );
    setDraftRestored(true);
    setDraftPrompt(storedDraft.fileName ? {
      savedAt: storedDraft.savedAt,
      productName: found.name,
      needsStlReupload: true,
    } : null);
  }

  function discardDraft() {
    clearOrderDraft();
    setDraftPrompt(null);
    setDraftRestored(false);
  }

  function patchData(patch: Partial<OrderData>) {
    setData((prev) => ({ ...prev, ...patch }));
  }

  function resetAiDesign() {
    setData((prev) => ({
      ...prev,
      aiDesignStatus: "idle",
      aiDesignApproved: false,
      aiDesignSummary: "",
      aiDesignedFileName: "",
      aiDesignError: "",
      designChoice: "",
    }));
  }

  const showAiDesign = needsDentbirdDesign(data.product);
  const orderFlow = buildOrderFlow(showAiDesign);
  const activeFlowStep = stepIndexToFlowStep(step, orderFlow);
  const orderPricing = data.product ? getOrderPricing(data) : null;
  const flowStepLabel = activeFlowStep
    ? `Step ${step} of ${orderFlow.length} · ${ORDER_FLOW_STEP_LABELS[activeFlowStep]}`
    : undefined;

  const equipmentBlock = data.product ? equipmentBlockReason(data.product.category, equipmentProfile) : null;

  function goToFlowStep(target: OrderFlowStep) {
    setStep(flowStepToIndex(orderFlow, target));
  }

  function continueFromProduct() {
    if (!data.product) return;
    goToFlowStep("case");
  }

  function handleChecklistChange(itemId: string, value: boolean) {
    setData((prev) => ({
      ...prev,
      recordChecklist: { ...prev.recordChecklist, [itemId]: value },
    }));
  }

  function selectProduct(product: Product) {
    setData((prev) => ({
      ...prev,
      product,
      arch: "",
      recordChecklist: emptyRecordChecklistForCategory(product.category),
    }));
  }

  function update(key: keyof OrderData, value: string | number | boolean | number[]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(file: File) {
    setData((prev) => ({
      ...prev,
      file,
      fileName: file.name,
      aiDesignStatus: "idle",
      aiDesignApproved: false,
      aiDesignSummary: "",
      aiDesignedFileName: "",
      aiDesignError: "",
      designChoice: "",
    }));
  }

  async function handleSubmit() {
    if (!data.product || !data.file) return;
    if (!isOrderShippingComplete(data)) {
      goToFlowStep("review");
      alert("Please complete your practice name, phone, and shipping address on the review step.");
      return;
    }
    if (!canSubmitLabCase(data.product.category, equipmentProfile)) {
      alert(equipmentBlockReason(data.product.category, equipmentProfile) ?? "Complete equipment setup before submitting.");
      return;
    }
    if (needsDentbirdDesign(data.product)) {
      if (!data.designChoice) return;
      if (data.designChoice === "ai" && !data.aiDesignApproved) return;
    }
    setSubmitting(true);

    const supabase = createAppClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      const nextPath = `/order${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
      router.replace(`/auth?next=${encodeURIComponent(nextPath)}`);
      setSubmitting(false);
      return;
    }

    const p = data.product;
    const { total, unitPrice } = getOrderPricing(data);

    // 1. orders 저장
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        product_id: p.id,
        product_name: formatOrderProductName(p.name, data.arch),
        quantity: data.quantity,
        unit_price: unitPrice,
        total_price: total,
        shade: data.shade || null,
        tooth_number: data.toothNumbers[0]?.toString() || null,
        tooth_numbers: data.toothNumbers,
        notes: [
          data.notes,
          data.designChoice === "cad"
            ? `CAD design requested (+$${CAD_DESIGN_FEE} design fee)`
            : data.aiDesignApproved && data.aiDesignedFileName
              ? `Dentbird AI crown approved: ${data.aiDesignedFileName}`
              : null,
        ].filter(Boolean).join("\n") || null,
        status: "received",
        order_type: "lab_case",
      })
      .select().single();

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
        arch: data.arch || null,
        color: data.color || null,
        dentist_name: data.dentistName,
        dentist_license_no: data.licenseNo,
        license_state: data.licenseState,
        authorized: data.authorized,
        authorized_at: new Date().toISOString(),
        notes: data.notes || null,
      })
      .select().single();

    if (!rxError && rx) {
      await supabase.from("orders").update({ rx_id: rx.id }).eq("id", order.id);
    }

    // 3. STL 업로드
    const filePath = `${user.id}/${order.id}.stl`;
    const { error: uploadError } = await supabase.storage
      .from("stl-files").upload(filePath, data.file, { upsert: true });

    if (uploadError) {
      console.error("STL upload error:", uploadError);
      alert("STL file upload failed: " + uploadError.message);
      setSubmitting(false);
      return;
    }

    await supabase.from("orders").update({ stl_file_path: filePath }).eq("id", order.id);

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
      dentist_name: data.dentistName,
      license_no: data.licenseNo,
      license_state: data.licenseState,
    }).eq("id", user.id);

    // 5. Stripe checkout
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
    clearOrderDraft();
  }

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A1A] tracking-tight">New lab case</h1>
          <p className="text-sm text-[#6B6B6B] mt-1 max-w-2xl">
            Partial, guards, reline, and immediate cases go straight to scan upload. Complete &
            overdenture JB cases start with a starter kit from the shop.
          </p>
        </header>

        {draftPrompt && !draftRestored && (
          <div className="mb-6 rounded-xl border border-[#BFDBFE] bg-[#F0F9FF] px-4 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Resume your saved order?</p>
              <p className="text-xs text-[#6B6B6B] mt-1">
                {draftPrompt.productName} · saved {formatDraftSavedAt(draftPrompt.savedAt)}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" className="h-9 rounded-lg border-[#BFDBFE] text-[#6B6B6B]"
                onClick={discardDraft}>
                Discard
              </Button>
              <Button className="h-9 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
                onClick={continueFromDraft}>
                Continue
              </Button>
            </div>
          </div>
        )}
        {(draftPrompt?.needsStlReupload && draftRestored) && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-900">
              Re-upload your STL file on the Case details step to continue
              {data.fileName ? ` (previously: ${data.fileName})` : ""}.
            </p>
          </div>
        )}
        {equipmentBanner && (
          <div className="mb-6 rounded-xl border border-[#9FE1CB] bg-[#E1F5EE]/50 px-4 py-3 text-sm text-[#085041]">
            {equipmentBanner}
          </div>
        )}

        <OrderFlowMobileProgress
          step={step}
          orderFlow={orderFlow}
          activeFlowStep={activeFlowStep}
          productName={data.product?.name}
          total={orderPricing?.total}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
          <div className="hidden lg:block">
            <OrderFlowSidebar
              step={step}
              orderFlow={orderFlow}
              activeFlowStep={activeFlowStep}
              productCategory={data.product?.category ?? null}
              productName={data.product?.name ?? null}
              quantity={data.quantity}
              pricing={orderPricing}
              onGoToStep={goToFlowStep}
            />
          </div>

          <main className="min-w-0">
            <div className="rounded-2xl border border-[#E2E0D8] bg-white p-6 sm:p-8 shadow-sm">
              {step === flowStepToIndex(orderFlow, "product") && (
                productsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-sm text-[#9B9B9B]">Loading products...</p>
                  </div>
                ) : (
                  <Step1
                    products={labProducts}
                    selectedProduct={data.product}
                    onSelect={selectProduct}
                    onContinue={continueFromProduct}
                    flowStepLabel={flowStepLabel}
                  />
                )
              )}
              {step === flowStepToIndex(orderFlow, "case") && (
                <Step2 data={data} onChange={update} onFileChange={handleFileChange}
                  flowStepLabel={flowStepLabel}
                  showJbShopBanner={
                    !!data.product &&
                    isJbWorkflowCategory(data.product.category) &&
                    !canStartJbLabCase(data.product.category, equipmentProfile)
                  }
                  onChecklistChange={handleChecklistChange}
                  onTeethChange={(teeth) => {
                    setData((prev) => ({
                      ...prev,
                      toothNumbers: teeth,
                      quantity: teeth.length > 0 ? teeth.length : 1,
                    }));
                  }}
                  onBack={() => goToFlowStep("product")}
                  onNext={() => goToFlowStep("rx")} />
              )}
              {step === flowStepToIndex(orderFlow, "rx") && (
                <Step3Rx data={data} onChange={update}
                  flowStepLabel={flowStepLabel}
                  onBack={() => goToFlowStep("case")}
                  onNext={() => goToFlowStep(showAiDesign ? "ai" : "review")} />
              )}
              {step === flowStepToIndex(orderFlow, "ai") && showAiDesign && (
                <Step4Dentbird
                  data={data}
                  onBack={() => goToFlowStep("rx")}
                  onNext={() => goToFlowStep("review")}
                  onDesignChange={patchData}
                  onRetry={resetAiDesign}
                />
              )}
              {step === flowStepToIndex(orderFlow, "review") && !showAiDesign && (
                <Step4 data={data} onChange={(k, v) => update(k, v)}
                  onBack={() => goToFlowStep("rx")}
                  onSubmit={handleSubmit} submitting={submitting} equipmentBlock={equipmentBlock} />
              )}
              {step === flowStepToIndex(orderFlow, "review") && showAiDesign && (
                <Step4 data={data} onChange={(k, v) => update(k, v)}
                  onBack={() => goToFlowStep("ai")}
                  onSubmit={handleSubmit} submitting={submitting} equipmentBlock={equipmentBlock} />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

// ── Page Export ────────────────────────────────────────────────────────────
export default function OrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-sm text-[#9B9B9B]">Loading...</p>
      </div>
    }>
      <OrderContent />
    </Suspense>
  );
}