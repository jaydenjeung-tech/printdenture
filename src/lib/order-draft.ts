import type { OrderFlowStep } from "@/lib/equipment-requirements";

const DRAFT_KEY = "printdenture_order_draft_v1";

export type OrderDraftStored = {
  version: 1;
  savedAt: string;
  step: number;
  /** Semantic step name — survives when equipment step is added or removed. */
  flowStep?: OrderFlowStep;
  productId: string | null;
  quantity: number;
  shade: string;
  toothNumbers: number[];
  notes: string;
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
  recordChecklist?: Record<string, boolean>;
};

type DraftSource = {
  step: number;
  flowStep?: OrderFlowStep;
  product: { id: string } | null;
  quantity: number;
  shade: string;
  toothNumbers: number[];
  notes: string;
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
  aiDesignStatus: OrderDraftStored["aiDesignStatus"];
  aiDesignApproved: boolean;
  aiDesignSummary: string;
  aiDesignedFileName: string;
  aiDesignError: string;
  designChoice: OrderDraftStored["designChoice"];
  recordChecklist?: Record<string, boolean>;
};

export function saveOrderDraft(source: DraftSource) {
  if (typeof window === "undefined") return;
  const draft: OrderDraftStored = {
    version: 1,
    savedAt: new Date().toISOString(),
    step: source.step,
    flowStep: source.flowStep,
    productId: source.product?.id ?? null,
    quantity: source.quantity,
    shade: source.shade,
    toothNumbers: source.toothNumbers,
    notes: source.notes,
    fileName: source.fileName,
    firstName: source.firstName,
    lastName: source.lastName,
    practiceName: source.practiceName,
    address: source.address,
    city: source.city,
    state: source.state,
    zip: source.zip,
    phone: source.phone,
    marginType: source.marginType,
    occlusion: source.occlusion,
    guardType: source.guardType,
    color: source.color,
    arch: source.arch,
    dentistName: source.dentistName,
    licenseNo: source.licenseNo,
    licenseState: source.licenseState,
    authorized: source.authorized,
    aiDesignStatus: source.aiDesignStatus,
    aiDesignApproved: source.aiDesignApproved,
    aiDesignSummary: source.aiDesignSummary,
    aiDesignedFileName: source.aiDesignedFileName,
    aiDesignError: source.aiDesignError,
    designChoice: source.designChoice,
    recordChecklist: source.recordChecklist,
  };
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Ignore quota errors.
  }
}

export function loadOrderDraft(): OrderDraftStored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OrderDraftStored;
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearOrderDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function formatDraftSavedAt(iso: string) {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
