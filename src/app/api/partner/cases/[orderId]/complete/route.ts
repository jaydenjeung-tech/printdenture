import { NextRequest, NextResponse } from "next/server";
import { parseDesignDeliverables } from "@/lib/design-deliverables";
import { requirePartnerOrderAccess } from "@/lib/partner-api-auth";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function POST(_req: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;
  const auth = await requirePartnerOrderAccess(orderId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const deliverables = parseDesignDeliverables(auth.order.design_deliverables);
  if (deliverables.length === 0) {
    return NextResponse.json(
      { error: "Upload at least one design file before marking complete" },
      { status: 400 }
    );
  }

  const completedAt = new Date().toISOString();
  const { error } = await auth.service
    .from("orders")
    .update({
      design_outsource_status: "completed",
      design_outsource_partner_id: auth.userId,
      updated_at: completedAt,
    })
    .eq("id", orderId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await auth.service.from("order_messages").insert({
    order_id: orderId,
    sender_id: auth.userId,
    sender_role: "lab",
    message: `Design partner marked case complete (${deliverables.length} file${deliverables.length === 1 ? "" : "s"}).`,
    is_internal: true,
  });

  return NextResponse.json({ ok: true, completedAt });
}
