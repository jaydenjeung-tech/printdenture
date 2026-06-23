import { NextRequest, NextResponse } from "next/server";
import { parseDesignDeliverables } from "@/lib/design-deliverables";
import { requirePartnerOrderAccess } from "@/lib/partner-api-auth";

type RouteContext = { params: Promise<{ orderId: string }> };

const MAX_BYTES = 500 * 1024 * 1024;
const ALLOWED_EXT = new Set(["stl", "ply", "obj", "zip", "7z", "rar"]);

export async function POST(req: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;
  const auth = await requirePartnerOrderAccess(orderId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File must be under 500MB" }, { status: 400 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !ALLOWED_EXT.has(ext)) {
    return NextResponse.json(
      { error: "Allowed formats: STL, PLY, OBJ, ZIP, 7Z, RAR" },
      { status: 400 }
    );
  }

  const { order, service, userId } = auth;
  const fileId = crypto.randomUUID();
  const storagePath = `${order.user_id}/${orderId}/design/${userId}/${fileId}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await service.storage
    .from("stl-files")
    .upload(storagePath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const deliverable = {
    path: storagePath,
    fileName: file.name,
    uploadedAt: new Date().toISOString(),
    uploadedBy: userId,
  };

  const existing = parseDesignDeliverables(order.design_deliverables);
  const nextDeliverables = [...existing, deliverable];

  const { error: updateError } = await service
    .from("orders")
    .update({
      design_deliverables: nextDeliverables,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await service.from("order_messages").insert({
    order_id: orderId,
    sender_id: userId,
    sender_role: "lab",
    message: `Design file uploaded by partner: ${file.name}`,
    is_internal: true,
  });

  return NextResponse.json({ ok: true, deliverable });
}
