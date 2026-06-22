"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import { getProductSites, type SiteId } from "@/lib/products/site-catalog";
import {
  AdminNotice,
  AdminProductCategorySection,
  AdminProductDeleteModal,
  AdminProductFormModal,
  AdminProductsHeader,
  AdminProductsLegend,
  AdminProductsLoading,
  applyCategoryDefaults,
  type AdminCategory,
  type AdminProduct,
  type AdminProductForm,
} from "@/components/admin/admin-products-ui";

const CATEGORIES: AdminCategory[] = [
  { value: "complete", label: "Complete (JB Fork)", accent: "#0F6E56", group: "Complete" },
  { value: "jb_tray", label: "Complete (JB Tray)", accent: "#5DCAA5", group: "Complete" },
  { value: "immediate", label: "Complete (Immediate)", accent: "#085041", group: "Complete" },
  { value: "partial", label: "Partial", accent: "#1D9E75", group: "Partial" },
  { value: "overdenture", label: "Overdenture / All-on-X", accent: "#378ADD", group: "Overdenture" },
  { value: "reline", label: "Reline / repair", accent: "#1B2B3A", group: "Reline / repair" },
  { value: "equipment", label: "Chairside Equipment", accent: "#0F6E56", group: "Equipment" },
  { value: "zirconia", label: "Zirconia Crown", accent: "#2563EB", group: "Crown" },
  { value: "printed", label: "Printed Crown", accent: "#16A34A", group: "Crown" },
  { value: "implant", label: "Implant Crown", accent: "#0EA5E9", group: "Crown" },
  { value: "nightguard", label: "Night Guard", accent: "#D97706", group: "Guards (shared)" },
  { value: "sportsguard", label: "Sports Guard", accent: "#9333EA", group: "Guards (shared)" },
];

const FIELD_OPTIONS = [
  { value: "shade", label: "Shade" },
  { value: "toothNumber", label: "Tooth Number" },
  { value: "guardType", label: "Guard Type" },
  { value: "color", label: "Color" },
  { value: "arch", label: "Arch (U/L/Set)" },
  { value: "jawRelation", label: "Jaw relation" },
  { value: "jbTray", label: "JB Tray (family)" },
  { value: "jbFork", label: "JB Fork (family)" },
  { value: "trayBox", label: "JB Tray box (5 sets)" },
  { value: "forkBox", label: "Fork box (10 EA)" },
  { value: "popBow", label: "ADD POP Bow (family)" },
  { value: "popBowPouch", label: "POP Bow pouch (12 sets)" },
];

const SITES: SiteId[] = ["printcrown", "printdenture"];
const BOTH_SITES: SiteId[] = ["printcrown", "printdenture"];

