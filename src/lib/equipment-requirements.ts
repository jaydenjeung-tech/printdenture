/**
 * JB Tray / JB Fork equipment readiness for PrintDenture lab-case orders.
 */

export type EquipmentKind = "jb_tray" | "jb_fork";
export type EquipmentStatus = "have" | "need" | "ordered";

export type EquipmentProfile = {
  jb_tray_status?: EquipmentStatus | string | null;
  jb_fork_status?: EquipmentStatus | string | null;
  jb_tray_trained?: boolean | null;
  jb_fork_trained?: boolean | null;
};

export type EquipmentCheckState = {
  jb_tray_status: EquipmentStatus;
  jb_fork_status: EquipmentStatus;
  jb_tray_trained: boolean;
  jb_fork_trained: boolean;
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  have: "In practice",
  need: "Need to purchase",
  ordered: "Ordered — awaiting delivery",
};

const JB_WORKFLOW_CATEGORIES: Record<string, EquipmentKind[]> = {
  jb_tray: ["jb_tray"],
  complete: ["jb_fork"],
  overdenture: ["jb_fork"],
};

export function getRequiredEquipment(productCategory: string | null | undefined): EquipmentKind[] {
  if (!productCategory) return [];
  return JB_WORKFLOW_CATEGORIES[productCategory] ?? [];
}

export function productRequiresEquipmentCheck(productCategory: string | null | undefined): boolean {
  return getRequiredEquipment(productCategory).length > 0;
}

/** JB workflow categories that need a PrintDenture kit before lab case checkout. */
export function isJbWorkflowCategory(category: string | null | undefined): boolean {
  return productRequiresEquipmentCheck(category);
}

/** Ready to upload scans for a JB case (kit in practice + training confirmed). */
export function canStartJbLabCase(
  productCategory: string | null | undefined,
  profile: EquipmentProfile | null | undefined
): boolean {
  return canSubmitLabCase(productCategory, profile);
}

export type EquipmentOrderNotice = {
  title: string;
  body: string;
  equipmentLabel: string;
  shopLabel: string;
};

const CATEGORY_EQUIPMENT_NOTICES: Record<string, EquipmentOrderNotice> = {
  jb_tray: {
    title: "JB Tray required",
    body:
      "This is a complete denture case captured with the JB Tray protocol. Confirm JB Tray (and POP Bow when indicated) in your practice before submitting, or order kits from PrintDenture.",
    equipmentLabel: "JB Tray",
    shopLabel: "Order JB Tray kit",
  },
  complete: {
    title: "JB Fork Radi+ required",
    body:
      "This is a complete denture case from JB Fork-aligned digital scans. Confirm JB Fork Radi+ in your practice before submitting, or order a kit from PrintDenture.",
    equipmentLabel: "JB Fork Radi+",
    shopLabel: "Order JB Fork kit",
  },
  overdenture: {
    title: "JB Fork Radi+ required",
    body:
      "Implant overdenture cases need aligned CBCT / IOS data — typically captured with JB Fork Radi+. Confirm equipment in your practice or order from PrintDenture before case submission.",
    equipmentLabel: "JB Fork Radi+",
    shopLabel: "Order JB Fork kit",
  },
};

export function getEquipmentNoticeForCategory(
  category: string | null | undefined
): EquipmentOrderNotice | null {
  if (!category) return null;
  return CATEGORY_EQUIPMENT_NOTICES[category] ?? null;
}

export function statusFieldForKind(kind: EquipmentKind): keyof EquipmentCheckState {
  return kind === "jb_tray" ? "jb_tray_status" : "jb_fork_status";
}

export function trainedFieldForKind(kind: EquipmentKind): keyof EquipmentCheckState {
  return kind === "jb_tray" ? "jb_tray_trained" : "jb_fork_trained";
}

export function equipmentStateFromProfile(profile: EquipmentProfile | null | undefined): EquipmentCheckState {
  return {
    jb_tray_status: (profile?.jb_tray_status as EquipmentStatus) || "need",
    jb_fork_status: (profile?.jb_fork_status as EquipmentStatus) || "need",
    jb_tray_trained: !!profile?.jb_tray_trained,
    jb_fork_trained: !!profile?.jb_fork_trained,
  };
}

export function isKindReady(state: EquipmentCheckState, kind: EquipmentKind): boolean {
  if (kind === "jb_tray") {
    return state.jb_tray_status === "have" && state.jb_tray_trained;
  }
  return state.jb_fork_status === "have" && state.jb_fork_trained;
}

/** Profile already complete — kit received and training confirmed. */
export function shouldSkipEquipmentStep(
  productCategory: string | null | undefined,
  profile: EquipmentProfile | null | undefined
): boolean {
  return canSubmitLabCase(productCategory, profile);
}

/** User may proceed past equipment step into case details (draft prep). */
export function canProceedPastEquipmentStep(
  productCategory: string | null | undefined,
  state: EquipmentCheckState
): boolean {
  const required = getRequiredEquipment(productCategory);
  if (required.length === 0) return true;
  return required.every((kind) => {
    const status = state[statusFieldForKind(kind)];
    const trained = state[trainedFieldForKind(kind)];
    if (status === "need") return false;
    return trained;
  });
}

