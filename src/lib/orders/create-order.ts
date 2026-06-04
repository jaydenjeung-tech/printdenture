/**
 * Order creation helper — auto-calculates and saves due_date
 * 
 * Usage: wrap your existing Supabase insert with this helper,
 * or call setOrderDueDate() after insert if you prefer.
 */

import { createAppClient } from "@/lib/supabase";
import { calculateDueDate } from "@/lib/utils/due-date";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface OrderInsertData {
  user_id: string;
  product_id?: string;
  product_name?: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  rx_id?: string;
  tooth_numbers?: string[];
  shade?: string;
  tooth_number?: string;
  notes?: string;
  status?: string;
  stripe_session_id?: string;
  paid_at?: string;
  [key: string]: unknown;
}

// ─── Create order with due_date ─────────────────────────────────────────────────

export async function createOrderWithDueDate(data: OrderInsertData) {
  const supabase = createAppClient();

  const orderDate = data.paid_at ? new Date(data.paid_at) : new Date();

  const dueDate = calculateDueDate(
    orderDate,
    data.product_name,
    data.product_id
  );

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      ...data,
      due_date: dueDate.toISOString().split("T")[0], // store as DATE (YYYY-MM-DD)
    })
    .select()
    .single();

  if (error) throw error;
  return order;
}

// ─── Recalculate due_date for an existing order ──────────────────────────────────

export async function recalculateOrderDueDate(orderId: string) {
  const supabase = createAppClient();

  // Fetch the order first
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("product_name, product_id, paid_at, created_at")
    .eq("id", orderId)
    .single();

  if (fetchError) throw fetchError;

  const orderDate = order.paid_at
    ? new Date(order.paid_at)
    : new Date(order.created_at);

  const dueDate = calculateDueDate(orderDate, order.product_name, order.product_id);

  const { error: updateError } = await supabase
    .from("orders")
    .update({ due_date: dueDate.toISOString().split("T")[0] })
    .eq("id", orderId);

  if (updateError) throw updateError;

  return dueDate;
}

// ─── Stripe webhook helper: set due_date when payment confirmed ───────────────────

export async function setDueDateOnPayment(
  stripeSessionId: string,
  paidAt: Date = new Date()
) {
  const supabase = createAppClient();

  // Get order by stripe session
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, product_name, product_id")
    .eq("stripe_session_id", stripeSessionId)
    .single();

  if (fetchError) throw fetchError;

  const dueDate = calculateDueDate(paidAt, order.product_name, order.product_id);

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      due_date: dueDate.toISOString().split("T")[0],
      paid_at: paidAt.toISOString(),
    })
    .eq("id", order.id);

  if (updateError) throw updateError;

  return { orderId: order.id, dueDate };
}