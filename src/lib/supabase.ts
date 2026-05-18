import { createBrowserClient } from "@supabase/ssr";
import type { AuthError, SupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export function isStaleAuthError(error: AuthError | null | undefined) {
  if (!error?.message) return false;
  const message = error.message.toLowerCase();
  return message.includes("refresh token not found")
    || message.includes("invalid refresh token");
}

export async function clearStaleAuthSession(supabase: SupabaseClient) {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Ignore cleanup failures for already-invalid sessions.
  }
}

export async function getClientUser(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.getUser();
  if (error && isStaleAuthError(error)) {
    await clearStaleAuthSession(supabase);
    return { user: null, error: null };
  }
  return { user: data.user, error };
}