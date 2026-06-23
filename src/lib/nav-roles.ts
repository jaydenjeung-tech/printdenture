import { DESIGN_PARTNER_ROLE } from "@/lib/partner-auth";

export type AppNavRole = "user" | "lab" | "admin" | "partner";

export function resolveAppNavRole(profile: {
  role?: string | null;
  is_admin?: boolean | null;
} | null): AppNavRole {
  if (profile?.is_admin || profile?.role === "admin") return "admin";
  if (profile?.role === "lab") return "lab";
  if (profile?.role === DESIGN_PARTNER_ROLE) return "partner";
  return "user";
}
