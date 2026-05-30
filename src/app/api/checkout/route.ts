import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { SHIPPING_CARRIER, SHIPPING_FLAT_RATE } from "@/lib/shipping";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: order.product_name,
            description: [
              order.shade ? `Shade: ${order.shade}` : null,
              order.tooth_number ? `Tooth: #${order.tooth_number}` : null,
            ].filter(Boolean).join(" · ") || undefined,
          },
          unit_amount: order.unit_price * 100,
        },
        quantity: order.quantity,
      },
    ];

    const productSubtotal = order.unit_price * order.quantity;
    const shipping = SHIPPING_FLAT_RATE;
    const designFee = Math.max(0, order.total_price - productSubtotal - shipping);
    if (designFee > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "CAD design fee" },
          unit_amount: designFee * 100,
        },
        quantity: 1,
      });
    }

    lineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: `Shipping (${SHIPPING_CARRIER})` },
        unit_amount: shipping * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      metadata: { orderId: order.id, userId: user.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?ordered=true&orderId=${order.id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/order`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}