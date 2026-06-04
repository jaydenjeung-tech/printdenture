import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { calculateDueDate } from "@/lib/utils/due-date";

function getAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars are not configured");
  return createClient(url, key);
}

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const supabase = getAdminSupabase();
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const { data: order } = await supabase
        .from("orders")
        .select("product_name, product_id")
        .eq("id", orderId)
        .single();

      const paidAt = new Date(session.created * 1000);
      const dueDate = calculateDueDate(paidAt, order?.product_name, order?.product_id);

           await supabase
        .from("orders")
        .update({
          status: "received",
          stripe_session_id: session.id,
          paid_at: paidAt.toISOString(),
          due_date: dueDate.toISOString().split("T")[0],
        })
        .eq("id", orderId);
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify-new-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        }
  }

  return NextResponse.json({ received: true });
}