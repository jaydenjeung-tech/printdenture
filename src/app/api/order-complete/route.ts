import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculateDueDate } from "@/lib/utils/due-date";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role로 RLS 우회
);

export async function POST(req: NextRequest) {
  const { orderId, userId } = await req.json();
  if (!orderId || !userId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const { data: order } = await supabase
    .from("orders")
    .select("product_name, product_id")
    .eq("id", orderId)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const dueDate = calculateDueDate(new Date(), order.product_name, order.product_id);

  await supabase
    .from("orders")
    .update({
      status: "received",
      due_date: dueDate.toISOString().split("T")[0],
      stl_file_path: `${userId}/${orderId}.stl`,
    })
    .eq("id", orderId);

  return NextResponse.json({ ok: true });
}