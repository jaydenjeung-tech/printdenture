import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { orderId, orderName, practiceName, message } = await req.json();

  try {
    await resend.emails.send({
      from: "PrintCrown <onboarding@resend.dev>",
      to: process.env.ADMIN_EMAIL!,
      subject: `New message on case ${orderName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <div style="background: #1A1A1A; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <h2 style="color: white; margin: 0; font-size: 18px;">
              Print<span style="color: #2563EB;">Crown</span>
            </h2>
          </div>
          <div style="border: 1px solid #E2E0D8; border-top: none; padding: 24px; border-radius: 0 0 12px 12px;">
            <p style="color: #6B6B6B; font-size: 13px; margin: 0 0 16px;">New message from practice</p>
            <div style="background: #F8F7F4; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
              <p style="margin: 0 0 4px; font-weight: 600; color: #1A1A1A;">${practiceName}</p>
              <p style="margin: 0; color: #4B4B4B; font-size: 14px;">${message}</p>
            </div>
            <p style="color: #9B9B9B; font-size: 12px; margin: 0 0 16px;">
              Case: <strong style="color: #1A1A1A;">${orderName}</strong> · #${orderId.slice(0, 6).toUpperCase()}
            </p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/orders/${orderId}"
              style="display: inline-block; background: #2563EB; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
              View case →
            </a>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}