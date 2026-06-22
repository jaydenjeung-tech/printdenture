import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { requireAdminServiceClient } from "@/lib/admin-api-auth";
import { getAppUrl } from "@/lib/app-url";
import {
  CASE_FILE_KIND_META,
  type StoredCaseFile,
} from "@/lib/products/case-files";
import {
  collectOrderCaseFiles,
  defaultDesignPartnerEmail,
  DESIGN_OUTSOURCE_SIGNED_URL_SECONDS,
  orderQualifiesForDesignOutsource,
} from "@/lib/design-outsource";

type SignedFileLink = StoredCaseFile & { url: string };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const auth = await requireAdminServiceClient();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  return NextResponse.json({ defaultPartnerEmail: defaultDesignPartnerEmail() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminServiceClient();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email is not configured (RESEND_API_KEY)" }, { status: 500 });
  }

  let body: { orderId?: string; partnerEmail?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  const partnerEmail = body.partnerEmail?.trim();
  const notes = body.notes?.trim() ?? "";

  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  if (!partnerEmail) {
    return NextResponse.json({ error: "Design partner email is required" }, { status: 400 });
  }

  const { service, userId } = auth;

  const { data: order, error: orderError } = await service
    .from("orders")
    .select(
      "id, user_id, product_id, product_name, quantity, shade, tooth_number, tooth_numbers, notes, due_date, case_files, stl_file_path, record_checklist, design_outsource_status"
    )
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  let category: string | null = null;
  if (order.product_id) {
    const { data: product } = await service.from("products").select("category").eq("id", order.product_id).single();
    category = product?.category ?? null;
  }

  if (!orderQualifiesForDesignOutsource(category)) {
    return NextResponse.json(
      { error: "Design outsource is only available for complete denture cases" },
      { status: 400 }
    );
  }

  const files = collectOrderCaseFiles(order);
  if (files.length === 0) {
    return NextResponse.json({ error: "No scan or case files on this order" }, { status: 400 });
  }

  const signedLinks: SignedFileLink[] = [];
  for (const file of files) {
    const { data, error } = await service.storage
      .from("stl-files")
      .createSignedUrl(file.path, DESIGN_OUTSOURCE_SIGNED_URL_SECONDS);
    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { error: `Could not create download link for ${file.fileName}` },
        { status: 500 }
      );
    }
    signedLinks.push({ ...file, url: data.signedUrl });
  }

  const [{ data: profile }, { data: rx }] = await Promise.all([
    service
      .from("profiles")
      .select("first_name, last_name, practice_name, phone, city, state")
      .eq("id", order.user_id)
      .single(),
    service
      .from("rx")
      .select("dentist_name, dentist_license_no, license_state, shade, occlusion, notes, authorized")
      .eq("order_id", orderId)
      .maybeSingle(),
  ]);

  const caseId = orderId.slice(0, 6).toUpperCase();
  const practiceName = profile?.practice_name || "Unknown practice";
  const teeth = order.tooth_numbers?.length
    ? order.tooth_numbers.sort((a: number, b: number) => a - b).map((n: number) => `#${n}`).join(", ")
    : order.tooth_number
      ? `#${order.tooth_number}`
      : "—";

  const fileRows = signedLinks
    .map(
      (file) => `
        <tr style="border-bottom:1px solid #F0EEE8;">
          <td style="padding:10px 0;font-size:13px;color:#9B9B9B;">${escapeHtml(CASE_FILE_KIND_META[file.kind].label)}</td>
          <td style="padding:10px 0;font-size:13px;color:#1A1A1A;">${escapeHtml(file.fileName)}</td>
          <td style="padding:10px 0;text-align:right;">
            <a href="${file.url}" style="font-size:13px;color:#0F6E56;font-weight:600;text-decoration:none;">Download</a>
          </td>
        </tr>`
    )
    .join("");

  const resend = new Resend(resendKey);
  const adminCaseUrl = `${getAppUrl()}/admin/orders/${orderId}`;

  await resend.emails.send({
    from: "PrintDenture Lab <onboarding@resend.dev>",
    to: partnerEmail,
    replyTo: process.env.ADMIN_EMAIL || undefined,
    subject: `CAD outsource — Case #${caseId} · ${order.product_name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#F8F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <div style="max-width:600px;margin:40px auto;padding:0 20px;">
          <div style="background:#1A1A1A;border-radius:16px 16px 0 0;padding:24px 32px;">
            <span style="color:white;font-size:16px;font-weight:600;">Print<span style="color:#5DCAA5;">Denture</span></span>
            <p style="margin:8px 0 0;font-size:12px;color:#9B9B9B;">External design partner — scan package</p>
          </div>
          <div style="background:white;padding:32px;border:1px solid #E2E0D8;border-top:none;">
            <p style="margin:0 0 8px;font-size:12px;color:#9B9B9B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">Case #${caseId}</p>
            <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#1A1A1A;">${escapeHtml(order.product_name)}</h1>

            <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
              <tr style="border-bottom:1px solid #F0EEE8;">
                <td style="padding:8px 0;font-size:13px;color:#9B9B9B;width:38%;">Practice</td>
                <td style="padding:8px 0;font-size:13px;font-weight:600;color:#1A1A1A;">${escapeHtml(practiceName)}</td>
              </tr>
              ${
                rx?.dentist_name
                  ? `<tr style="border-bottom:1px solid #F0EEE8;">
                <td style="padding:8px 0;font-size:13px;color:#9B9B9B;">Doctor</td>
                <td style="padding:8px 0;font-size:13px;color:#1A1A1A;">Dr. ${escapeHtml(rx.dentist_name)}</td>
              </tr>`
                  : ""
              }
              <tr style="border-bottom:1px solid #F0EEE8;">
                <td style="padding:8px 0;font-size:13px;color:#9B9B9B;">Quantity</td>
                <td style="padding:8px 0;font-size:13px;color:#1A1A1A;">${order.quantity}</td>
              </tr>
              ${
                order.shade || rx?.shade
                  ? `<tr style="border-bottom:1px solid #F0EEE8;">
                <td style="padding:8px 0;font-size:13px;color:#9B9B9B;">Shade</td>
                <td style="padding:8px 0;font-size:13px;color:#1A1A1A;">${escapeHtml(order.shade || rx?.shade || "")}</td>
              </tr>`
                  : ""
              }
              <tr style="border-bottom:1px solid #F0EEE8;">
                <td style="padding:8px 0;font-size:13px;color:#9B9B9B;">Arch / teeth</td>
                <td style="padding:8px 0;font-size:13px;color:#1A1A1A;">${escapeHtml(teeth)}</td>
              </tr>
              ${
                order.due_date
                  ? `<tr style="border-bottom:1px solid #F0EEE8;">
                <td style="padding:8px 0;font-size:13px;color:#9B9B9B;">Target due</td>
                <td style="padding:8px 0;font-size:13px;font-weight:600;color:#DC2626;">${escapeHtml(
                  new Date(order.due_date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })
                )}</td>
              </tr>`
                  : ""
              }
            </table>

            ${
              notes
                ? `<div style="background:#F8F7F4;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9B9B9B;text-transform:uppercase;">Instructions from lab</p>
              <p style="margin:0;font-size:13px;color:#4B4B4B;white-space:pre-wrap;">${escapeHtml(notes)}</p>
            </div>`
                : ""
            }

            ${
              order.notes || rx?.notes
                ? `<div style="background:#F8F7F4;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
              <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9B9B9B;text-transform:uppercase;">Clinical notes</p>
              <p style="margin:0;font-size:13px;color:#4B4B4B;white-space:pre-wrap;">${escapeHtml(
                [order.notes, rx?.notes].filter(Boolean).join("\n\n")
              )}</p>
            </div>`
                : ""
            }

            <p style="margin:0 0 10px;font-size:11px;font-weight:600;color:#9B9B9B;text-transform:uppercase;letter-spacing:0.05em;">Case files (links expire in 72 hours)</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
              ${fileRows}
            </table>

            <p style="margin:0;font-size:12px;color:#9B9B9B;">Reference: ${escapeHtml(adminCaseUrl)}</p>
          </div>
          <div style="padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9B9B9B;">PrintDenture · California, USA</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  const sentAt = new Date().toISOString();
  const { error: updateError } = await service
    .from("orders")
    .update({
      design_outsource_status: "sent",
      design_outsource_sent_at: sentAt,
      design_outsource_email: partnerEmail,
      design_outsource_notes: notes || null,
      design_outsource_sent_by: userId,
      updated_at: sentAt,
    })
    .eq("id", orderId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await service.from("order_messages").insert({
    order_id: orderId,
    sender_id: userId,
    sender_role: "admin",
    message: `Design outsource sent to ${partnerEmail} (${signedLinks.length} file${signedLinks.length === 1 ? "" : "s"}).`,
    is_internal: true,
  });

  return NextResponse.json({
    ok: true,
    sentAt,
    fileCount: signedLinks.length,
    partnerEmail,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminServiceClient();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: { orderId?: string; status?: "completed" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  if (body.status !== "completed") {
    return NextResponse.json({ error: "Unsupported status" }, { status: 400 });
  }

  const { error } = await auth.service
    .from("orders")
    .update({ design_outsource_status: "completed", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
