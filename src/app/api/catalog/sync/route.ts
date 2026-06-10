import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { CURRENT_SITE } from "@/lib/products/site-catalog";
import { ensureSharedGuardProducts, syncPrintDentureCatalog } from "@/lib/products/sync-denture-catalog";

function getAdminSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin env vars are not configured");
  return createClient(url, key);
}

/** Bootstrap catalog — always restores shared guards; full denture seed on PrintDenture only. */
export async function POST() {
  try {
    const supabase = getAdminSupabase();
    const guardsInserted = await ensureSharedGuardProducts(supabase);

    if (CURRENT_SITE !== "printdenture") {
      return NextResponse.json({
        inserted: guardsInserted,
        updated: 0,
        retired: 0,
        guardsInserted,
        dentureSyncSkipped: true,
      });
    }

    const result = await syncPrintDentureCatalog(supabase);
    return NextResponse.json({
      ...result,
      guardsInserted,
      inserted: result.inserted + guardsInserted,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Catalog sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
