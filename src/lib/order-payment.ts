export type OrderPaymentFields = {
  paid_at: string | null;
  is_remake?: boolean;
  total_price?: number;
  status?: string | null;
};

export function isOrderPaid(order: OrderPaymentFields): boolean {
  return !!order.paid_at || !!order.is_remake;
}

export function isOrderUnpaid(order: OrderPaymentFields): boolean {
  if (order.is_remake) return false;
  return !order.paid_at;
}

export function orderPaymentLabel(order: OrderPaymentFields): "Paid" | "Unpaid" | "Remake" {
  if (order.is_remake) return "Remake";
  return order.paid_at ? "Paid" : "Unpaid";
}

/** Lab may start work only after payment (or remake). Unpaid / pending_payment cases stay out of the queue. */
export function isLabFulfillable(order: OrderPaymentFields): boolean {
  if (order.status === "pending_payment") return false;
  return isOrderPaid(order);
}
