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
    const orderIds = [
      ...(session.metadata?.orderIds?.split(",").filter(Boolean) ?? []),
      ...(session.metadata?.orderId && !session.metadata?.orderIds ? [session.metadata.orderId] : []),
    ].filter((id, index, all) => all.indexOf(id) === index);

    if (orderIds.length > 0) {
      const { data: orders } = await supabase
        .from("orders")
        .select("id, product_name, product_id, user_id, order_type, notes")
        .in("id", orderIds);

      const paidAt = new Date(session.created * 1000);
      const primaryOrder = orders?.[0];
      const isEquipment =
        session.metadata?.orderType === "equipment" || primaryOrder?.order_type === "equipment";

      const dueDate = isEquipment
        ? null
        : calculateDueDate(paidAt, primaryOrder?.product_name, primaryOrder?.product_id);

      await supabase
        .from("orders")
        .update({
          status: "received",
          stripe_session_id: session.id,
          paid_at: paidAt.toISOString(),
          due_date: dueDate ? dueDate.toISOString().split("T")[0] : null,
        })
        .in("id", orderIds);

      if (isEquipment && primaryOrder?.user_id) {
        const metadataKinds =
          session.metadata?.equipmentKinds?.split(",").filter(Boolean) ?? [];
        const noteKinds =
          orders?.flatMap((order) => {
            const match = order.notes?.match(/equipment_kind:(jb_tray|jb_fork)/);
            return match ? [match[1]] : [];
          }) ?? [];
        const equipmentKinds = [...new Set([...metadataKinds, ...noteKinds])];

        const profilePatch: Record<string, string> = {};
        if (equipmentKinds.includes("jb_tray")) profilePatch.jb_tray_status = "ordered";
        if (equipmentKinds.includes("jb_fork")) profilePatch.jb_fork_status = "ordered";

        if (Object.keys(profilePatch).length > 0) {
          await supabase.from("profiles").update(profilePatch).eq("id", primaryOrder.user_id);
        }
      } else if (primaryOrder) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/notify-new-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: primaryOrder.id }),
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}