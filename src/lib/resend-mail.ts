import { Resend } from "resend";

const DEFAULT_FROM_ADDRESS = "info@printdenture.com";

export function getResendFrom(name = "PrintDenture"): string {
  const configured = process.env.RESEND_FROM_EMAIL?.trim();
  if (configured?.includes("<")) return configured;
  if (configured) return `${name} <${configured}>`;
  return `${name} <${DEFAULT_FROM_ADDRESS}>`;
}

const LAB_MESSAGE_RECIPIENT = "haesung@idocdentallab.com";

/** Order-message and support alerts. Always includes the lab contact plus ADMIN_EMAIL. */
export function getMessageNotifyRecipients(adminEmail: string): string[] {
  const recipients = [adminEmail.trim(), LAB_MESSAGE_RECIPIENT];
  const seen = new Set<string>();
  return recipients.filter((email) => {
    const key = email.toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function resendErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Failed to send email";
}

export async function sendResendEmail(
  resend: Resend,
  payload: Parameters<Resend["emails"]["send"]>[0]
) {
  const { data, error } = await resend.emails.send(payload);
  if (error) {
    console.error("Resend send error:", error);
    return { ok: false as const, error };
  }
  return { ok: true as const, id: data?.id };
}
