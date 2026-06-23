import { NextResponse } from "next/server";
import { collectOrderCaseFiles, DESIGN_OUTSOURCE_SIGNED_URL_SECONDS } from "@/lib/design-outsource";
import { parseDesignDeliverables } from "@/lib/design-deliverables";
import { partnerCanAccessOrder } from "@/lib/partner-auth";
import { formatCaseNumberLabel } from "@/lib/case-number";
import { requirePartnerServiceClient } from "@/lib/partner-api-auth";

export async function GET() {
  const auth = await requirePartnerServiceClient();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { data: orders, error } = await auth.service
    .from("orders")
    .select("*")
    .in("design_outsource_status", ["sent", "completed"])
    .order("design_outsource_sent_at", { ascending: false, nullsFirst: false });

  if (error) {
    const hint = error.message.includes("design_outsource")
      ? " Run Supabase migrations: 20250620_design_outsource.sql and 20250622_partner_portal.sql."
      : "";
    return NextResponse.json({ error: `${error.message}${hint}` }, { status: 500 });
  }

  const cases = (orders ?? [])
    .filter((order) =>
      auth.isAdmin ? order.design_outsource_status === "sent" || order.design_outsource_status === "completed" : partnerCanAccessOrder(order, auth.userId, auth.userEmail)
    )
    .map((order) => ({
      id: order.id,
      caseId: formatCaseNumberLabel(order.case_number, order.id),
      productName: order.product_name,
      quantity: order.quantity,
      shade: order.shade,
      dueDate: order.due_date,
      createdAt: order.created_at,
      status: order.design_outsource_status,
      sentAt: order.design_outsource_sent_at,
      fileCount: collectOrderCaseFiles(order).length,
      deliverableCount: parseDesignDeliverables(order.design_deliverables).length,
    }));

  return NextResponse.json({ cases, partnerName: process.env.DESIGN_PARTNER_NAME?.trim() || "JD" });
}
