import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SHIPPING_FLAT_RATE, SHIPPING_LABEL } from "@/lib/shipping";
import { CHECKOUT_SITE, formatSiteCaseLabel } from "@/lib/stripe-checkout";

const DAYS_UNTIL_DUE = 7;

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey);

  try {
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== "string") {
      return NextResponse.json({ error: "orderId is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.email) {
      return NextResponse.json({ error: "Practice email is required to send an invoice" }, { status: 400 });
    }

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.paid_at) return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    if (order.is_remake) return NextResponse.json({ error: "Remakes are not invoiced" }, { status: 400 });

    if (typeof order.stripe_session_id === "string" && order.stripe_session_id.startsWith("in_")) {
      const existing = await stripe.invoices.retrieve(order.stripe_session_id);
      if (existing.status === "open" || existing.status === "draft") {
        const sent = existing.status === "draft" ? await stripe.invoices.sendInvoice(existing.id) : existing;
        return NextResponse.json({
          invoiceId: sent.id,
          hostedInvoiceUrl: sent.hosted_invoice_url,
          status: sent.status,
        });
      }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("practice_name, first_name, last_name")
      .eq("id", user.id)
      .maybeSingle();

    const practiceName =
      profile?.practice_name ||
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      undefined;

    const listed = await stripe.customers.list({ email: user.email, limit: 10 });
    let customer = listed.data.find(
      (row) => row.metadata?.site === CHECKOUT_SITE && row.metadata?.userId === user.id
    );
    if (!customer) {
      customer = await stripe.customers.create(
        {
          email: user.email,
          name: practiceName,
          metadata: { site: CHECKOUT_SITE, userId: user.id },
        },
        { idempotencyKey: `printdenture-customer-${user.id}` }
      );
    }

    const caseLabel = formatSiteCaseLabel(order.case_number);
    const description = [
      order.shade ? `Shade: ${order.shade}` : null,
      order.tooth_number ? `Tooth: #${order.tooth_number}` : null,
    ]
      .filter(Boolean)
      .join(" · ");

    const invoice = await stripe.invoices.create(
      {
        customer: customer.id,
        collection_method: "send_invoice",
        days_until_due: DAYS_UNTIL_DUE,
        auto_advance: false,
        pending_invoice_items_behavior: "exclude",
        description: caseLabel ? `PrintDenture ${caseLabel}` : "PrintDenture case",
        metadata: {
          site: CHECKOUT_SITE,
          orderId: order.id,
          orderType: order.order_type === "equipment" ? "equipment" : "lab_case",
          ...(caseLabel ? { caseNumber: caseLabel } : {}),
          userId: user.id,
        },
      },
      { idempotencyKey: `printdenture-invoice-${order.id}` }
    );

    const productSubtotal = order.unit_price * order.quantity;
    const shipping = SHIPPING_FLAT_RATE;
    const designFee = Math.max(0, order.total_price - productSubtotal - shipping);

    const items: { description: string; amount: number }[] = [
      {
        description: description ? `${order.product_name} — ${description}` : order.product_name,
        amount: Math.round(productSubtotal * 100),
      },
    ];
    if (designFee > 0) {
      items.push({ description: "CAD design fee", amount: Math.round(designFee * 100) });
    }
    items.push({
      description: `Shipping (${SHIPPING_LABEL})`,
      amount: Math.round(shipping * 100),
    });

    for (const [index, item] of items.entries()) {
      await stripe.invoiceItems.create(
        {
          customer: customer.id,
          invoice: invoice.id,
          currency: "usd",
          amount: item.amount,
          description: item.description,
        },
        { idempotencyKey: `printdenture-invoice-item-${order.id}-${index}` }
      );
    }

    const sent = await stripe.invoices.sendInvoice(invoice.id);

    await supabase.from("orders").update({ stripe_session_id: sent.id }).eq("id", order.id);

    return NextResponse.json({
      invoiceId: sent.id,
      hostedInvoiceUrl: sent.hosted_invoice_url,
      status: sent.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Could not create invoice";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
