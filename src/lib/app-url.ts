/** Canonical app URL for server-side links (Stripe, emails). */
export function getAppUrl(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  return "http://localhost:3000";
}

/** Origin for OAuth redirects — always the browser's current host in the client. */
export function getClientAppOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return getAppUrl();
}

/** Resolve redirect base from a server request (keeps user on PrintDenture, not Site URL fallback). */
export function getRequestOrigin(request: Request): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}
