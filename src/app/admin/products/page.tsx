"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createAppClient } from "@/lib/supabase";
import { verifyAdminAccess } from "@/lib/admin-auth";
import {
  type SiteId,
  defaultSitesForCategory,
  getProductSites,
  SITE_LABELS,
} from "@/lib/products/site-catalog";

type Product = {
  id: string;
  category: string;
  name: string;
  description: string;
  price: number;
  turnaround: string;
  accent: string;
  fields: string[];
  active: boolean;
  sort_order: number;
  sites?: string[] | null;
};

const CATEGORIES = [
  { value: "zirconia", label: "Zirconia Crown", accent: "#2563EB", group: "Crown" },
  { value: "printed", label: "Printed Crown", accent: "#16A34A", group: "Crown" },
  { value: "implant", label: "Implant Crown", accent: "#0EA5E9", group: "Crown" },
  { value: "nightguard", label: "Night Guard", accent: "#D97706", group: "Crown" },
  { value: "sportsguard", label: "Sports Guard", accent: "#9333EA", group: "Crown" },
  { value: "complete", label: "Complete Denture", accent: "#0F6E56", group: "Denture" },
  { value: "partial", label: "Partial Denture", accent: "#1D9E75", group: "Denture" },
  { value: "immediate", label: "Immediate Denture", accent: "#085041", group: "Denture" },
  { value: "overdenture", label: "Implant Overdenture", accent: "#378ADD", group: "Denture" },
  { value: "reline", label: "Reline & Repair", accent: "#1B2B3A", group: "Denture" },
  { value: "removable", label: "Removable Prosthetic", accent: "#243447", group: "Denture" },
  { value: "jb_tray", label: "JB Tray Case", accent: "#5DCAA5", group: "Denture" },
];

const FIELD_OPTIONS = [
  { value: "shade", label: "Shade" },
  { value: "toothNumber", label: "Tooth Number" },
  { value: "guardType", label: "Guard Type" },
  { value: "color", label: "Color" },
  { value: "arch", label: "Arch (U/L/Set)" },
  { value: "jawRelation", label: "Jaw relation" },
];

const SITES: SiteId[] = ["printcrown", "printdenture"];

