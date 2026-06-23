import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import {
  escapeInquiryHtml,
  getProviderInquiryRecipients,
  parseProviderInquiry,
  type ProviderInquiry,
} from "@/lib/provider-inquiry";

function inquiryEmailHtml(inquiry: ProviderInquiry): { subject: string; html: string } {
  if (inquiry.type === "demo") {
    const rows: [string, string][] = [
      ["Name", inquiry.name],
      ["Practice", inquiry.practice],
      ["Email", inquiry.email],
      ["Phone", inquiry.phone || "—"],
      ["State", inquiry.state],
    ];
    return {
      subject: `Clinical demo request — ${inquiry.practice}`,
      html: buildEmailHtml("Clinical demo request", rows, {
        footer:
          "Follow up: contact this practice within 2 business days, confirm first case type and records checklist, and provide step-by-step case guidance before their first portal order.",
      }),
    };
  }

  const rows: [string, string][] = [
    ["Name", inquiry.name],
    ["Credentials", inquiry.credentials],
    ["Practice", inquiry.practice],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["City, State", inquiry.location],
    ["Motivation", inquiry.motivation],
  ];
  return {
    subject: `Provider program application — ${inquiry.practice}`,
    html: buildEmailHtml("Provider program application", rows),
  };
}

function buildEmailHtml(
  title: string,
  rows: [string, string][],
  options?: { footer?: string }
): string {
  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 12px 8px 0;font-size:12px;color:#6B6B6B;vertical-align:top;white-space:nowrap;">${escapeInquiryHtml(label)}</td>
          <td style="padding:8px 0;font-size:14px;color:#1A1A1A;vertical-align:top;">${escapeInquiryHtml(value).replace(/\n/g, "<br>")}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;">
      <div style="background:#1A1A1A;padding:20px 24px;border-radius:12px 12px 0 0;">
        <h2 style="color:white;margin:0;font-size:18px;">
          Print<span style="color:#0F6E56;">Denture</span>
        </h2>
      </div>
      <div style="border:1px solid #E2E0D8;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
        <p style="color:#6B6B6B;font-size:13px;margin:0 0 16px;">${escapeInquiryHtml(title)}</p>
        <table style="width:100%;border-collapse:collapse;">${tableRows}</table>
        ${
          options?.footer
            ? `<p style="margin:20px 0 0;padding:12px 14px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;font-size:13px;color:#92400E;line-height:1.5;">${escapeInquiryHtml(options.footer)}</p>`
            : ""
        }
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email is not configured" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = parseProviderInquiry(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const recipients = getProviderInquiryRecipients();
  const { subject, html } = inquiryEmailHtml(parsed);

  try {
    const resend = new Resend(resendKey);
    await resend.emails.send({
      from: "PrintDenture <onboarding@resend.dev>",
      to: recipients,
      replyTo: parsed.email,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Provider inquiry email error:", error);
    return NextResponse.json({ error: "Failed to send inquiry" }, { status: 500 });
  }
}
