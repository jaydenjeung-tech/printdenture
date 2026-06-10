import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SHIPPING_FLAT_RATE, SHIPPING_LABEL } from "@/lib/shipping";
import {
  equipmentFieldTagForKind,
  type EquipmentKind,
} from "@/lib/equipment-requirements";
import { getVariantShortLabel, SHOP_QUANTITY_MAX, SHOP_QUANTITY_MIN } from "@/lib/equipment-shop";

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey);

  try {
    const { productId, quantity = 1, returnTo } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
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

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .eq("active", true)
      .single();

    if (!product || product.category !== "equipment") {
      return NextResponse.json({ error: "Equipment product not found" }, { status: 404 });
    }

    const qty = Math.max(SHOP_QUANTITY_MIN, Math.min(SHOP_QUANTITY_MAX, Number(quantity) || 1));
    const subtotal = product.price * qty;
    const shipping = SHIPPING_FLAT_RATE;
    const total = subtotal + shipping;

    const equipmentKind: EquipmentKind | null = product.fields?.includes("jbTray")
      ? "jb_tray"
      : product.fields?.includes("jbFork")
        ? "jb_fork"
        : null;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_price: product.price,
        total_price: total,
        status: "pending_payment",
        order_type: "equipment",
        notes: [
          equipmentKind ? `equipment_kind:${equipmentKind}` : null,
          `variant:${getVariantShortLabel(product.fields ?? [])}`,
        ].filter(Boolean).join(" · ") || null,
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: orderError?.message ?? "Could not create order" }, { status: 500 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: qty > 1 ? `${product.name} × ${qty}` : product.name,
            description: [
              getVariantShortLabel(product.fields ?? []),
              product.description || undefined,
            ].filter(Boolean).join(" — ") || undefined,
          },
          unit_amount: product.price * 100,
        },
        quantity: qty,
      },
      {
        price_data: {
          currency: "usd",
          product_data: { name: `Shipping (${SHIPPING_LABEL})` },
          unit_amount: shipping * 100,
        },
        quantity: 1,
      },
    ];

    const safeReturn = typeof returnTo === "string" && returnTo.startsWith("/") ? returnTo : "/shop";
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}${safeReturn}${safeReturn.includes("?") ? "&" : "?"}equipment=ordered${equipmentKind ? `&kind=${equipmentKind}` : ""}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}${safeReturn}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      metadata: {
        orderId: order.id,
        userId: user.id,
        orderType: "equipment",
        equipmentKind: equipmentKind ?? "",
        equipmentField: equipmentKind ? equipmentFieldTagForKind(equipmentKind) : "",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
