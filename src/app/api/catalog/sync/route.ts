import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CURRENT_SITE } from "@/lib/products/site-catalog";
import { syncPrintDentureCatalog } from "@/lib/products/sync-denture-catalog";

function getAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars are not configured");
  return createClient(url, key);
}

/** Ensures PrintDenture catalog rows (incl. guards) exist with correct categories. */
export async function POST() {
  if (CURRENT_SITE !== "printdenture") {
    return NextResponse.json({ skipped: true });
  }

  try {
    const result = await syncPrintDentureCatalog(getAdminSupabase());
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Catalog sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
