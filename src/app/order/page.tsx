"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createAppClient, getClientUser } from "@/lib/supabase";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  ORDER_BTN_BACK,
  ORDER_BTN_NAVY,
  ORDER_BTN_PRIMARY,
  ORDER_INPUT_CLASS,
  ORDER_LABEL_CLASS,
  ORDER_TEXTAREA_CLASS,
  OrderNoticeBanner,
  OrderPageHeader,
  OrderStepHeader,
  chipClass,
} from "@/components/marketing/order-ui";
import { LabPartnerNotice, LabPartnerLink } from "@/components/marketing/lab-partner";
import { LAB_PARTNER } from "@/lib/marketing/copy";
import { shopFamilyTabClass, shopVariantClass } from "@/components/marketing/shop-ui";
import { isOrderShippingComplete } from "@/lib/profile-requirements";
import { SHIPPING_FLAT_RATE, SHIPPING_LABEL } from "@/lib/shipping";
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
  ORDER_DENTURE_SERVICE_GROUPS,
  isCompleteServiceGroup,
} from "@/lib/products/denture-service-groups";
import { ORDER_FLOW_CATEGORIES } from "@/lib/products/site-catalog";
import { resolveOrderProductSelection } from "@/lib/products/order-product-link";
import { JbShopBanner } from "@/components/jb-shop-banner";
import { JbProtocolChooser } from "@/components/jb-protocol-chooser";
import { CaseFileUploadSection } from "@/components/case-file-upload";
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
  buildRecordChecklistSnapshot,
  emptyRecordChecklistForCategory,
  getRecordUploadChecklist,
  isRecordChecklistComplete,
  recommendedFileKindsForChecklist,
  requiredFileKindsForChecklist,
} from "@/lib/products/record-upload-checklist";
import {
  CASE_FILE_KIND_META,
  hasRequiredScan,
  primaryScanFile,
  type PendingCaseFile,
  type StoredCaseFile,
} from "@/lib/products/case-files";
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
  caseFiles: PendingCaseFile[];
  fileUploadError: string | null;
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
    caseFiles: [],
    fileUploadError: null,
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
    ? ORDER_DENTURE_SERVICE_GROUPS.map((group) => ({
        label: group.label,
        shortLabel: group.shortLabel,
        description: group.description,
        categories: [...group.categories],
      }))
    : [
        { label: "Crowns", shortLabel: "Crowns", description: "Zirconia, printed & implant crowns", categories: ["zirconia", "printed", "implant"] },
        { label: "Guards", shortLabel: "Guards", description: "Night guards & sports guards", categories: ["nightguard", "sportsguard"] },
      ];

function isOrderLabProduct(product: Product) {
  return ORDER_FLOW_CATEGORIES.includes(product.category);
}

