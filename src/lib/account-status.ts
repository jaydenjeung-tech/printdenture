export type AccountStatus = "pending" | "approved" | "rejected";

export function isAccountActive(status: AccountStatus | null | undefined): boolean {
  return !status || status === "approved";
}

export function accountStatusMessage(status: AccountStatus): string | null {
  if (status === "pending") {
    return "Your practice registration is pending admin approval. You will receive access once approved.";
  }
  if (status === "rejected") {
    return "Your practice registration was not approved. Contact support@printdenture.com for assistance.";
  }
  return null;
}
