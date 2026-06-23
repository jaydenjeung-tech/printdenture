/** Stripe Dashboard deep links for admin payment management. */

export function isStripeTestMode(): boolean {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  return key.startsWith("sk_test_");
}

export function stripeDashboardPrefix(): string {
  return isStripeTestMode() ? "/test" : "";
}

export function stripeCheckoutSessionDashboardUrl(sessionId: string): string {
  return `https://dashboard.stripe.com${stripeDashboardPrefix()}/checkout/sessions/${sessionId}`;
}

export function stripePaymentDashboardUrl(paymentIntentId: string): string {
  return `https://dashboard.stripe.com${stripeDashboardPrefix()}/payments/${paymentIntentId}`;
}

export function stripeDashboardHomeUrl(): string {
  return `https://dashboard.stripe.com${stripeDashboardPrefix()}/payments`;
}
