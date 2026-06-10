import type { SupabaseClient } from "@supabase/supabase-js";
import {
  dentureSeedCategoryFixes,
  dentureSeedsToInsert,
  dentureSeedsToRetire,
  dentureSeedUpdates,
} from "@/lib/products/denture-seed";

export type CatalogSyncResult = {
  inserted: number;
  updated: number;
  retired: number;
};

/** Idempotent: align catalog with seed definitions, retire arch-split SKUs, insert missing rows. */
export async function syncPrintDentureCatalog(
  supabase: SupabaseClient
): Promise<CatalogSyncResult> {
  const { data: existing, error: loadError } = await supabase
    .from("products")
    .select("id, category, name, active");

  if (loadError) throw loadError;

  const rows = existing ?? [];
  let updated = 0;

  for (const fix of dentureSeedCategoryFixes(rows)) {
    const { error } = await supabase
      .from("products")
      .update({ category: fix.category })
      .eq("id", fix.id);
    if (error) throw error;
    updated += 1;
  }

  for (const { id, seed } of dentureSeedUpdates(rows)) {
    const { error } = await supabase
      .from("products")
      .update({
        category: seed.category,
        description: seed.description,
        price: seed.price,
        turnaround: seed.turnaround,
        accent: seed.accent,
        fields: seed.fields,
        active: seed.active,
        sort_order: seed.sort_order,
        sites: seed.sites,
      })
      .eq("id", id);
    if (error) throw error;
    updated += 1;
  }

  const retireIds = dentureSeedsToRetire(rows);
  if (retireIds.length > 0) {
    const { error } = await supabase
      .from("products")
      .update({ active: false })
      .in("id", retireIds);
    if (error) throw error;
  }

  const pending = dentureSeedsToInsert(rows);
  if (pending.length > 0) {
    const { error } = await supabase.from("products").insert(pending);
    if (error) throw error;
  }

  return { inserted: pending.length, updated, retired: retireIds.length };
}
