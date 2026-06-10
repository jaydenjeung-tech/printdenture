import type { SupabaseClient } from "@supabase/supabase-js";
import { guardCategoryFixes } from "@/lib/products/guard-catalog";
import {
  dentureSeedCategoryFixes,
  dentureSeedsToInsert,
  dentureSeedsToRetire,
} from "@/lib/products/denture-seed";

export type CatalogSyncResult = {
  inserted: number;
  updated: number;
  retired: number;
};

/** Bootstrap catalog: category fixes, retire legacy SKUs, insert missing seed rows. Does not overwrite admin-edited prices. */
export async function syncPrintDentureCatalog(
  supabase: SupabaseClient
): Promise<CatalogSyncResult> {
  const { data: existing, error: loadError } = await supabase
    .from("products")
    .select("id, category, name, active");

  if (loadError) throw loadError;

  const rows = existing ?? [];
  let updated = 0;

  const seedCategoryFixes = dentureSeedCategoryFixes(rows);
  const categoryFixes = [
    ...seedCategoryFixes,
    ...guardCategoryFixes(rows).filter((fix) => !seedCategoryFixes.some((f) => f.id === fix.id)),
  ];

  for (const fix of categoryFixes) {
    const { error } = await supabase
      .from("products")
      .update({ category: fix.category })
      .eq("id", fix.id);
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
