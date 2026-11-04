import type Stripe from "stripe";
import { formatCaseNumber } from "@/lib/case-number";

export const CHECKOUT_SITE = "printdenture";

type CheckoutOrder = {
  id: string;
  case_number?: number | null;
};

export function formatSiteCaseLabel(caseNumber: number | null | undefined): string | null {
  const formatted = formatCaseNumber(caseNumber);
  return formatted ? `PD-${formatted}` : null;
}

/** Tag a Checkout Session so the shared iDoc Stripe account can tell this case from PrintCrown. */
export function siteCheckoutFields(
  orders: CheckoutOrder[],
  extra: Record<string, string> = {}
): Pick<Stripe.Checkout.SessionCreateParams, "metadata" | "payment_intent_data"> {
  const labels = orders
    .map((order) => formatSiteCaseLabel(order.case_number))
    .filter((label): label is string => Boolean(label));
  const caseNumber = labels.join(",");
  const metadata: Record<string, string> = {
    site: CHECKOUT_SITE,
    orderId: orders[0]?.id ?? "",
    ...extra,
  };
  if (caseNumber) metadata.caseNumber = caseNumber;

  return {
    metadata,
    payment_intent_data: {
      description: labels.length ? `PrintDenture ${labels.join(", ")}` : "PrintDenture",
      metadata: {
        site: CHECKOUT_SITE,
        ...(orders[0]?.id ? { orderId: orders[0].id } : {}),
        ...(caseNumber ? { caseNumber } : {}),
      },
    },
  };
}

/** Legacy sessions have no site tag. Denture checkouts already set orderType. */
export function ownsCheckoutSession(metadata: Stripe.Metadata | null | undefined): boolean {
  const site = metadata?.site;
  if (site === CHECKOUT_SITE) return true;
  if (site) return false;
  const orderType = metadata?.orderType;
  return orderType === "lab_case" || orderType === "equipment";
}