const EMPTY: Omit<Product, "id"> = {
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

function SiteBadges({ sites }: { sites: SiteId[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {sites.map((s) => (
        <span
          key={s}
          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
            s === "printcrown"
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {SITE_LABELS[s]}
        </span>
      ))}
    </div>
  );
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    return () => { cancelled = true; };
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

  function openEdit(p: Product) {
    setForm({
      category: p.category,
      name: p.name,
      description: p.description,
      price: p.price,
      turnaround: p.turnaround,
      accent: p.accent,
      fields: p.fields,
      active: p.active,
      sort_order: p.sort_order,
      sites: getProductSites(p),
    });
    setEditing(p);
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
        error.message.includes("sites")
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

  async function handleToggleActive(p: Product) {
    const supabase = createAppClient();
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
  }

  async function handleDelete(id: string) {
    const supabase = createAppClient();
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  }

  async function handleMoveOrder(p: Product, dir: "up" | "down") {
    const sorted = [...products].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === p.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const supabase = createAppClient();
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await supabase.from("products").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("products").update({ sort_order: a.sort_order }).eq("id", b.id);
    await loadProducts();
  }

  function updateForm<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function toggleField(f: string) {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.includes(f)
        ? prev.fields.filter((x) => x !== f)
        : [...prev.fields, f],
    }));
  }

  function toggleSite(site: SiteId) {
    setForm((prev) => {
      const current = prev.sites ?? [];
      const next = current.includes(site)
        ? current.filter((s) => s !== site)
        : [...current, site];
      return { ...prev, sites: next };
    });
  }

  function onCategoryChange(category: string) {
    const cat = CATEGORIES.find((c) => c.value === category);
    updateForm("category", category);
    if (cat) updateForm("accent", cat.accent);
    updateForm("sites", defaultSitesForCategory(category));
  }

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: products.filter((p) => p.category === cat.value),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
        <p className="text-[#9B9B9B] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-4xl w-full mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Products</h1>
            <p className="text-sm text-[#6B6B6B] mt-1 max-w-xl leading-relaxed">
              Shared catalog for PrintCrown and PrintDenture. Use{" "}
              <strong>Visible on</strong> to control which site shows each product.
            </p>
          </div>
          <button
            type="button"
            onClick={openAdd}
            className="h-9 px-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-sm font-medium rounded-lg transition-all shrink-0"
          >
            + Add product
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-3 text-[12px]">
          <span className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            PrintCrown — crown, implant, guards
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            PrintDenture — denture, removable
          </span>
        </div>

        {grouped.map((cat) => (
          <div key={cat.value} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ background: cat.accent }} />
              <h2 className="text-sm font-semibold text-[#1A1A1A]">{cat.label}</h2>
              <span className="text-[10px] text-[#9B9B9B] uppercase tracking-wide">{cat.group}</span>
              <span className="text-xs text-[#9B9B9B]">({cat.items.length})</span>
            </div>

            {cat.items.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#E2E0D8] text-center text-sm text-[#9B9B9B]">
                No products yet
              </div>
            ) : (
              <div className="space-y-2">
                {cat.items.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border bg-white transition-all
                      ${p.active ? "border-[#E2E0D8]" : "border-[#E2E0D8] opacity-50"}`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(p, "up")}
                        disabled={idx === 0}
                        className="w-6 h-5 flex items-center justify-center text-[#C8C6BE] hover:text-[#1A1A1A] disabled:opacity-20 text-xs"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(p, "down")}
                        disabled={idx === cat.items.length - 1}
                        className="w-6 h-5 flex items-center justify-center text-[#C8C6BE] hover:text-[#1A1A1A] disabled:opacity-20 text-xs"
                      >
                        ▼
                      </button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-[#1A1A1A]">{p.name}</span>
                        {!p.active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0EEE8] text-[#9B9B9B] border border-[#E2E0D8]">
                            Inactive
                          </span>
                        )}
                      </div>
                      <SiteBadges sites={getProductSites(p)} />
                      <p className="text-xs text-[#9B9B9B] truncate mt-1">{p.description}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm text-[#1A1A1A]">${p.price}</p>
                      <p className="text-xs text-[#9B9B9B]">{p.turnaround}</p>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(p)}
                        className={`h-8 px-3 rounded-lg text-xs border transition-all
                          ${p.active
                            ? "border-[#E2E0D8] text-[#6B6B6B] hover:border-[#D97706] hover:text-[#D97706]"
                            : "border-[#E2E0D8] text-[#9B9B9B] hover:border-[#16A34A] hover:text-[#16A34A]"
                          }`}
                      >
                        {p.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="h-8 px-3 rounded-lg text-xs border border-[#E2E0D8] text-[#6B6B6B] hover:border-[#1A1A1A]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(p.id)}
                        className="h-8 px-3 rounded-lg text-xs border border-[#E2E0D8] text-[#6B6B6B] hover:border-red-400 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">
              {modal === "add" ? "Add product" : "Edit product"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-sm focus:outline-none focus:border-[#1A1A1A]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label} ({c.group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Visible on *</label>
                <div className="flex flex-wrap gap-2">
                  {SITES.map((site) => (
                    <button
                      key={site}
                      type="button"
                      onClick={() => toggleSite(site)}
                      className={`h-9 px-4 rounded-lg text-sm border transition-all ${
                        form.sites?.includes(site)
                          ? site === "printcrown"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-emerald-700 text-white border-emerald-700"
                          : "bg-white text-[#4B4B4B] border-[#E2E0D8]"
                      }`}
                    >
                      {SITE_LABELS[site]}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#9B9B9B] mt-1.5">
                  Category changes apply suggested defaults; you can override either site.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Product name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] text-sm focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E2E0D8] text-sm resize-none focus:outline-none focus:border-[#1A1A1A]"
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Price ($) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateForm("price", parseInt(e.target.value, 10) || 0)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Turnaround</label>
                  <input
                    type="text"
                    value={form.turnaround}
                    onChange={(e) => updateForm("turnaround", e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Required fields</label>
                <div className="flex flex-wrap gap-2">
                  {FIELD_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => toggleField(f.value)}
                      className={`h-8 px-3 rounded-lg text-sm border ${
                        form.fields.includes(f.value)
                          ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                          : "bg-white border-[#E2E0D8]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => updateForm("active", !form.active)}
                  onKeyDown={(e) => e.key === "Enter" && updateForm("active", !form.active)}
                  className={`w-10 h-6 rounded-full relative ${form.active ? "bg-[#1A1A1A]" : "bg-[#E2E0D8]"}`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.active ? "left-5" : "left-1"}`}
                  />
                </div>
                <span className="text-sm text-[#4B4B4B]">Active</span>
              </label>

              {saveError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {saveError}
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 h-11 rounded-xl border border-[#E2E0D8] text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.price}
                className="flex-1 h-11 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium disabled:opacity-40"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <p className="font-semibold mb-2">Delete this product?</p>
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setDeleteConfirm(null)} className="flex-1 h-11 rounded-xl border">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 h-11 rounded-xl bg-red-500 text-white text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
