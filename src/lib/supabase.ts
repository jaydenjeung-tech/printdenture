import { createBrowserClient } from "@supabase/ssr";
import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let browserClientKey: string | null = null;

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  );
}

/** Returns null when env vars are missing (avoids crashing the marketing site). */
export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;

  const fingerprint = `${url}::${key}`;
  if (browserClient && browserClientKey === fingerprint) {
    return browserClient;
  }

  browserClient = createBrowserClient(url, key);
  browserClientKey = fingerprint;
  return browserClient;
}

/** Required for order, admin, lab, and dashboard routes. */
export function createAppClient(): SupabaseClient {
  const client = createClient();
  if (!client) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }
  return client;
}

export const SUPABASE_SETUP_MESSAGE =
  "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local (local) or Vercel Environment Variables, then redeploy.";

export function isStaleAuthError(error: AuthError | null | undefined) {
  if (!error?.message) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("refresh token not found") || message.includes("invalid refresh token")
  );
}

function isAuthLockError(error: AuthError | null | undefined) {
  if (!error?.message) return false;
  const message = error.message.toLowerCase();
  return message.includes("lock") && message.includes("stole");
}

let pendingGetUser: Promise<{ user: User | null; error: AuthError | null }> | null = null;

export async function clearStaleAuthSession(supabase: SupabaseClient) {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch {
    // Ignore cleanup failures for already-invalid sessions.
  }
}

export async function getClientUser(supabase: SupabaseClient) {
  if (pendingGetUser) return pendingGetUser;

  pendingGetUser = (async () => {
    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data, error } = await supabase.auth.getUser();
        if (error && isStaleAuthError(error)) {
          await clearStaleAuthSession(supabase);
          return { user: null, error: null };
        }
        if (error && isAuthLockError(error) && attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
          continue;
        }
        return { user: data.user, error: error ?? null };
      }
      return { user: null, error: null };
    } finally {
      pendingGetUser = null;
    }
  })();

  return pendingGetUser;
}
