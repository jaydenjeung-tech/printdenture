export const DEFAULT_PROVIDER_INQUIRY_RECIPIENTS = [
  "haesung@idocdentallab.com",
  "dj@idocdentallab.com",
] as const;

export function getProviderInquiryRecipients(): string[] {
  const fromEnv = process.env.PROVIDER_INQUIRY_EMAILS?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return fromEnv?.length ? fromEnv : [...DEFAULT_PROVIDER_INQUIRY_RECIPIENTS];
}

export function escapeInquiryHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type ProviderDemoInquiry = {
  type: "demo";
  name: string;
  practice: string;
  email: string;
  phone?: string;
  state: string;
};

export type ProviderApplyInquiry = {
  type: "apply";
  name: string;
  credentials: string;
  practice: string;
  email: string;
  phone: string;
  location: string;
  motivation: string;
};

export type ProviderInquiry = ProviderDemoInquiry | ProviderApplyInquiry;

function requiredString(value: unknown, field: string): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed;
}

export function parseProviderInquiry(body: unknown): ProviderInquiry | { error: string } {
  if (!body || typeof body !== "object") return { error: "Invalid request body" };

  const data = body as Record<string, unknown>;
  const type = data.type;

  if (type === "demo") {
    const name = requiredString(data.name, "name");
    const practice = requiredString(data.practice, "practice");
    const email = requiredString(data.email, "email");
    const state = requiredString(data.state, "state");
    if (!name || !practice || !email || !state) {
      return { error: "Name, practice, email, and state are required" };
    }
    const phone = typeof data.phone === "string" ? data.phone.trim() : "";
    return { type: "demo", name, practice, email, phone: phone || undefined, state };
  }

  if (type === "apply") {
    const name = requiredString(data.name, "name");
    const credentials = requiredString(data.credentials, "credentials");
    const practice = requiredString(data.practice, "practice");
    const email = requiredString(data.email, "email");
    const phone = requiredString(data.phone, "phone");
    const location = requiredString(data.location, "location");
    const motivation = requiredString(data.motivation, "motivation");
    if (!name || !credentials || !practice || !email || !phone || !location || !motivation) {
      return { error: "All application fields are required" };
    }
    return { type: "apply", name, credentials, practice, email, phone, location, motivation };
  }

  return { error: "Invalid inquiry type" };
}
