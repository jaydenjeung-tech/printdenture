import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Resend } from "resend";
import { formatCaseNumberLabel } from "@/lib/case-number";
import { escapeInquiryHtml } from "@/lib/provider-inquiry";
import { getMessageNotifyRecipients, getResendFrom, resendErrorMessage, sendResendEmail } from "@/lib/resend-mail";

export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey || !adminEmail || !url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: "Email is not configured" }, { status: 500 });
  }

  let orderId: unknown;
  let message: unknown;
  try {
    const body = await req.json();
    orderId = body?.orderId;
    message = body?.message;
  } catch {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }
  if (!orderId || typeof orderId !== "string" || typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const authClient = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });
  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const service = createClient(url, serviceKey);
  const { data: order } = await service
    .from("orders")
    .select("id, case_number, product_name, user_id")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();
  if (!order) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const { data: profile } = await service
    .from("profiles")
    .select("first_name, last_name, practice_name")
    .eq("id", user.id)
    .single();

  const practice =
    profile?.practice_name?.trim() ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "A practice";
  const caseId = formatCaseNumberLabel(order.case_number, order.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const safeMessage = escapeInquiryHtml(message.trim()).replace(/\n/g, "<br>");
  const resend = new Resend(apiKey);

  const sent = await sendResendEmail(resend, {
    from: getResendFrom(),
    to: getMessageNotifyRecipients(adminEmail),
    replyTo: user.email || undefined,
    subject: `Case message — ${order.product_name} #${caseId}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #0D1B2A; padding: 20px 24px;">
          <h2 style="color: white; margin: 0; font-size: 18px;">Print<span style="color: #2AD4B2;">Denture</span></h2>
        </div>
        <div style="border: 1px solid #E2E0D8; border-top: none; padding: 24px;">
          <p style="color: #6B6B6B; font-size: 13px; margin: 0 0 16px;">New message on a case</p>
          <div style="background: #F8F7F4; padding: 16px; margin-bottom: 16px;">
            <p style="margin: 0 0 4px; font-weight: 600; color: #1A1A1A;">${escapeInquiryHtml(practice)}</p>
            <p style="margin: 0 0 12px; color: #9B9B9B; font-size: 12px;">${escapeInquiryHtml(order.product_name)} · #${escapeInquiryHtml(caseId)}</p>
            <p style="margin: 0; color: #1A1A1A; font-size: 14px; line-height: 1.5;">${safeMessage}</p>
          </div>
          <a href="${appUrl}/admin/orders/${order.id}"
            style="display: inline-block; background: #0D1B2A; color: white; padding: 10px 20px; text-decoration: none; font-size: 14px; font-weight: 500;">
            Open case
          </a>
        </div>
      </div>
    `,
  });

  if (!sent.ok) {
    return NextResponse.json({ error: resendErrorMessage(sent.error) }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
