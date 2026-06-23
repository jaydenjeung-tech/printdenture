import { NextRequest, NextResponse } from "next/server";
import {
  CASE_FILE_KIND_META,
  type StoredCaseFile,
} from "@/lib/products/case-files";
import {
  collectOrderCaseFiles,
  DESIGN_OUTSOURCE_SIGNED_URL_SECONDS,
} from "@/lib/design-outsource";
import { parseDesignDeliverables } from "@/lib/design-deliverables";
import { formatCaseNumberLabel } from "@/lib/case-number";
import { requirePartnerOrderAccess } from "@/lib/partner-api-auth";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function GET(_req: NextRequest, context: RouteContext) {
  const { orderId } = await context.params;
  const auth = await requirePartnerOrderAccess(orderId);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { order, service } = auth;
  const caseFiles = collectOrderCaseFiles(order);

  const downloadFiles: (StoredCaseFile & { url: string; label: string })[] = [];
  for (const file of caseFiles) {
    const { data, error } = await service.storage
      .from("stl-files")
      .createSignedUrl(file.path, DESIGN_OUTSOURCE_SIGNED_URL_SECONDS);
    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: `Could not create download link for ${file.fileName}` },
        { status: 500 }
      );
    }
    downloadFiles.push({
      ...file,
      url: data.signedUrl,
      label: CASE_FILE_KIND_META[file.kind].label,
    });
  }

  const deliverables = parseDesignDeliverables(order.design_deliverables);
  const deliverableDownloads = [];
  for (const file of deliverables) {
    const { data } = await service.storage
      .from("stl-files")
      .createSignedUrl(file.path, DESIGN_OUTSOURCE_SIGNED_URL_SECONDS);
    if (data?.signedUrl) {
      deliverableDownloads.push({ ...file, url: data.signedUrl });
    }
  }

  const [{ data: profile }, { data: rx }] = await Promise.all([
    service
      .from("profiles")
      .select("practice_name, city, state")
      .eq("id", order.user_id)
      .single(),
    service
      .from("rx")
      .select("dentist_name, shade, occlusion, notes")
      .eq("order_id", orderId)
      .maybeSingle(),
  ]);

  const teeth = order.tooth_numbers?.length
    ? order.tooth_numbers.sort((a, b) => a - b).map((n) => `#${n}`).join(", ")
    : order.tooth_number
      ? `#${order.tooth_number}`
      : null;

  return NextResponse.json({
    case: {
      id: order.id,
      caseId: formatCaseNumberLabel(order.case_number, order.id),
      productName: order.product_name,
      quantity: order.quantity,
      shade: order.shade || rx?.shade || null,
      teeth,
      notes: order.notes,
      rxNotes: rx?.notes || null,
      occlusion: rx?.occlusion || null,
      dentistName: rx?.dentist_name || null,
      practiceName: profile?.practice_name || null,
      practiceLocation:
        profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : null,
      dueDate: order.due_date,
      createdAt: order.created_at,
      status: order.design_outsource_status,
      instructions: order.design_outsource_notes,
      caseFiles: downloadFiles,
      deliverables: deliverableDownloads,
    },
  });
}
