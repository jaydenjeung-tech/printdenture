import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SHIPPING_FLAT_RATE, SHIPPING_LABEL } from "@/lib/shipping";
import {
  equipmentFieldTagForKind,
  type EquipmentKind,
} from "@/lib/equipment-requirements";
import {
  clampShopQuantity,
  getVariantShortLabel,
  SHOP_QUANTITY_MIN,
} from "@/lib/equipment-shop";

type CheckoutLineInput = {
  productId: string;
  quantity?: number;
};

type ResolvedCheckoutLine = {
  product: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    fields: string[] | null;
    category: string;
  };
  quantity: number;
  equipmentKind: EquipmentKind | null;
};

function equipmentKindFromFields(fields: string[] | null | undefined): EquipmentKind | null {
  if (fields?.includes("jbTray")) return "jb_tray";
  if (fields?.includes("jbFork")) return "jb_fork";
  return null;
}

function normalizeCheckoutLines(body: {
  productId?: string;
  quantity?: number;
  items?: CheckoutLineInput[];
}): CheckoutLineInput[] {
  if (Array.isArray(body.items) && body.items.length > 0) {
    return body.items.filter((item) => item?.productId);
  }
  if (body.productId) {
    return [{ productId: body.productId, quantity: body.quantity }];
  }
  return [];
}

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey);

  try {
    const body = await req.json();
    const requestedLines = normalizeCheckoutLines(body);
    if (!requestedLines.length) {
      return NextResponse.json({ error: "At least one product is required" }, { status: 400 });
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

    const productIds = [...new Set(requestedLines.map((line) => line.productId))];
    const { data: products } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)
      .eq("active", true)
      .eq("category", "equipment");

    if (!products?.length || products.length !== productIds.length) {
      return NextResponse.json({ error: "One or more equipment products were not found" }, { status: 404 });
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const resolvedLines: ResolvedCheckoutLine[] = requestedLines.map((line) => {
      const product = productById.get(line.productId)!;
      return {
        product,
        quantity: clampShopQuantity(Number(line.quantity) || SHOP_QUANTITY_MIN),
        equipmentKind: equipmentKindFromFields(product.fields),
      };
    });

    const isMultiItem = resolvedLines.length > 1;
    const shipping = SHIPPING_FLAT_RATE;
    const subtotal = resolvedLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    const checkoutTotal = subtotal + shipping;

    const orderIds: string[] = [];
    const equipmentKinds = new Set<EquipmentKind>();

    for (const line of resolvedLines) {
      const lineSubtotal = line.product.price * line.quantity;
      const orderTotal = isMultiItem ? lineSubtotal : checkoutTotal;

      if (line.equipmentKind) equipmentKinds.add(line.equipmentKind);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          product_id: line.product.id,
          product_name: line.product.name,
          quantity: line.quantity,
          unit_price: line.product.price,
          total_price: orderTotal,
          status: "pending_payment",
          order_type: "equipment",
          notes: [
            line.equipmentKind ? `equipment_kind:${line.equipmentKind}` : null,
            `variant:${getVariantShortLabel(line.product.fields ?? [])}`,
            isMultiItem ? "checkout_batch:true" : null,
          ].filter(Boolean).join(" · ") || null,
        })
        .select()
        .single();

      if (orderError || !order) {
        return NextResponse.json({ error: orderError?.message ?? "Could not create order" }, { status: 500 });
      }

      orderIds.push(order.id);
    }

    const stripeLineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = resolvedLines.map((line) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: line.quantity > 1 ? `${line.product.name} × ${line.quantity}` : line.product.name,
          description: [
            getVariantShortLabel(line.product.fields ?? []),
            line.product.description || undefined,
          ].filter(Boolean).join(" — ") || undefined,
        },
        unit_amount: line.product.price * 100,
      },
      quantity: line.quantity,
    }));

    stripeLineItems.push({
      price_data: {
        currency: "usd",
        product_data: { name: `Shipping (${SHIPPING_LABEL})` },
        unit_amount: shipping * 100,
      },
      quantity: 1,
    });

    const safeReturn = typeof body.returnTo === "string" && body.returnTo.startsWith("/") ? body.returnTo : "/shop";
    const successParams = new URLSearchParams({ equipment: "ordered" });
    if (isMultiItem) {
      successParams.set("count", String(resolvedLines.length));
    } else {
      const kind = resolvedLines[0]?.equipmentKind;
      if (kind) successParams.set("kind", kind);
    }
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}${safeReturn}${safeReturn.includes("?") ? "&" : "?"}${successParams.toString()}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}${safeReturn}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: stripeLineItems,
      metadata: {
        orderId: orderIds[0],
        orderIds: orderIds.join(","),
        userId: user.id,
        orderType: "equipment",
        equipmentKind: resolvedLines[0]?.equipmentKind ?? "",
        equipmentKinds: [...equipmentKinds].join(","),
        equipmentField: resolvedLines[0]?.equipmentKind
          ? equipmentFieldTagForKind(resolvedLines[0].equipmentKind)
          : "",
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    await supabase
      .from("orders")
      .update({ stripe_session_id: session.id })
      .in("id", orderIds);

    return NextResponse.json({ url: session.url, orderId: orderIds[0], orderIds });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