/** Lab case may be submitted and paid — equipment must be in practice. */
export function canSubmitLabCase(
  productCategory: string | null | undefined,
  profile: EquipmentProfile | null | undefined
): boolean {
  const required = getRequiredEquipment(productCategory);
  if (required.length === 0) return true;
  const state = equipmentStateFromProfile(profile);
  return required.every((kind) => isKindReady(state, kind));
}

export function equipmentBlockReason(
  productCategory: string | null | undefined,
  profile: EquipmentProfile | null | undefined
): string | null {
  const required = getRequiredEquipment(productCategory);
  if (required.length === 0) return null;
  const state = equipmentStateFromProfile(profile);

  for (const kind of required) {
    const status = state[statusFieldForKind(kind)];
    const trained = state[trainedFieldForKind(kind)];
    const label = kind === "jb_tray" ? "JB Tray" : "JB Fork Radi+";

    if (status === "need") {
      return `Order your ${label} starter kit from PrintDenture, capture records when it arrives, then submit this case.`;
    }
    if (status === "ordered") {
      return `${label} is on the way — mark it received on your dashboard, then submit this case.`;
    }
    if (!trained) {
      return `Confirm ${label} protocol training on your dashboard before submitting this case.`;
    }
  }
  return null;
}

export type OrderFlowStep = "product" | "equipment" | "case" | "rx" | "ai" | "review";

export function buildOrderFlow(showAiDesign: boolean): OrderFlowStep[] {
  const steps: OrderFlowStep[] = ["product", "case", "rx"];
  if (showAiDesign) steps.push("ai");
  steps.push("review");
  return steps;
}

export const ORDER_FLOW_STEP_LABELS: Record<OrderFlowStep, string> = {
  product: "Product",
  equipment: "Equipment",
  case: "Case details",
  rx: "Rx",
  ai: "AI crown",
  review: "Review & pay",
};

export type OrderFlowStepHint = {
  title: string;
  description: string;
  bullets?: readonly string[];
};

export const ORDER_FLOW_STEP_HINTS: Record<OrderFlowStep, OrderFlowStepHint> = {
  product: {
    title: "What are you ordering?",
    description: "Pick the prosthesis type first, then the specific arch or record protocol.",
    bullets: [
      "Complete (JB Fork / JB Tray): order a starter kit first if you are new",
      "Partial, guards, reline & immediate: submit scans directly",
    ],
  },
  equipment: {
    title: "Confirm your chairside setup",
    description: "JB Tray and JB Fork complete-denture cases need the matching kit in your practice before checkout.",
    bullets: ["Order kits from PrintDenture if needed", "Mark equipment received on your dashboard"],
  },
  case: {
    title: "Upload records & preferences",
    description: "Confirm the try-in–skip record checklist, then upload scans. No denture design is required in your office.",
    bullets: ["STL or scanner export from IOS / model scan", "Add clinical notes for the technician"],
  },
  rx: {
    title: "Sign the lab prescription",
    description: "Authorize the case with prescribing dentist information.",
  },
  ai: {
    title: "Review AI crown design",
    description: "Approve the generated design or choose lab CAD before checkout.",
  },
  review: {
    title: "Review & pay",
    description: "Confirm shipping, case summary, and complete Stripe checkout.",
  },
};

export function stepIndexToFlowStep(
  step: number,
  flow: OrderFlowStep[]
): OrderFlowStep | undefined {
  return flow[step - 1];
}

export function flowStepToIndex(flow: OrderFlowStep[], target: OrderFlowStep): number {
  const idx = flow.indexOf(target);
  if (idx >= 0) return idx + 1;

  const fallbacks: Partial<Record<OrderFlowStep, OrderFlowStep>> = {
    equipment: "case",
    ai: "review",
  };
  const fallback = fallbacks[target];
  if (fallback) return flowStepToIndex(flow, fallback);

  return 1;
}

/** Resolve a semantic step to a 1-based index for the flow implied by product + equipment profile. */
export function resolveFlowStepIndex(
  target: OrderFlowStep,
  product: { category: string } | null | undefined,
  profile: EquipmentProfile | null | undefined,
  showAiDesign: boolean,
  _profileOverride?: EquipmentProfile | EquipmentCheckState | null
): number {
  const flow = buildOrderFlow(showAiDesign);
  return flowStepToIndex(flow, target === "equipment" ? "case" : target);
}

export function resolveDraftStepIndex(
  storedStep: number,
  storedFlowStep: OrderFlowStep | undefined,
  product: { category: string },
  profile: EquipmentProfile | null | undefined,
  showAiDesign: boolean
): number {
  const flow = buildOrderFlow(showAiDesign);
  const normalized =
    storedFlowStep === "equipment" ? "case" : storedFlowStep;

  if (normalized) {
    const idx = flow.indexOf(normalized);
    if (idx >= 0) return idx + 1;
  }

  return Math.min(Math.max(storedStep, 1), flow.length);
}

export function equipmentFieldTagForKind(kind: EquipmentKind): string {
  return kind === "jb_tray" ? "jbTray" : "jbFork";
}

export function shopHrefForProductCategory(category: string | null | undefined): string | null {
  const kind = getRequiredEquipment(category)[0];
  if (!kind) return null;
  return `/shop?family=${kind === "jb_tray" ? "jb_tray" : "jb_fork"}`;
}
