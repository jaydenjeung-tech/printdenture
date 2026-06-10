import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export type AdminApiAuth =
  | { ok: true; userId: string; service: SupabaseClient }
  | { ok: false; status: number; error: string };

/** Verify session admin + return service-role client for catalog mutations. */
export async function requireAdminServiceClient(): Promise<AdminApiAuth> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !anonKey || !serviceKey) {
    return { ok: false, status: 500, error: "Server configuration error" };
  }

  const cookieStore = await cookies();
  const authClient = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });

  const {
    data: { user },
  } = await authClient.auth.getUser();
  if (!user) return { ok: false, status: 401, error: "Unauthorized" };

  const { data: profile } = await authClient
    .from("profiles")
    .select("role, is_admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin" || !!profile?.is_admin;
  if (!isAdmin) return { ok: false, status: 403, error: "Forbidden" };

  return { ok: true, userId: user.id, service: createClient(url, serviceKey) };
}
