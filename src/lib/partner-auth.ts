import { createAppClient, getClientUser } from "@/lib/supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export const DESIGN_PARTNER_ROLE = "design_partner";

export type PartnerAccess =
  | { ok: true; user: User; supabase: SupabaseClient; isAdmin: boolean }
  | { ok: false; reason: "unauthenticated" | "forbidden"; supabase: SupabaseClient };

export function isDesignPartnerRole(role: string | null | undefined): boolean {
  return role === DESIGN_PARTNER_ROLE;
}

function isAdminProfile(profile: { role?: string | null; is_admin?: boolean | null } | null) {
  return profile?.role === "admin" || !!profile?.is_admin;
}

/** Client-side partner session check. */
export async function verifyPartnerAccess(): Promise<PartnerAccess> {
  const supabase = createAppClient();
  const { user } = await getClientUser(supabase);
  if (!user) return { ok: false, reason: "unauthenticated", supabase };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single();

  if (!isDesignPartnerRole(profile?.role) && !isAdminProfile(profile)) {
    return { ok: false, reason: "forbidden", supabase };
  }

  return { ok: true, user, supabase, isAdmin: isAdminProfile(profile) };
}

/** Whether a partner user can access an outsourced order. */
export function partnerCanAccessOrder(
  order: {
    design_outsource_partner_id?: string | null;
    design_outsource_email?: string | null;
    design_outsource_status?: string | null;
  },
  userId: string,
  userEmail: string | null | undefined
): boolean {
  if (order.design_outsource_status !== "sent" && order.design_outsource_status !== "completed") {
    return false;
  }
  if (order.design_outsource_partner_id) {
    return order.design_outsource_partner_id === userId;
  }
  if (
    order.design_outsource_email &&
    userEmail &&
    order.design_outsource_email.trim().toLowerCase() === userEmail.trim().toLowerCase()
  ) {
    return true;
  }
  // Queued for outsource but no linked portal account — show to any design partner (single-partner lab).
  return true;
}