function serviceGroupLabelFromParam(value: string | null): string | null {
  if (!value) return null;
  const match = ORDER_DENTURE_SERVICE_GROUPS.find((g) => g.id === value);
  return match?.label ?? null;
}

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
            ? "bg-[var(--pd-navy)] border-[var(--pd-navy)] text-white shadow-sm"
            : "bg-white border-[var(--pd-border)] text-[var(--pd-slate)] hover:border-[var(--pd-navy)]"}`}
      >
        <span className={`mb-0.5 h-1.5 w-3 rounded-sm ${isSelected ? "bg-white/35" : "bg-[var(--pd-border)]"}`} />
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
        <p className="mb-2 text-center text-xs font-medium text-[var(--pd-slate)]">{label}</p>
        <div className="-mx-1 overflow-x-auto px-1">
          <div className="mx-auto flex w-max items-center gap-2 px-1">
            <div className="flex gap-1">
              {rightTeeth.map((n) => <ToothBtn key={n} n={n} />)}
            </div>
            <div className="h-9 w-px shrink-0 bg-[var(--pd-border)]" aria-hidden="true" />
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
      <div className="flex justify-between px-1 text-xs text-[var(--pd-muted)]">
        <span>Patient right</span>
        <span>Patient left</span>
      </div>

      <ArchRow label="Upper" rightTeeth={UPPER_RIGHT} leftTeeth={UPPER_LEFT} />

      <div className="border-t border-dashed border-[var(--pd-border)]" />

      <ArchRow label="Lower" rightTeeth={LOWER_RIGHT} leftTeeth={LOWER_LEFT} />

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {[...selected].sort((a, b) => a - b).map((n) => (
            <span key={n} className="px-2 py-0.5 rounded-full bg-[var(--pd-navy)] text-white text-xs">#{n}</span>
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
      className={`border border-[#9FE1CB] bg-[#E1F5EE]/40 ${
        compact ? "px-3 py-2.5" : "px-4 py-3"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-semibold text-[var(--pd-teal-dark)] ${compact ? "text-xs" : "text-sm"}`}>
            {notice.title}
          </p>
          <p className={`text-[var(--pd-teal-dark)] leading-relaxed mt-1 ${compact ? "text-[11px]" : "text-xs"}`}>
            {notice.body}
          </p>
          <Link
            href="/shop"
            className={`inline-block mt-2 font-medium text-[var(--pd-teal-dark)] hover:underline ${
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
            className="shrink-0 w-7 h-7 rounded-full text-[var(--pd-teal-dark)] hover:bg-[#9FE1CB]/40 text-sm"
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
function Step1({ products, selectedProduct, onSelect, onContinue, flowStepLabel, preferredGroupLabel }: {
  products: Product[];
  selectedProduct: Product | null;
  onSelect: (p: Product) => void;
  onContinue: () => void;
  flowStepLabel?: string;
  preferredGroupLabel?: string | null;
}) {
  const groups = CATEGORY_GROUPS.map((g) => ({
    ...g,
    items: products.filter((p) => g.categories.includes(p.category)),
  }));
  const visibleGroups =
    CURRENT_SITE === "printdenture" ? groups : groups.filter((g) => g.items.length > 0);

  const [activeGroup, setActiveGroup] = useState(
    preferredGroupLabel && visibleGroups.some((g) => g.label === preferredGroupLabel)
      ? preferredGroupLabel
      : visibleGroups[0]?.label ?? ""
  );

  useEffect(() => {
    if (preferredGroupLabel && visibleGroups.some((g) => g.label === preferredGroupLabel)) {
      setActiveGroup(preferredGroupLabel);
    }
  }, [preferredGroupLabel, visibleGroups]);

  const lastSyncedProductId = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedProduct) {
      lastSyncedProductId.current = null;
      return;
    }
    if (lastSyncedProductId.current === selectedProduct.id) return;
    lastSyncedProductId.current = selectedProduct.id;
    const match = visibleGroups.find((group) =>
      group.items.some((product) => product.id === selectedProduct.id)
    );
    if (match) setActiveGroup(match.label);
  }, [selectedProduct, visibleGroups]);

  const currentGroup = visibleGroups.find((group) => group.label === activeGroup) ?? visibleGroups[0];

  function handleSelect(product: Product) {
    onSelect(product);
  }

  return (
    <div>
      <OrderStepHeader
        eyebrow={flowStepLabel ?? "Product"}
        title="What are you ordering?"
        lead="Pick the prosthesis and record protocol here. You will choose upper, lower, or both arches in case details."
      />

      {visibleGroups.length > 1 && (
        <div
          className={`grid gap-px bg-[var(--pd-border)] border border-[var(--pd-border)] mb-6 ${
            visibleGroups.length === 4
              ? "grid-cols-2 lg:grid-cols-4"
              : visibleGroups.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2"
          }`}
        >
          {visibleGroups.map((group) => {
            const active = group.label === activeGroup;
            return (
              <button
                key={group.label}
                type="button"
                onClick={() => setActiveGroup(group.label)}
                className={shopFamilyTabClass(active)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold leading-snug">{group.label}</span>
                  <span className={`text-[12px] shrink-0 ${active ? "text-white/75" : "text-[var(--pd-muted)]"}`}>
                    {group.items.length}
                  </span>
                </div>
                {"description" in group && group.description && (
                  <p className={`text-[12px] mt-1.5 leading-relaxed line-clamp-3 ${active ? "text-white/75" : "text-[var(--pd-muted)]"}`}>
                    {group.description}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="mb-8">
        {(currentGroup?.items ?? []).length === 0 ? (
          <div className="border border-dashed border-[var(--pd-border-strong)] bg-white px-5 py-8 text-center">
            <p className="text-[14px] font-medium text-[var(--pd-navy)]">No products in this category yet</p>
            <p className="text-[13px] text-[var(--pd-slate)] mt-2 leading-relaxed max-w-md mx-auto">
              {currentGroup?.label} products will appear here once they are active in the catalog.
              Contact support if you expected to see options.
            </p>
          </div>
        ) : (
          <div className="border border-[var(--pd-border)] divide-y divide-[var(--pd-border)]">
            {(currentGroup?.items ?? [])
              .sort((a, b) => {
                const order = currentGroup?.categories ?? [];
                return order.indexOf(a.category) - order.indexOf(b.category);
              })
              .map((product) => {
                const selected = selectedProduct?.id === product.id;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelect(product)}
                    aria-pressed={selected}
                    className={shopVariantClass(selected)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-0.5 self-stretch min-h-[3rem] shrink-0"
                        style={{ background: selected ? "var(--pd-teal)" : product.accent }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-[15px] font-semibold text-[var(--pd-navy)]">{product.name}</h3>
                            <p className="text-[13px] text-[var(--pd-slate)] mt-1 leading-relaxed">{product.description}</p>
                            {productRequiresEquipmentCheck(product.category) ? (
                              <p className="text-[12px] text-[var(--pd-muted)] mt-2 leading-relaxed">
                                {getEquipmentNoticeForCategory(product.category)?.equipmentLabel} starter kit
                                from PrintDenture — then capture records and submit this case.
                              </p>
                            ) : null}
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-semibold text-[var(--pd-navy)]">
                              {formatProductPriceHint(product)}
                            </p>
                            <p className="text-[12px] text-[var(--pd-muted)] mt-1">{product.turnaround}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        )}
      </div>

      {isCompleteServiceGroup(activeGroup) && (
        <section className="mb-8 pt-8 border-t border-[var(--pd-border)]">
          <JbProtocolChooser variant="compact" />
        </section>
      )}

      <div className="border border-[var(--pd-border)] bg-white p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-[var(--pd-muted)]">Selected product</p>
            <p className="text-sm font-semibold text-[var(--pd-navy)] mt-1">
              {selectedProduct ? selectedProduct.name : "Choose a product to continue"}
            </p>
            {selectedProduct && (
              <p className="text-xs text-[var(--pd-muted)] mt-1">
                ${selectedProduct.price} · {selectedProduct.turnaround}
              </p>
            )}
          </div>
          <button
            type="button"
            className={`${ORDER_BTN_NAVY} h-12 px-6 w-full sm:w-auto shrink-0`}
            disabled={!selectedProduct}
            onClick={onContinue}
          >
            Continue to case details
          </button>
        </div>
        {selectedProduct && productRequiresEquipmentCheck(selectedProduct.category) && (
          <div className="border border-amber-200 bg-amber-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-[12px] text-amber-950 leading-relaxed">
              {getEquipmentNoticeForCategory(selectedProduct.category)?.equipmentLabel} starter kit
              recommended — order from Shop, or continue to confirm your scan records on the next step.
            </p>
            {shopHrefForProductCategory(selectedProduct.category) && (
              <Link
                href={shopHrefForProductCategory(selectedProduct.category)!}
                className={`${ORDER_BTN_PRIMARY} h-9 px-4 text-[12px] shrink-0`}
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
function Step2({ data, onNext, onBack, onChange, onCaseFileAdd, onCaseFileRemove, onFileUploadError, onTeethChange, flowStepLabel, onChecklistChange, showJbShopBanner }: {
  data: OrderData;
  onNext: () => void;
  onBack: () => void;
  onChange: (k: keyof OrderData, v: string | number) => void;
  onCaseFileAdd: (file: PendingCaseFile) => void;
  onCaseFileRemove: (id: string) => void;
  onFileUploadError: (message: string | null) => void;
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
  const checklistContext = {
    files: data.caseFiles,
    shade: data.shade,
    acknowledgments: data.recordChecklist,
  };
  const checklistComplete = isRecordChecklistComplete(p.category, checklistContext);
  const requiredFileKinds = requiredFileKindsForChecklist(recordChecklistDef);
  const recommendedFileKinds = recommendedFileKindsForChecklist(recordChecklistDef);
  const linePrice = resolveLineItemPrice(p, data.arch);
  const shadeRequired = needsShade && !recordChecklistDef;
  const shadeSatisfied =
    !shadeRequired || !!data.shade || data.caseFiles.some((f) => f.kind === "photo");
  const canProceed = hasRequiredScan(data.caseFiles) &&
    checklistComplete &&
    shadeSatisfied &&
    (needsTooth ? data.toothNumbers.length > 0 : true) &&
    (needsGuard ? (data.guardType && data.arch) : true) &&
    (needsArch ? !!data.arch : true);

  return (
    <div>
      <OrderStepHeader
        eyebrow={flowStepLabel ?? "Case details"}
        title="Upload scans & preferences"
        lead="Send your scan files and case details — our lab handles denture design and fabrication."
      />

      <div className="flex items-center gap-3 p-4 border border-[var(--pd-border)] bg-white mb-6">
        <div className="w-0.5 h-8 shrink-0" style={{ background: p.accent }} />
        <div>
          <p className="font-semibold text-[var(--pd-navy)] text-sm">{p.name}</p>
          <p className="text-xs text-[var(--pd-muted)]">
            {data.arch ? `$${linePrice} · ${formatArchLabel(data.arch)}` : formatProductPriceHint(p)}
            {" · "}{p.turnaround}
          </p>
        </div>
      </div>

      {showJbShopBanner && <JbShopBanner productCategory={p.category} />}

      {needsArch && !needsGuard && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[var(--pd-navy)] mb-2">Arch *</label>
          <p className="text-xs text-[var(--pd-slate)] mb-3 leading-relaxed">
            Select which arch(es) this lab case covers. Price updates based on your selection.
          </p>
          <div className="flex flex-wrap gap-2">
            {ARCH_OPTIONS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => onChange("arch", a.value)}
                className={chipClass(data.arch === a.value, "px-4 h-9 text-sm")}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {needsTooth && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[var(--pd-navy)] mb-3">Tooth chart *</label>
          <p className="text-sm text-[var(--pd-slate)] mb-3">Tap teeth on the chart. Quantity updates with your selection.</p>
          <div className="p-4 border border-[var(--pd-border)] bg-white">
            <ToothSelector selected={data.toothNumbers} onChange={onTeethChange} />
          </div>
        </div>
      )}

      <div className="mb-5">
        <label className="block text-sm font-medium text-[var(--pd-navy)] mb-2">Quantity</label>
        {needsTooth ? (
          <div className="border border-[var(--pd-border)] bg-[var(--pd-surface)] px-4 py-3">
            <p className="text-2xl font-semibold text-[var(--pd-navy)]">{data.toothNumbers.length}</p>
            <p className="text-sm text-[var(--pd-slate)] mt-1">
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
              className="w-9 h-9 rounded-lg border border-[var(--pd-border)] bg-white text-[var(--pd-navy)] font-semibold hover:bg-[var(--pd-surface)]">−</button>
            <span className="w-8 text-center font-semibold text-[var(--pd-navy)]">{data.quantity}</span>
            <button onClick={() => onChange("quantity", data.quantity + 1)}
              className="w-9 h-9 rounded-lg border border-[var(--pd-border)] bg-white text-[var(--pd-navy)] font-semibold hover:bg-[var(--pd-surface)]">+</button>
          </div>
        )}
      </div>

      {/* Shade */}
      {needsShade && (
        <div className="mb-5">
          <label className="block text-sm font-medium text-[var(--pd-navy)] mb-2">Shade *</label>
          <div className="flex flex-wrap gap-2">
            {SHADES.map((s) => (
              <button key={s} onClick={() => onChange("shade", s)}
                className={chipClass(data.shade === s, "px-3 h-8 text-sm")}>
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
            <label className="block text-sm font-medium text-[var(--pd-navy)] mb-2">Guard type *</label>
            <div className="flex gap-2">
              {GUARD_TYPES.map((g) => (
                <button key={g} onClick={() => onChange("guardType", g)}
                  className={chipClass(data.guardType === g, "px-4 h-9 text-sm")}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-sm font-medium text-[var(--pd-navy)] mb-2">Arch *</label>
            <div className="flex gap-2">
              {[
                { value: "upper", label: "Upper" },
                { value: "lower", label: "Lower" },
                { value: "both", label: "Both" },
              ].map((a) => (
                <button key={a.value} onClick={() => onChange("arch", a.value)}
                  className={chipClass(data.arch === a.value, "px-4 h-9 text-sm")}>
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
          <label className="block text-sm font-medium text-[var(--pd-navy)] mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button key={c} onClick={() => onChange("color", c)}
                className={chipClass(data.color === c, "px-3 h-8 text-sm")}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <CaseFileUploadSection
        requiredKinds={requiredFileKinds}
        recommendedKinds={recommendedFileKinds}
        files={data.caseFiles}
        onAdd={onCaseFileAdd}
        onRemove={onCaseFileRemove}
        error={data.fileUploadError}
        onError={onFileUploadError}
      />

      {recordChecklistDef && (
        <RecordUploadChecklistPanel
          checklist={recordChecklistDef}
          context={checklistContext}
          onAcknowledgmentChange={onChecklistChange}
        />
      )}

      {recordChecklistDef && !checklistComplete && (
        <p className="text-[13px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 mb-5 leading-relaxed">
          Confirm the required checklist item to continue. Recommended uploads are optional but reduce try-in risk.
        </p>
      )}

      {/* Notes */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-[var(--pd-navy)] mb-2">
          Notes <span className="text-[var(--pd-muted)] font-normal">(optional)</span>
        </label>
        <textarea value={data.notes} onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Any special instructions for the lab..." rows={3}
          className={ORDER_TEXTAREA_CLASS} />
      </div>

      <div className="flex gap-3">
        <button type="button" className={`${ORDER_BTN_BACK} h-12 px-6`} onClick={onBack}>Back</button>
        <button
          type="button"
          className={`${ORDER_BTN_NAVY} flex-1 h-12 text-base`}
          disabled={!canProceed}
          onClick={onNext}
        >
          Continue
        </button>
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
      <OrderStepHeader
        eyebrow={flowStepLabel ?? "Rx"}
        title="Prescription & authorization"
        lead="Complete the Rx so our technicians can release the case to production."
      />

      <div className="flex items-center gap-3 p-4 border border-[var(--pd-border)] bg-white mb-6">
        <div className="w-0.5 h-8 shrink-0" style={{ background: p.accent }} />
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[14px]">
          <div>
            <span className="text-[var(--pd-muted)]">Product </span>
            <span className="font-medium text-[var(--pd-navy)]">{p.name}</span>
          </div>
          {needsTooth && data.toothNumbers.length > 0 && (
            <div>
              <span className="text-[var(--pd-muted)]">Tooth </span>
              <span className="font-medium text-[var(--pd-navy)]">
                {[...data.toothNumbers].sort((a, b) => a - b).map((n) => `#${n}`).join(", ")}
              </span>
            </div>
          )}
          {needsShade && data.shade && (
            <div>
              <span className="text-[var(--pd-muted)]">Shade </span>
              <span className="font-medium text-[var(--pd-navy)]">{data.shade}</span>
            </div>
          )}
        </div>
      </div>

      {needsTooth && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
          <div>
            <label className={ORDER_LABEL_CLASS}>Margin type</label>
            <div className="flex flex-col gap-px border border-[var(--pd-border)] bg-[var(--pd-border)]">
              {MARGIN_TYPES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => onChange("marginType", m)}
                  className={`h-10 text-[14px] border-0 px-3 text-left transition-colors ${
                    data.marginType === m
                      ? "bg-[var(--pd-navy)] text-white"
                      : "bg-white text-[var(--pd-slate)] hover:bg-[var(--pd-surface)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={ORDER_LABEL_CLASS}>Occlusion</label>
            <div className="flex flex-col gap-px border border-[var(--pd-border)] bg-[var(--pd-border)]">
              {OCCLUSIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => onChange("occlusion", o)}
                  className={`h-10 text-[14px] border-0 px-3 text-left transition-colors ${
                    data.occlusion === o
                      ? "bg-[var(--pd-navy)] text-white"
                      : "bg-white text-[var(--pd-slate)] hover:bg-[var(--pd-surface)]"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div>
          <label className={ORDER_LABEL_CLASS}>Dentist name *</label>
          <input
            type="text"
            value={data.dentistName}
            onChange={(e) => onChange("dentistName", e.target.value)}
            placeholder="Dr. Jane Smith"
            className={ORDER_INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className={ORDER_LABEL_CLASS}>License # *</label>
            <input
              type="text"
              value={data.licenseNo}
              onChange={(e) => onChange("licenseNo", e.target.value)}
              placeholder="D12345"
              className={ORDER_INPUT_CLASS}
            />
          </div>
          <div className="w-full sm:w-28">
            <label className={ORDER_LABEL_CLASS}>State *</label>
            <select
              value={data.licenseState}
              onChange={(e) => onChange("licenseState", e.target.value)}
              className={ORDER_INPUT_CLASS}
            >
              <option value="">—</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <label
        className={`flex gap-3 p-4 border cursor-pointer transition-colors mb-8 ${
          data.authorized
            ? "border-[var(--pd-teal)] bg-[#E1F5EE]/30 ring-1 ring-[var(--pd-teal)]/20"
            : "border-[var(--pd-border)] bg-[var(--pd-surface)] hover:border-[var(--pd-navy)]/30"
        }`}
      >
        <div
          className={`w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
            data.authorized
              ? "bg-[var(--pd-navy)] border-[var(--pd-navy)]"
              : "bg-white border-[var(--pd-border)]"
          }`}
        >
          {data.authorized && <span className="text-white text-xs leading-none">✓</span>}
        </div>
        <input
          type="checkbox"
          className="hidden"
          checked={data.authorized}
          onChange={(e) => onChange("authorized", e.target.checked)}
        />
        <p className="text-[14px] text-[var(--pd-slate)] leading-relaxed">
          I, <strong className="font-medium text-[var(--pd-navy)]">{data.dentistName || "the undersigned dentist"}</strong>, License #{data.licenseNo || "___"} ({data.licenseState || "State"}),
          hereby authorize the fabrication of the dental restoration described above in accordance with this prescription.
          This constitutes my electronic signature under the E-SIGN Act.
        </p>
      </label>

      <div className="flex gap-3">
        <button type="button" className={`${ORDER_BTN_BACK} h-12 px-6`} onClick={onBack}>Back</button>
        <button
          type="button"
          className={`${ORDER_BTN_NAVY} flex-1 h-12 text-base`}
          disabled={!canProceed}
          onClick={onNext}
        >
          Continue
        </button>
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
      <h2 className="text-2xl font-bold text-[var(--pd-navy)] mb-1">AI crown design review</h2>
      <p className="text-[var(--pd-slate)] mb-8">
        Dentbird generates a crown proposal from your scan. Approve it or request CAD design instead.
      </p>

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] mb-6">
        <div className="border border-[var(--pd-border)] bg-white overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--pd-muted)] px-4 pt-4 pb-2">Your scan</p>
          <div className="mx-4 mb-4 aspect-[4/3] rounded-xl bg-gradient-to-br from-[#F8F7F4] to-[#E8E6DE] border border-dashed border-[#C8C6BE] flex flex-col items-center justify-center text-center px-4">
            <svg className="w-10 h-10 text-[var(--pd-muted)] mb-2" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
            <p className="text-sm font-medium text-[var(--pd-navy)] break-all">{data.fileName || "No STL"}</p>
            <p className="text-[11px] text-[var(--pd-muted)] mt-1">Intraoral STL upload</p>
          </div>
          <div className="px-4 pb-4 space-y-1">
            <p className="text-xs text-[var(--pd-muted)]">Teeth: {teeth}</p>
            {data.shade && <p className="text-xs text-[var(--pd-muted)]">Shade: {data.shade}</p>}
            {data.marginType && <p className="text-xs text-[var(--pd-muted)]">Margin: {data.marginType}</p>}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center text-[#C8C6BE] text-2xl font-light">→</div>

        <div className="border border-[var(--pd-border)] bg-white overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--pd-muted)] px-4 pt-4 pb-2">Dentbird proposal</p>
          <div className="mx-4 mb-4 aspect-[4/3] rounded-xl bg-gradient-to-br from-[#F0F9FF] to-[#E1F5EE] border border-[#BFDBFE] flex flex-col items-center justify-center text-center px-4">
            {data.aiDesignStatus === "processing" && (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-[#378ADD] border-t-transparent animate-spin mb-3" />
                <p className="text-sm text-[var(--pd-teal-dark)]">Generating crown design…</p>
              </>
            )}
            {data.aiDesignStatus === "failed" && (
              <>
                <p className="text-sm text-red-600">{data.aiDesignError || "Design failed."}</p>
                <button type="button" onClick={() => { requestStarted.current = false; onRetry(); }}
                  className="mt-3 text-sm font-medium text-[var(--pd-teal)] hover:underline">
                  Try again
                </button>
              </>
            )}
            {data.aiDesignStatus === "ready" && (
              <>
                <svg className="w-10 h-10 text-[#378ADD] mb-2" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/>
                </svg>
                <p className="text-sm font-medium text-[var(--pd-navy)] break-all">{data.aiDesignedFileName}</p>
                <p className="text-[11px] text-[#378ADD] mt-1">AI crown proposal ready</p>
              </>
            )}
            {data.aiDesignStatus === "idle" && (
              <p className="text-sm text-[var(--pd-slate)]">Waiting for design…</p>
            )}
          </div>
          {data.aiDesignStatus === "ready" && data.aiDesignSummary && (
            <div className="px-4 pb-4">
              <p className="text-sm text-[var(--pd-slate)] leading-relaxed">{data.aiDesignSummary}</p>
            </div>
          )}
        </div>
      </div>

      {data.aiDesignStatus === "ready" && (
        <p className="text-xs text-[var(--pd-slate)] bg-[var(--pd-surface)] border border-[var(--pd-border)] rounded-lg px-3 py-2 mb-6 leading-relaxed">
          Interactive 3D preview is coming soon. For now, review the proposal summary and tooth parameters above before approving.
        </p>
      )}

      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--pd-muted)] mb-3">Design path</p>
      <div className="grid gap-3 mb-6">
        <label className={`flex gap-3 p-4 border cursor-pointer transition-colors
          ${data.designChoice === "ai" ? "border-[var(--pd-navy)] bg-white" : "border-[var(--pd-border)] bg-[var(--pd-surface)] hover:border-[#C8C6BE]"}`}>
          <input
            type="radio"
            name="designChoice"
            className="hidden"
            checked={data.designChoice === "ai"}
            onChange={() => onDesignChange({ designChoice: "ai", aiDesignApproved: false })}
          />
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all
            ${data.designChoice === "ai" ? "border-[var(--pd-navy)]" : "border-[#C8C6BE] bg-white"}`}>
            {data.designChoice === "ai" && <span className="w-2.5 h-2.5 rounded-full bg-[var(--pd-navy)]" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--pd-navy)]">Approve the AI crown design</p>
            <p className="text-sm text-[var(--pd-slate)] mt-1 leading-relaxed">
              Continue with the Dentbird proposal. No additional design fee.
            </p>
          </div>
        </label>

        <label className={`flex gap-3 p-4 border cursor-pointer transition-colors
          ${data.designChoice === "cad" ? "border-[var(--pd-navy)] bg-white" : "border-[var(--pd-border)] bg-[var(--pd-surface)] hover:border-[#C8C6BE]"}`}>
          <input
            type="radio"
            name="designChoice"
            className="hidden"
            checked={data.designChoice === "cad"}
            onChange={() => onDesignChange({ designChoice: "cad", aiDesignApproved: false })}
          />
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all
            ${data.designChoice === "cad" ? "border-[var(--pd-navy)]" : "border-[#C8C6BE] bg-white"}`}>
            {data.designChoice === "cad" && <span className="w-2.5 h-2.5 rounded-full bg-[var(--pd-navy)]" />}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--pd-navy)]">Request CAD design instead</p>
            <p className="text-sm text-[var(--pd-slate)] mt-1 leading-relaxed">
              If the AI proposal is not right for this case, our team will design the crown in CAD.
              A ${CAD_DESIGN_FEE} design fee is added at checkout.
            </p>
          </div>
        </label>
      </div>

      {data.designChoice === "ai" && (
        <label className={`flex gap-3 p-4 border cursor-pointer transition-colors mb-8
          ${data.aiDesignApproved ? "border-[var(--pd-navy)] bg-white" : "border-[var(--pd-border)] bg-[var(--pd-surface)] hover:border-[#C8C6BE]"}`}>
          <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border transition-all
            ${data.aiDesignApproved ? "bg-[var(--pd-navy)] border-[var(--pd-navy)]" : "bg-white border-[#C8C6BE]"}`}>
            {data.aiDesignApproved && <span className="text-white text-xs">✓</span>}
          </div>
          <input
            type="checkbox"
            className="hidden"
            checked={data.aiDesignApproved}
            disabled={data.aiDesignStatus !== "ready"}
            onChange={(e) => onDesignChange({ aiDesignApproved: e.target.checked })}
          />
          <p className="text-sm text-[var(--pd-slate)] leading-relaxed">
            I reviewed the Dentbird crown design and approve it for this case.
          </p>
        </label>
      )}

      {data.designChoice === "cad" && (
        <div className="border border-[var(--pd-border)] bg-white p-4 mb-8">
          <p className="text-sm text-[var(--pd-slate)] leading-relaxed">
            CAD design will be prepared from your scan and Rx after checkout. The ${CAD_DESIGN_FEE} design fee
            appears on the review step before payment.
          </p>
        </div>
      )}

      {data.designChoice === "" && <div className="mb-8" />}

      <div className="flex gap-3">
        <button type="button" className={`${ORDER_BTN_BACK} h-12 px-6`} onClick={onBack}>Back</button>
        <button
          type="button"
          className={`${ORDER_BTN_NAVY} flex-1 h-12 text-base`}
          disabled={
            data.designChoice === ""
            || (data.designChoice === "ai" && (data.aiDesignStatus !== "ready" || !data.aiDesignApproved))
            || (data.designChoice === "cad" && data.aiDesignStatus === "idle")
          }
          onClick={onNext}
        >
          Continue to review
        </button>
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
      <label className={ORDER_LABEL_CLASS}>{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={ORDER_INPUT_CLASS} />
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
      <h2 className="text-2xl font-bold text-[var(--pd-navy)] mb-1">Review & shipping</h2>
      <p className="text-[var(--pd-slate)] mb-8">Confirm your order and enter your shipping address.</p>

      {equipmentBlock && (
        <div className="mb-6 border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
          <p className="font-medium mb-1">Starter kit required before checkout</p>
          <p className="leading-relaxed">{equipmentBlock}</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            {shopHrefForProductCategory(p.category) && (
              <Link
                href={shopHrefForProductCategory(p.category)!}
                className={`${ORDER_BTN_PRIMARY} h-10 px-5 text-sm`}
              >
                Open Shop — order starter kit
              </Link>
            )}
            <Link
              href="/dashboard"
              className={`${ORDER_BTN_BACK} h-10 px-5 text-sm text-amber-950 border-amber-300 hover:bg-amber-100/80`}
            >
              Mark kit received
            </Link>
          </div>
        </div>
      )}

      <LabPartnerNotice />

      <div className="p-5 border border-[var(--pd-border)] bg-white mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--pd-muted)] mb-4">Order summary</p>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-5 rounded-full" style={{ background: p.accent }} />
            <span className="text-sm text-[var(--pd-navy)]">{p.name} × {data.quantity}</span>
          </div>
          <span className="text-sm font-medium text-[var(--pd-navy)]">${subtotal}</span>
        </div>
        {data.shade && (
          <p className="text-xs text-[var(--pd-muted)] ml-4 mb-1">
            Shade: {data.shade}
            {data.toothNumbers.length > 0 && ` · Tooth ${[...data.toothNumbers].sort((a,b)=>a-b).map(n=>`#${n}`).join(", ")}`}
          </p>
        )}
        {data.guardType && <p className="text-xs text-[var(--pd-muted)] ml-4 mb-1">Guard: {data.guardType} · Arch: {formatArchLabel(data.arch)}</p>}
        {data.arch && !data.guardType && (
          <p className="text-xs text-[var(--pd-muted)] ml-4 mb-1">Arch: {formatArchLabel(data.arch)}</p>
        )}
        {data.marginType && <p className="text-xs text-[var(--pd-muted)] ml-4 mb-1">Margin: {data.marginType} · Occlusion: {data.occlusion}</p>}
        <p className="text-xs text-[var(--pd-muted)] ml-4 mb-1">Rx: Dr. {data.dentistName} · #{data.licenseNo} ({data.licenseState})</p>
        {data.caseFiles.length > 0 && (
          <div className="text-xs text-[var(--pd-muted)] ml-4 mb-1 space-y-0.5">
            {data.caseFiles.map((f) => (
              <p key={f.id}>
                {CASE_FILE_KIND_META[f.kind].label}: {f.fileName}
              </p>
            ))}
          </div>
        )}
        {!data.caseFiles.length && data.fileName && (
          <p className="text-xs text-[var(--pd-muted)] ml-4 mb-1">Scan: {data.fileName}</p>
        )}
        {data.designChoice === "cad" && (
          <p className="text-xs text-[var(--pd-muted)] ml-4 mb-3">CAD design requested</p>
        )}
        {data.designChoice === "ai" && data.aiDesignApproved && data.aiDesignedFileName && (
          <p className="text-xs text-[var(--pd-muted)] ml-4 mb-3">Dentbird design: {data.aiDesignedFileName}</p>
        )}
        {data.designChoice !== "cad" && !(data.aiDesignApproved && data.aiDesignedFileName) && data.fileName && (
          <div className="mb-3" />
        )}
        <div className="border-t border-[#F0EEE8] pt-3 space-y-1.5">
          {designFee > 0 && (
            <div className="flex justify-between text-sm text-[var(--pd-slate)]">
              <span>CAD design fee</span><span>${designFee}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-[var(--pd-slate)]">
            <span>Shipping ({SHIPPING_LABEL})</span><span>${shipping}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-[var(--pd-navy)]">
            <span>Total</span><span>${total}</span>
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--pd-muted)] mb-4">Shipping address</p>
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
            <label className="block text-sm font-medium text-[var(--pd-navy)] mb-1.5">State</label>
            <select value={data.state} onChange={(e) => onChange("state", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-[var(--pd-border)] bg-white text-[var(--pd-navy)] text-sm focus:outline-none focus:border-[var(--pd-navy)]">
              <option value="">State</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Field label="ZIP" placeholder="90001" half value={data.zip} onChange={(v) => onChange("zip", v)} />
        </div>
        <Field label="Phone *" placeholder="(555) 000-0000" value={data.phone} onChange={(v) => onChange("phone", v)} />
      </div>

      <div className="flex gap-3">
        <button type="button" className={`${ORDER_BTN_BACK} h-12 px-6`} onClick={onBack}>Back</button>
        <button
          type="button"
          className={`${ORDER_BTN_PRIMARY} flex-1 h-12 text-base font-semibold`}
          disabled={!canSubmit || submitting}
          onClick={onSubmit}
        >
          {submitting ? "Placing order..." : `Place order · $${total}`}
        </button>
      </div>
      <p className="text-xs text-center text-[var(--pd-muted)] mt-4">
        Secure checkout · HIPAA compliant · Cases fulfilled by{" "}
        <LabPartnerLink className="text-[var(--pd-muted)] hover:text-[var(--pd-teal-dark)]">
          {LAB_PARTNER.name}
        </LabPartnerLink>
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
    notes: "", file: null, fileName: "", caseFiles: [], fileUploadError: null,
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
    needsFileReupload: boolean;
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
      const labOnly = visibleProducts.filter(isOrderLabProduct);
      const visibleLab = visibleProducts.filter((p) => p.category !== "equipment");
      setLabProducts(labOnly);
      setProductsLoading(false);

      const productId = searchParams.get("product");
      const reorderId = searchParams.get("reorder");
      const resumeDraft = searchParams.get("resume") === "draft";
      const storedDraft = loadOrderDraft();

      let linkedProduct: { product: Product; arch: string } | null = null;
      let draftProductForRestore: Product | null = null;
      let pendingDraftRestore: OrderDraftStored | null = null;

      if (productId) {
        linkedProduct = resolveOrderProductSelection(productId, labOnly, visibleLab);
      } else if (reorderId) {
        const { data: prevOrder } = await supabase
          .from("orders")
          .select("id, product_id, quantity, shade, tooth_numbers")
          .eq("id", reorderId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (prevOrder?.product_id) {
          linkedProduct = resolveOrderProductSelection(prevOrder.product_id, labOnly, visibleLab);
          if (linkedProduct) {
            const { data: prevRx } = await supabase
              .from("rx")
              .select("arch, guard_type, color, margin_type, occlusion")
              .eq("order_id", prevOrder.id)
              .maybeSingle();

            setData((prev) => ({
              ...prev,
              product: linkedProduct!.product,
              arch: prevRx?.arch || linkedProduct!.arch || prev.arch,
              quantity: prevOrder.quantity || prev.quantity,
              shade: prevOrder.shade || prev.shade,
              toothNumbers: prevOrder.tooth_numbers || prev.toothNumbers,
              guardType: prevRx?.guard_type || prev.guardType,
              color: prevRx?.color || prev.color,
              marginType: prevRx?.margin_type || prev.marginType,
              occlusion: prevRx?.occlusion || prev.occlusion,
              caseFiles: [],
              file: null,
              fileName: "",
              notes: "",
              recordChecklist: emptyRecordChecklistForCategory(linkedProduct!.product.category),
            }));
          }
        }
      }

      if (linkedProduct && !reorderId) {
        setData((prev) => ({
          ...prev,
          product: linkedProduct!.product,
          arch: linkedProduct!.arch || prev.arch,
          recordChecklist: emptyRecordChecklistForCategory(linkedProduct!.product.category),
        }));
      } else if (!reorderId && storedDraft?.productId) {
        const resolved = resolveOrderProductSelection(storedDraft.productId, labOnly, visibleLab);
        if (resolved?.product && storedDraft.step >= 2) {
          draftProductForRestore = resolved.product;
          if (resumeDraft) {
            setData((prev) => ({
              ...prev,
              ...draftFieldsFromStored(storedDraft, resolved.product),
              arch: storedDraft.arch || resolved.arch || prev.arch,
            }));
            pendingDraftRestore = storedDraft;
            setDraftRestored(true);
            if (storedDraft.fileName || (storedDraft.caseFilesMeta?.length ?? 0) > 0) {
              setDraftPrompt({
                savedAt: storedDraft.savedAt,
                productName: resolved.product.name,
                needsFileReupload: true,
              });
            }
          } else {
            setDraftPrompt({
              savedAt: storedDraft.savedAt,
              productName: resolved.product.name,
              needsFileReupload: !!storedDraft.fileName || (storedDraft.caseFilesMeta?.length ?? 0) > 0,
            });
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

      if (pendingDraftRestore && draftProductForRestore) {
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
        caseFilesMeta: data.caseFiles.map((f) => ({
          id: f.id,
          kind: f.kind,
          fileName: f.fileName,
        })),
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [pageLoading, step, data, equipmentProfile]);

  function continueFromDraft() {
    const storedDraft = loadOrderDraft();
    if (!storedDraft?.productId) return;
    const found =
      labProducts.find((p) => p.id === storedDraft.productId) ??
      resolveOrderProductSelection(storedDraft.productId, labProducts, labProducts)?.product;
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
    setDraftPrompt(storedDraft.fileName || (storedDraft.caseFilesMeta?.length ?? 0) > 0 ? {
      savedAt: storedDraft.savedAt,
      productName: found.name,
      needsFileReupload: true,
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
      caseFiles: [],
      fileUploadError: null,
      file: null,
      fileName: "",
      recordChecklist: emptyRecordChecklistForCategory(product.category),
    }));
  }

  function update(key: keyof OrderData, value: string | number | boolean | number[]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  function syncPrimaryScan(files: PendingCaseFile[]) {
    const scan = primaryScanFile(files);
    return {
      file: scan?.file ?? null,
      fileName: scan?.fileName ?? "",
    };
  }

  function handleCaseFileAdd(pending: PendingCaseFile) {
    setData((prev) => {
      const caseFiles = [...prev.caseFiles, pending];
      return {
        ...prev,
        caseFiles,
        fileUploadError: null,
        ...syncPrimaryScan(caseFiles),
        aiDesignStatus: "idle",
        aiDesignApproved: false,
        aiDesignSummary: "",
        aiDesignedFileName: "",
        aiDesignError: "",
        designChoice: "",
      };
    });
  }

  function handleCaseFileRemove(id: string) {
    setData((prev) => {
      const caseFiles = prev.caseFiles.filter((f) => f.id !== id);
      return {
        ...prev,
        caseFiles,
        ...syncPrimaryScan(caseFiles),
        aiDesignStatus: "idle",
        aiDesignApproved: false,
        aiDesignSummary: "",
        aiDesignedFileName: "",
        aiDesignError: "",
        designChoice: "",
      };
    });
  }

  async function handleSubmit() {
    if (!data.product || !hasRequiredScan(data.caseFiles)) return;
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
    const checklistContext = {
      files: data.caseFiles,
      shade: data.shade,
      acknowledgments: data.recordChecklist,
    };
    const recordChecklist = buildRecordChecklistSnapshot(p.category, checklistContext);

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
        record_checklist: recordChecklist,
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

    // 3. Case files 업로드
    const uploadedFiles: StoredCaseFile[] = [];
    let primaryScanPath: string | null = null;

    for (const pending of data.caseFiles) {
      const ext = pending.fileName.includes(".")
        ? pending.fileName.split(".").pop()?.toLowerCase() ?? "bin"
        : "bin";
      const storagePath = `${user.id}/${order.id}/${pending.kind}/${pending.id}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("stl-files")
        .upload(storagePath, pending.file, { upsert: true });

      if (uploadError) {
        console.error("Case file upload error:", uploadError);
        alert(`File upload failed (${pending.fileName}): ${uploadError.message}`);
        setSubmitting(false);
        return;
      }

      uploadedFiles.push({
        kind: pending.kind,
        path: storagePath,
        fileName: pending.fileName,
      });
      if (pending.kind === "scan" && !primaryScanPath) {
        primaryScanPath = storagePath;
      }
    }

    await supabase.from("orders").update({
      stl_file_path: primaryScanPath,
      case_files: uploadedFiles,
    }).eq("id", order.id);

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
      <MarketingShell>
        <div className="min-h-[50vh] flex items-center justify-center">
          <p className="text-[14px] text-[var(--pd-muted)]">Loading order flow…</p>
        </div>
      </MarketingShell>
    );
  }

  return (
    <MarketingShell>
      <OrderPageHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 pb-16">
        {draftPrompt && !draftRestored && (
          <OrderNoticeBanner
            variant="info"
            actions={
              <>
                <button type="button" className={`${ORDER_BTN_BACK} h-9 px-4 text-[13px]`} onClick={discardDraft}>
                  Discard
                </button>
                <button type="button" className={`${ORDER_BTN_PRIMARY} h-9 px-4 text-[13px]`} onClick={continueFromDraft}>
                  Continue
                </button>
              </>
            }
          >
            <p className="font-medium">Resume your saved order?</p>
            <p className="text-[12px] text-[var(--pd-slate)] mt-1">
              {draftPrompt.productName} · saved {formatDraftSavedAt(draftPrompt.savedAt)}
            </p>
          </OrderNoticeBanner>
        )}
        {draftPrompt?.needsFileReupload && draftRestored && (
          <OrderNoticeBanner variant="amber">
            Re-upload your case files on the Case details step to continue
            {data.fileName ? ` (previously: ${data.fileName})` : ""}.
          </OrderNoticeBanner>
        )}
        {equipmentBanner && (
          <OrderNoticeBanner variant="teal">{equipmentBanner}</OrderNoticeBanner>
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
            <div className="border border-[var(--pd-border)] bg-white p-6 sm:p-8">
              {step === flowStepToIndex(orderFlow, "product") && (
                productsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-sm text-[var(--pd-muted)]">Loading products...</p>
                  </div>
                ) : (
                  <Step1
                    products={labProducts}
                    selectedProduct={data.product}
                    onSelect={selectProduct}
                    onContinue={continueFromProduct}
                    flowStepLabel={flowStepLabel}
                    preferredGroupLabel={serviceGroupLabelFromParam(searchParams.get("group"))}
                  />
                )
              )}
              {step === flowStepToIndex(orderFlow, "case") && (
                <Step2 data={data} onChange={update}
                  onCaseFileAdd={handleCaseFileAdd}
                  onCaseFileRemove={handleCaseFileRemove}
                  onFileUploadError={(message) => setData((prev) => ({ ...prev, fileUploadError: message }))}
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
    </MarketingShell>
  );
}

// ── Page Export ────────────────────────────────────────────────────────────
export default function OrderPage() {
  return (
    <Suspense
      fallback={
        <MarketingShell>
          <div className="min-h-[50vh] flex items-center justify-center">
            <p className="text-[14px] text-[var(--pd-muted)]">Loading order flow…</p>
          </div>
        </MarketingShell>
      }
    >
      <OrderContent />
    </Suspense>
  );
}