const EMPTY: AdminProductForm = {
  category: "complete",
  name: "",
  description: "",
  price: 0,
  turnaround: "7–12 days",
  accent: "#0F6E56",
  fields: ["shade", "arch"],
  active: true,
  sort_order: 0,
  sites: ["printdenture"],
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<AdminProductForm>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const access = await verifyAdminAccess();
      if (cancelled) return;
      if (!access.ok) {
        router.push(access.reason === "unauthenticated" ? "/auth" : "/dashboard");
        return;
      }
      await loadProducts();
    })();
    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadProducts() {
    const supabase = createAppClient();
    const { data, error } = await supabase.from("products").select("*").order("sort_order");
    if (error) console.error(error);
    setProducts(data || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(EMPTY);
    setEditing(null);
    setSaveError(null);
    setModal("add");
  }

  function openEdit(product: AdminProduct) {
    setForm({
      category: product.category,
      name: product.name,
      description: product.description,
      price: product.price,
      turnaround: product.turnaround,
      accent: product.accent,
      fields: product.fields,
      active: product.active,
      sort_order: product.sort_order,
      sites: getProductSites(product),
    });
    setEditing(product);
    setSaveError(null);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price) return;
    if (!form.sites?.length) {
      setSaveError("Select at least one storefront.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    const supabase = createAppClient();
    const payload = { ...form, sites: form.sites };

    let error;
    if (modal === "add") {
      const maxOrder = Math.max(0, ...products.map((p) => p.sort_order));
      ({ error } = await supabase.from("products").insert({ ...payload, sort_order: maxOrder + 1 }));
    } else if (modal === "edit" && editing) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editing.id));
    }

    if (error) {
      setSaveError(
        error.message.includes("relation") && error.message.includes("products")
          ? "Create the products table in Supabase (run supabase/migrations/20250609_printdenture_products_seed.sql)."
          : error.message.includes("sites")
            ? "Add the products.sites column in Supabase (see supabase/migrations/20250604_products_sites.sql)."
            : error.message
      );
      setSaving(false);
      return;
    }

    await loadProducts();
    setSaving(false);
    setModal(null);
  }

  async function handleToggleActive(product: AdminProduct) {
    const supabase = createAppClient();
    await supabase.from("products").update({ active: !product.active }).eq("id", product.id);
    setProducts((prev) => prev.map((x) => (x.id === product.id ? { ...x, active: !x.active } : x)));
  }

  async function handleDelete(id: string) {
    setActionError(null);

    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setActionError(typeof body.error === "string" ? body.error : "Delete failed.");
        setDeleteConfirm(null);
        return;
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch {
      setActionError("Delete failed. Check your connection and try again.");
      setDeleteConfirm(null);
    }
  }

  async function handleRestoreGuards() {
    setSeeding(true);
    setSeedMessage(null);

    try {
      const res = await fetch("/api/catalog/ensure-guards", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setSeedMessage(body.error ?? "Guard restore failed.");
        setSeeding(false);
        return;
      }

      await loadProducts();
      setSeeding(false);
      setSeedMessage(
        body.inserted > 0
          ? `Restored ${body.inserted} guard product${body.inserted === 1 ? "" : "s"} (Night Guard & Sports Guard, both sites).`
          : "Night Guard and Sports Guard are already in the catalog."
      );
    } catch {
      setSeedMessage("Guard restore failed.");
      setSeeding(false);
    }
  }

  async function handleSeedDentureCatalog() {
    setSeeding(true);
    setSeedMessage(null);

    try {
      const res = await fetch("/api/catalog/sync", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setSeedMessage(body.error ?? "Catalog sync failed.");
        setSeeding(false);
        return;
      }

      await loadProducts();
      setSeeding(false);
      const parts: string[] = [];
      if (body.guardsInserted > 0) {
        parts.push(`restored ${body.guardsInserted} guard product${body.guardsInserted === 1 ? "" : "s"}`);
      }
      if (body.updated > 0) parts.push(`fixed ${body.updated} categor${body.updated === 1 ? "y" : "ies"}`);
      if (body.inserted > 0) parts.push(`added ${body.inserted} product${body.inserted === 1 ? "" : "s"}`);
      setSeedMessage(parts.length > 0 ? `${parts.join("; ")}.` : "Catalog is up to date.");
    } catch {
      setSeedMessage("Catalog sync failed.");
      setSeeding(false);
    }
  }

  async function handleMoveOrder(product: AdminProduct, dir: "up" | "down", categoryItems: AdminProduct[]) {
    const idx = categoryItems.findIndex((x) => x.id === product.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= categoryItems.length) return;

    const supabase = createAppClient();
    const a = categoryItems[idx];
    const b = categoryItems[swapIdx];
    await supabase.from("products").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("products").update({ sort_order: a.sort_order }).eq("id", b.id);
    await loadProducts();
  }

  function updateForm<K extends keyof AdminProductForm>(key: K, value: AdminProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleField(field: string) {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter((x) => x !== field)
        : [...prev.fields, field],
    }));
  }

  function toggleSite(site: SiteId) {
    setForm((prev) => {
      const current = prev.sites ?? [];
      const next = current.includes(site) ? current.filter((s) => s !== site) : [...current, site];
      return { ...prev, sites: next };
    });
  }

  function onCategoryChange(category: string) {
    setForm((prev) => ({ ...prev, ...applyCategoryDefaults(category, CATEGORIES) }));
  }

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: products.filter((p) => p.category === cat.value),
  }));

  if (loading) {
    return <AdminProductsLoading />;
  }

  return (
    <>
      <div className="max-w-5xl w-full">
        <AdminProductsHeader
          onRestoreGuards={() => void handleRestoreGuards()}
          onSeedCatalog={() => void handleSeedDentureCatalog()}
          onAdd={openAdd}
          seeding={seeding}
        />

        {seedMessage && <AdminNotice variant="success">{seedMessage}</AdminNotice>}
        {actionError && <AdminNotice variant="error">{actionError}</AdminNotice>}

        <AdminProductsLegend />

        {grouped.map((cat) => (
          <AdminProductCategorySection
            key={cat.value}
            category={cat}
            items={cat.items}
            onMoveUp={(product) => void handleMoveOrder(product, "up", cat.items)}
            onMoveDown={(product) => void handleMoveOrder(product, "down", cat.items)}
            onToggleActive={(product) => void handleToggleActive(product)}
            onEdit={openEdit}
            onDelete={(product) => setDeleteConfirm(product.id)}
          />
        ))}
      </div>

      {modal && (
        <AdminProductFormModal
          mode={modal}
          form={form}
          categories={CATEGORIES}
          fieldOptions={FIELD_OPTIONS}
          sites={SITES}
          saving={saving}
          saveError={saveError}
          onClose={() => setModal(null)}
          onSave={() => void handleSave()}
          onChange={updateForm}
          onToggleField={toggleField}
          onToggleSite={toggleSite}
          onSetBothSites={() => updateForm("sites", [...BOTH_SITES])}
          onCategoryChange={onCategoryChange}
        />
      )}

      {deleteConfirm && (
        <AdminProductDeleteModal
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={() => void handleDelete(deleteConfirm)}
        />
      )}
    </>
  );
}
