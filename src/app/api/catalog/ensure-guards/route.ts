import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ensureSharedGuardProducts } from "@/lib/products/sync-denture-catalog";

function getAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars are not configured");
  return createClient(url, key);
}

/** Restore shared Night Guard & Sports Guard rows if an admin deleted them. */
export async function POST() {
  try {
    const inserted = await ensureSharedGuardProducts(getAdminSupabase());
    return NextResponse.json({ inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Guard restore failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
