import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAdminServiceClient } from "@/lib/admin-api-auth";
import { calculateDueDate } from "@/lib/utils/due-date";
import {
  stripeCheckoutSessionDashboardUrl,
  stripePaymentDashboardUrl,
} from "@/lib/stripe-admin";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminServiceClient();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { action?: string; orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { action, orderId } = body;
  if (!orderId) return NextResponse.json({ error: "orderId is required" }, { status: 400 });
  if (!action) return NextResponse.json({ error: "action is required" }, { status: 400 });

  const { data: order, error: fetchError } = await auth.service
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (action === "mark-paid") {
    if (order.is_remake) {
      return NextResponse.json({ error: "Remakes are not charged" }, { status: 400 });
    }
    if (order.paid_at) {
      return NextResponse.json({ ok: true, alreadyPaid: true, paid_at: order.paid_at });
    }

    const paidAt = new Date();
    const isEquipment = order.order_type === "equipment";
    const dueDate = isEquipment
      ? null
      : calculateDueDate(paidAt, order.product_name, order.product_id);

    const patch: Record<string, string | null> = {
      paid_at: paidAt.toISOString(),
      due_date: dueDate ? dueDate.toISOString().split("T")[0] : order.due_date,
    };

    const { error: updateError } = await auth.service
      .from("orders")
      .update({
        ...patch,
        ...(order.status === "pending_payment" ? { status: "received" } : {}),
      })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, paid_at: patch.paid_at, due_date: patch.due_date });
  }

  if (action === "sync-stripe") {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    if (!order.stripe_session_id) {
      return NextResponse.json(
        { error: "No Stripe checkout session linked to this order" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        ok: false,
        payment_status: session.payment_status,
        message: "Stripe shows this checkout is not paid yet",
        stripeSessionUrl: stripeCheckoutSessionDashboardUrl(session.id),
      });
    }

    const paidAt = new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000);
    const isEquipment =
      session.metadata?.orderType === "equipment" || order.order_type === "equipment";
    const dueDate = isEquipment
      ? null
      : calculateDueDate(paidAt, order.product_name, order.product_id);

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    const { error: updateError } = await auth.service
      .from("orders")
      .update({
        paid_at: paidAt.toISOString(),
        stripe_session_id: session.id,
        due_date: dueDate ? dueDate.toISOString().split("T")[0] : null,
        ...(order.status === "pending_payment" ? { status: "received" } : {}),
      })
      .eq("id", orderId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      paid_at: paidAt.toISOString(),
      due_date: dueDate ? dueDate.toISOString().split("T")[0] : null,
      payment_status: session.payment_status,
      stripeSessionUrl: stripeCheckoutSessionDashboardUrl(session.id),
      stripePaymentUrl: paymentIntentId ? stripePaymentDashboardUrl(paymentIntentId) : null,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
