"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

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
};

const CATEGORIES = [
  { value: "zirconia", label: "Zirconia Crown", accent: "#2563EB" },
  { value: "printed", label: "Printed Crown", accent: "#16A34A" },
  { value: "nightguard", label: "Night Guard", accent: "#D97706" },
  { value: "sportsguard", label: "Sports Guard", accent: "#9333EA" },
];

const FIELD_OPTIONS = [
  { value: "shade", label: "Shade" },
  { value: "toothNumber", label: "Tooth Number" },
  { value: "guardType", label: "Guard Type" },
  { value: "color", label: "Color" },
];

const EMPTY: Omit<Product, "id"> = {
  category: "zirconia",
  name: "",
  description: "",
  price: 0,
  turnaround: "5–7 days",
  accent: "#2563EB",
  fields: ["shade", "toothNumber"],
  active: true,
  sort_order: 0,
};

export default function AdminProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth"); return; }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) { router.push("/dashboard"); return; }

    await loadProducts();
  }

  async function loadProducts() {
    const supabase = createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("sort_order");
    setProducts(data || []);
    setLoading(false);
  }

  function openAdd() {
    setForm(EMPTY);
    setEditing(null);
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
    });
    setEditing(p);
    setModal("edit");
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price) return;
    setSaving(true);
    const supabase = createClient();

    if (modal === "add") {
      const maxOrder = Math.max(0, ...products.map((p) => p.sort_order));
      await supabase.from("products").insert({ ...form, sort_order: maxOrder + 1 });
    } else if (modal === "edit" && editing) {
      await supabase.from("products").update(form).eq("id", editing.id);
    }

    await loadProducts();
    setSaving(false);
    setModal(null);
  }

  async function handleToggleActive(p: Product) {
    const supabase = createClient();
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, active: !x.active } : x));
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  }

  async function handleMoveOrder(p: Product, dir: "up" | "down") {
    const sorted = [...products].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex((x) => x.id === p.id);
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    const supabase = createClient();
    const a = sorted[idx];
    const b = sorted[swapIdx];
    await supabase.from("products").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("products").update({ sort_order: a.sort_order }).eq("id", b.id);
    await loadProducts();
  }

  function updateForm(k: keyof typeof form, v: string | number | boolean | string[]) {
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
    <div className="min-h-screen bg-[#F8F7F4]">
      {/* Header */}
      <div className="h-14 border-b border-[#E2E0D8] bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-[#1A1A1A] rounded-sm flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">PC</span>
          </div>
          <span className="font-semibold text-[#1A1A1A]">Print<span className="text-[#2563EB]">Crown</span></span>
          <span className="text-[#E2E0D8]">/</span>
          <span className="text-sm text-[#6B6B6B]">Admin · Products</span>
        </div>
        <Link href="/admin/orders" className="text-sm text-[#6B6B6B] hover:text-[#1A1A1A]">
  Orders
</Link>
        <button onClick={openAdd}

          className="h-9 px-4 bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-sm font-medium rounded-lg transition-all">
          + Add product
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {grouped.map((cat) => (
          <div key={cat.value} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full" style={{ background: cat.accent }} />
              <h2 className="text-sm font-semibold text-[#1A1A1A]">{cat.label}</h2>
              <span className="text-xs text-[#9B9B9B]">({cat.items.length})</span>
            </div>

            {cat.items.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#E2E0D8] text-center text-sm text-[#9B9B9B]">
                No products yet
              </div>
            ) : (
              <div className="space-y-2">
                {cat.items.map((p, idx) => (
                  <div key={p.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border bg-white transition-all
                      ${p.active ? "border-[#E2E0D8]" : "border-[#E2E0D8] opacity-50"}`}>

                    {/* Sort arrows */}
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => handleMoveOrder(p, "up")} disabled={idx === 0}
                        className="w-6 h-5 flex items-center justify-center text-[#C8C6BE] hover:text-[#1A1A1A] disabled:opacity-20 text-xs">
                        ▲
                      </button>
                      <button onClick={() => handleMoveOrder(p, "down")} disabled={idx === cat.items.length - 1}
                        className="w-6 h-5 flex items-center justify-center text-[#C8C6BE] hover:text-[#1A1A1A] disabled:opacity-20 text-xs">
                        ▼
                      </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm text-[#1A1A1A]">{p.name}</span>
                        {!p.active && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F0EEE8] text-[#9B9B9B] border border-[#E2E0D8]">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#9B9B9B] truncate">{p.description}</p>
                    </div>

                    {/* Price & turnaround */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-semibold text-sm text-[#1A1A1A]">${p.price}</p>
                      <p className="text-xs text-[#9B9B9B]">{p.turnaround}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => handleToggleActive(p)}
                        className={`h-8 px-3 rounded-lg text-xs border transition-all
                          ${p.active
                            ? "border-[#E2E0D8] text-[#6B6B6B] hover:border-[#D97706] hover:text-[#D97706]"
                            : "border-[#E2E0D8] text-[#9B9B9B] hover:border-[#16A34A] hover:text-[#16A34A]"
                          }`}>
                        {p.active ? "Deactivate" : "Activate"}
                      </button>
                      <button onClick={() => openEdit(p)}
                        className="h-8 px-3 rounded-lg text-xs border border-[#E2E0D8] text-[#6B6B6B] hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-all">
                        Edit
                      </button>
                      <button onClick={() => setDeleteConfirm(p.id)}
                        className="h-8 px-3 rounded-lg text-xs border border-[#E2E0D8] text-[#6B6B6B] hover:border-red-400 hover:text-red-500 transition-all">
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

      {/* Add / Edit Modal */}
      {modal && (
        <div style={{ minHeight: "100vh", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", inset: 0, zIndex: 50 }}>
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-[#1A1A1A] mb-6">
              {modal === "add" ? "Add product" : "Edit product"}
            </h3>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Category</label>
                <select value={form.category}
                  onChange={(e) => {
                    const cat = CATEGORIES.find((c) => c.value === e.target.value);
                    updateForm("category", e.target.value);
                    if (cat) updateForm("accent", cat.accent);
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A]">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Product name *</label>
                <input type="text" value={form.name} onChange={(e) => updateForm("name", e.target.value)}
                  placeholder="e.g. Full Contour Zirconia"
                  className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)}
                  rows={2} placeholder="Short product description..."
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm resize-none focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]" />
              </div>

              {/* Price & Turnaround */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Price ($) *</label>
                  <input type="number" value={form.price} onChange={(e) => updateForm("price", parseInt(e.target.value) || 0)}
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A]" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Turnaround</label>
                  <input type="text" value={form.turnaround} onChange={(e) => updateForm("turnaround", e.target.value)}
                    placeholder="5–7 days"
                    className="w-full h-10 px-3 rounded-lg border border-[#E2E0D8] bg-white text-[#1A1A1A] text-sm focus:outline-none focus:border-[#1A1A1A] placeholder:text-[#C8C6BE]" />
                </div>
              </div>

              {/* Fields */}
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Required fields</label>
                <div className="flex flex-wrap gap-2">
                  {FIELD_OPTIONS.map((f) => (
                    <button key={f.value} type="button" onClick={() => toggleField(f.value)}
                      className={`h-8 px-3 rounded-lg text-sm border transition-all
                        ${form.fields.includes(f.value)
                          ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                          : "bg-white text-[#4B4B4B] border-[#E2E0D8] hover:border-[#1A1A1A]"}`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => updateForm("active", !form.active)}
                  className={`w-10 h-6 rounded-full transition-all relative ${form.active ? "bg-[#1A1A1A]" : "bg-[#E2E0D8]"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.active ? "left-5" : "left-1"}`} />
                </div>
                <span className="text-sm text-[#4B4B4B]">Active (visible to customers)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)}
                className="flex-1 h-11 rounded-xl border border-[#E2E0D8] text-sm text-[#6B6B6B] hover:bg-[#F8F7F4] transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.price}
                className="flex-1 h-11 rounded-xl bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white text-sm font-medium transition-all disabled:opacity-40">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div style={{ minHeight: "100vh", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", position: "absolute", inset: 0, zIndex: 50 }}>
          <div className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 text-center">
            <p className="font-semibold text-[#1A1A1A] mb-2">Delete this product?</p>
            <p className="text-sm text-[#9B9B9B] mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 h-11 rounded-xl border border-[#E2E0D8] text-sm text-[#6B6B6B] hover:bg-[#F8F7F4] transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-all">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}