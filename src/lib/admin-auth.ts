import { createAppClient, getClientUser } from "@/lib/supabase";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export type AdminAccess =
  | { ok: true; user: User; supabase: SupabaseClient }
  | { ok: false; reason: "unauthenticated" | "forbidden"; supabase: SupabaseClient };

/** Single auth + admin profile check (deduped getUser via getClientUser). */
export async function verifyAdminAccess(): Promise<AdminAccess> {
  const supabase = createAppClient();
  const { user } = await getClientUser(supabase);
  if (!user) return { ok: false, reason: "unauthenticated", supabase };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin" || !!profile?.is_admin;
  if (!isAdmin) return { ok: false, reason: "forbidden", supabase };

  return { ok: true, user, supabase };
}
