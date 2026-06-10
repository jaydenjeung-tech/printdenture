"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { createAppClient, getClientUser } from "@/lib/supabase";
import { SHIPPING_CARRIER, SHIPPING_FLAT_RATE } from "@/lib/shipping";
import { JbProtocolChooser } from "@/components/jb-protocol-chooser";
import {
  EQUIPMENT_FAMILIES,
  EQUIPMENT_SHOP_ATTRIBUTION,
  groupProductsByFamily,
  getVariantBadge,
  getVariantShortLabel,
  parseShopFamilyParam,
  SHOP_QUANTITY_MAX,
  SHOP_QUANTITY_MIN,
  type EquipmentFamilyId,
  type ShopProduct,
} from "@/lib/equipment-shop";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  const grouped = useMemo(() => groupProductsByFamily(products), [products]);

  const initialFamily = parseShopFamilyParam(searchParams.get("family")) ?? "jb_tray";
  const [activeFamily, setActiveFamily] = useState<EquipmentFamilyId>(initialFamily);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const familyMeta = EQUIPMENT_FAMILIES.find((f) => f.id === activeFamily)!;
  const familyProducts = grouped[activeFamily] ?? [];
  const selected =
    familyProducts.find((p) => p.id === selectedId) ?? familyProducts[0] ?? null;

  const subtotal = selected ? selected.price * quantity : 0;
  const total = subtotal + SHIPPING_FLAT_RATE;

  useEffect(() => {
    if (searchParams.get("equipment") === "ordered") {
      const kind = searchParams.get("kind");
      const label =
        kind === "jb_tray"
          ? "JB Tray"
          : kind === "jb_fork"
            ? "JB Fork"
            : kind === "pop_bow"
              ? "ADD POP Bow"
              : "Equipment";
      setBanner(`${label} order confirmed. Mark it as received on your dashboard when it arrives.`);
    }
  }, [searchParams]);

  useEffect(() => {
    const family = parseShopFamilyParam(searchParams.get("family"));
    if (family) setActiveFamily(family);
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const supabase = createAppClient();
      const { user } = await getClientUser(supabase);
      if (!user) {
        router.replace("/auth?next=%2Fshop");
        return;
      }

      const { data } = await supabase
        .from("products")
        .select("id, name, description, price, turnaround, accent, fields")
        .eq("active", true)
        .eq("category", "equipment")
        .order("sort_order");

      setProducts((data as ShopProduct[]) || []);
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    const list = grouped[activeFamily];
    if (!list.length) return;
    setSelectedId((prev) => (prev && list.some((p) => p.id === prev) ? prev : list[0].id));
    setQuantity(1);
  }, [activeFamily, grouped]);

  async function handleCheckout() {
    if (!selected) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/equipment-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selected.id,
          quantity,
          returnTo: `/shop?family=${activeFamily}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (e) {
      alert(e instanceof Error ? e.message : "Checkout failed");
      setCheckingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4]">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 pt-24 pb-16">
        <p className="text-[11px] font-medium text-[#0F6E56] uppercase tracking-[0.08em] mb-2">
          PrintDenture supply
        </p>
        <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">JB Tray, JB Fork & ADD POP Bow</h1>
        <p className="text-[#6B6B6B] mb-6 leading-relaxed max-w-2xl">
          Not sure which kit? Use the guide below — most visits use Fork or Tray alone, but PNUADD
          also teaches sequential workflows where both help. When your kit arrives, mark received on
          your{" "}
          <Link href="/dashboard" className="text-[#0F6E56] font-medium hover:underline">
            dashboard
          </Link>
          , capture records, then submit from{" "}
          <Link href="/order" className="text-[#0F6E56] font-medium hover:underline">
            New lab case
          </Link>
          . Flat-rate {SHIPPING_CARRIER} shipping (${SHIPPING_FLAT_RATE}).
        </p>

        <JbProtocolChooser
          variant="shop"
          activeFamily={activeFamily}
          onSelectFamily={setActiveFamily}
          className="mb-8"
        />

        {banner && (
          <div className="mb-6 rounded-xl border border-[#9FE1CB] bg-[#E1F5EE]/50 px-4 py-3 text-sm text-[#085041]">
            {banner}
          </div>
        )}

        {loading ? (
          <p className="text-sm text-[#9B9B9B] py-12 text-center">Loading equipment…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
            <div className="space-y-5">
              {/* Family tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {EQUIPMENT_FAMILIES.map((family) => {
                  const active = family.id === activeFamily;
                  const count = grouped[family.id]?.length ?? 0;
                  return (
                    <button
                      key={family.id}
                      type="button"
                      onClick={() => setActiveFamily(family.id)}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        active
                          ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm"
                          : "bg-white text-[#6B6B6B] border-[#E2E0D8] hover:border-[#1A1A1A]/40"
                      }`}
                    >
                      <p className="text-sm font-semibold">{family.label}</p>
                      <p className={`text-xs mt-1 ${active ? "text-white/75" : "text-[#9B9B9B]"}`}>
                        {count} option{count !== 1 ? "s" : ""}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Family hero */}
              <div className="rounded-2xl border border-[#E2E0D8] bg-white p-5 flex gap-4">
                <div
                  className="w-24 h-24 rounded-xl bg-cover bg-center shrink-0 border border-[#E2E0D8]"
                  style={{ backgroundImage: `url(${familyMeta.image})` }}
                />
                <div>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">{familyMeta.label}</h2>
                  <p className="text-sm text-[#6B6B6B] mt-1 leading-relaxed">{familyMeta.description}</p>
                  <ul className="mt-2 space-y-0.5">
                    {familyMeta.variantHints.map((hint) => (
                      <li key={hint} className="text-xs text-[#0F6E56]">
                        · {hint}
                      </li>
                    ))}
                  </ul>
                  {familyMeta.orderHint && (
                    <p className="text-xs text-[#6B6B6B] mt-3 leading-relaxed border-t border-[#E2E0D8] pt-3">
                      {familyMeta.orderHint}
                    </p>
                  )}
                </div>
              </div>

              {/* Variant options */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B] mb-3">
                  Choose option
                </p>
                <div className="space-y-2">
                  {familyProducts.map((product) => {
                    const isSelected = selected?.id === product.id;
                    const badge = getVariantBadge(product.fields);
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setSelectedId(product.id);
                          setQuantity(1);
                        }}
                        className={`w-full text-left rounded-xl border p-4 transition-all ${
                          isSelected
                            ? "border-[#0F6E56] bg-[#E1F5EE]/30 ring-2 ring-[#0F6E56]/15"
                            : "border-[#E2E0D8] bg-white hover:border-[#0F6E56]/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-semibold text-[#1A1A1A]">
                                {getVariantShortLabel(product.fields)}
                              </p>
                              {badge && (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#0F6E56]/10 text-[#085041] border border-[#9FE1CB]">
                                  {badge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">{product.description}</p>
                          </div>
                          <p className="text-base font-semibold text-[#1A1A1A] shrink-0">${product.price}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity */}
              {selected && (
                <div className="rounded-xl border border-[#E2E0D8] bg-white p-4">
                  <p className="text-sm font-medium text-[#1A1A1A] mb-3">Quantity</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(SHOP_QUANTITY_MIN, q - 1))}
                        disabled={quantity <= SHOP_QUANTITY_MIN}
                        className="w-9 h-9 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] font-semibold text-[#1A1A1A] disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-semibold text-[#1A1A1A]">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(SHOP_QUANTITY_MAX, q + 1))}
                        disabled={quantity >= SHOP_QUANTITY_MAX}
                        className="w-9 h-9 rounded-lg border border-[#E2E0D8] bg-[#F8F7F4] font-semibold text-[#1A1A1A] disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-[#9B9B9B]">
                      {quantity === 1 ? "1 unit" : `${quantity} units`}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Order summary */}
            <div className="lg:sticky lg:top-24 rounded-2xl border border-[#E2E0D8] bg-white p-5 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9B9B9B]">Order summary</p>
              {selected ? (
                <>
                  <div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">{selected.name}</p>
                    <p className="text-xs text-[#9B9B9B] mt-1">
                      {getVariantShortLabel(selected.fields)} · Qty {quantity}
                    </p>
                  </div>
                  <div className="space-y-1.5 text-sm border-t border-[#F0EEE8] pt-3">
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>
                        ${selected.price} × {quantity}
                      </span>
                      <span>${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Shipping ({SHIPPING_CARRIER})</span>
                      <span>${SHIPPING_FLAT_RATE}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#1A1A1A] pt-1">
                      <span>Total</span>
                      <span>${total}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#9B9B9B]">{selected.turnaround}</p>
                  <Button
                    className="w-full h-11 rounded-xl bg-[#0F6E56] hover:bg-[#085041] text-white"
                    disabled={checkingOut}
                    onClick={handleCheckout}
                  >
                    {checkingOut ? "Redirecting to checkout…" : `Checkout · $${total}`}
                  </Button>
                </>
              ) : (
                <p className="text-sm text-[#9B9B9B]">No products available.</p>
              )}
              <Link
                href="/order"
                className="block text-center text-xs text-[#378ADD] hover:underline font-medium"
              >
                ← Back to lab case order
              </Link>
            </div>
          </div>
        )}

        <p className="text-[11px] text-[#9B9B9B] leading-relaxed mt-8 max-w-2xl">
          {EQUIPMENT_SHOP_ATTRIBUTION}
        </p>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center">
          <p className="text-sm text-[#9B9B9B]">Loading…</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
