import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars are not configured");
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Resend is not configured" }, { status: 500 });
  }
  const resend = new Resend(resendKey);
  const supabase = getAdminSupabase();

  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    const { data: order } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, practice_name, phone")
      .eq("id", order.user_id)
      .single();

    const caseId = orderId.slice(0, 6).toUpperCase();
    const practiceName = profile?.practice_name || "Unknown Practice";
    const teeth = order.tooth_numbers?.length
      ? order.tooth_numbers.sort((a: number, b: number) => a - b).map((n: number) => `#${n}`).join(", ")
      : order.tooth_number ? `#${order.tooth_number}` : "—";

    const labUrl = `${process.env.NEXT_PUBLIC_APP_URL}/lab`;

    await resend.emails.send({
      from: "PrintDenture <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL!,
      subject: `🦷 New order #${caseId} — ${order.product_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="margin:0;padding:0;background:#F8F7F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <div style="max-width:560px;margin:40px auto;padding:0 20px;">

            <div style="background:#1A1A1A;border-radius:16px 16px 0 0;padding:24px 32px;">
              <span style="color:white;font-size:16px;font-weight:600;">Print<span style="color:#5DCAA5;">Denture</span></span>
            </div>

            <div style="background:white;padding:32px;border:1px solid #E2E0D8;border-top:none;">
              <p style="margin:0 0 8px;font-size:12px;color:#9B9B9B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600;">New Order</p>
              <h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#1A1A1A;">Case #${caseId}</h1>

              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr style="border-bottom:1px solid #F0EEE8;">
                  <td style="padding:10px 0;font-size:13px;color:#9B9B9B;width:40%;">Product</td>
                  <td style="padding:10px 0;font-size:13px;font-weight:600;color:#1A1A1A;">${order.product_name}</td>
                </tr>
                <tr style="border-bottom:1px solid #F0EEE8;">
                  <td style="padding:10px 0;font-size:13px;color:#9B9B9B;">Practice</td>
                  <td style="padding:10px 0;font-size:13px;font-weight:600;color:#1A1A1A;">${practiceName}</td>
                </tr>
                <tr style="border-bottom:1px solid #F0EEE8;">
                  <td style="padding:10px 0;font-size:13px;color:#9B9B9B;">Quantity</td>
                  <td style="padding:10px 0;font-size:13px;color:#1A1A1A;">${order.quantity} unit${order.quantity > 1 ? "s" : ""}</td>
                </tr>
                ${order.shade ? `
                <tr style="border-bottom:1px solid #F0EEE8;">
                  <td style="padding:10px 0;font-size:13px;color:#9B9B9B;">Shade</td>
                  <td style="padding:10px 0;font-size:13px;color:#1A1A1A;">${order.shade}</td>
                </tr>` : ""}
                <tr style="border-bottom:1px solid #F0EEE8;">
                  <td style="padding:10px 0;font-size:13px;color:#9B9B9B;">Tooth #</td>
                  <td style="padding:10px 0;font-size:13px;color:#1A1A1A;">${teeth}</td>
                </tr>
                ${order.due_date ? `
                <tr style="border-bottom:1px solid #F0EEE8;">
                  <td style="padding:10px 0;font-size:13px;color:#9B9B9B;">Due date</td>
                  <td style="padding:10px 0;font-size:13px;font-weight:600;color:#DC2626;">${new Date(order.due_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding:10px 0;font-size:13px;color:#9B9B9B;">Total</td>
                  <td style="padding:10px 0;font-size:13px;font-weight:700;color:#1A1A1A;">$${order.total_price}</td>
                </tr>
              </table>

              ${order.notes ? `
              <div style="background:#F8F7F4;border-radius:10px;padding:14px 16px;margin-bottom:24px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#9B9B9B;text-transform:uppercase;letter-spacing:0.05em;">Notes from practice</p>
                <p style="margin:0;font-size:13px;color:#4B4B4B;">${order.notes}</p>
              </div>` : ""}

              <a href="${labUrl}" style="display:block;background:#1A1A1A;color:white;text-decoration:none;text-align:center;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:600;">
                View in Lab Queue →
              </a>
            </div>

            <div style="padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9B9B9B;">PrintDenture · California, USA · HIPAA Compliant</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Email error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}