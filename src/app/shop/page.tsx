"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  ShopCartPanel,
  ShopLoadingState,
  ShopPageHeader,
  shopFamilyTabClass,
  shopVariantClass,
} from "@/components/marketing/shop-ui";
import { OrderNoticeBanner, ORDER_BTN_NAVY } from "@/components/marketing/order-ui";
import { GuideImageFrame } from "@/components/marketing/guide-image";
import { createAppClient, getClientUser } from "@/lib/supabase";
import { SHIPPING_FLAT_RATE, SHIPPING_LABEL } from "@/lib/shipping";
import { JbProtocolChooser } from "@/components/jb-protocol-chooser";
import {
  addCartLine,
  EQUIPMENT_FAMILIES,
  EQUIPMENT_SHOP_ATTRIBUTION,
  groupProductsByFamily,
  getVariantBadge,
  getVariantShortLabel,
  parseShopFamilyParam,
  removeCartLine,
  resolveCartItems,
  SHOP_QUANTITY_MAX,
  SHOP_QUANTITY_MIN,
  updateCartLineQuantity,
  type EquipmentFamilyId,
  type ShopCartLine,
  type ShopProduct,
} from "@/lib/equipment-shop";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [cartLines, setCartLines] = useState<ShopCartLine[]>([]);
  const [addedNotice, setAddedNotice] = useState<string | null>(null);

  const grouped = useMemo(() => groupProductsByFamily(products), [products]);
  const cartItems = useMemo(() => resolveCartItems(cartLines, products), [cartLines, products]);

  const initialFamily = parseShopFamilyParam(searchParams.get("family")) ?? "jb_tray";
  const [activeFamily, setActiveFamily] = useState<EquipmentFamilyId>(initialFamily);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const familyMeta = EQUIPMENT_FAMILIES.find((f) => f.id === activeFamily)!;
  const familyProducts = grouped[activeFamily] ?? [];
  const selected = familyProducts.find((p) => p.id === selectedId) ?? familyProducts[0] ?? null;
  const selectedLineSubtotal = selected ? selected.price * quantity : 0;
  const cartHasSelected = selected ? cartLines.some((line) => line.productId === selected.id) : false;

  useEffect(() => {
    if (searchParams.get("equipment") === "ordered") {
      const count = searchParams.get("count");
      if (count && Number(count) > 1) {
        setBanner(`${count} equipment items confirmed. Mark them as received on your dashboard when they arrive.`);
        return;
      }
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
    void load();
  }, [router]);

  useEffect(() => {
    const list = grouped[activeFamily];
    if (!list.length) return;
    setSelectedId((prev) => (prev && list.some((p) => p.id === prev) ? prev : list[0].id));
    setQuantity(1);
  }, [activeFamily, grouped]);

  function handleAddToCart() {
    if (!selected) return;
    setCartLines((lines) => {
      const exists = lines.some((line) => line.productId === selected.id);
      if (exists) return updateCartLineQuantity(lines, selected.id, quantity);
      return addCartLine(lines, selected.id, quantity);
    });
    setAddedNotice(`${selected.name} ${cartHasSelected ? "updated in cart" : "added to cart"}`);
    setQuantity(1);
    window.setTimeout(() => setAddedNotice(null), 2500);
  }

  function handleUpdateCartQuantity(productId: string, nextQuantity: number) {
    if (nextQuantity < SHOP_QUANTITY_MIN) {
      setCartLines((lines) => removeCartLine(lines, productId));
      return;
    }
    setCartLines((lines) => updateCartLineQuantity(lines, productId, nextQuantity));
  }

  async function handleCheckout() {
    if (!cartItems.length) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/equipment-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
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

  if (loading) {
    return <ShopLoadingState />;
  }

  return (
    <MarketingShell>
      <ShopPageHeader />

      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10 pb-16">
        {banner && <OrderNoticeBanner variant="teal">{banner}</OrderNoticeBanner>}
        {addedNotice && <OrderNoticeBanner variant="teal">{addedNotice}</OrderNoticeBanner>}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[var(--pd-border)] border border-[var(--pd-border)]">
              {EQUIPMENT_FAMILIES.map((family) => {
                const active = family.id === activeFamily;
                const count = grouped[family.id]?.length ?? 0;
                return (
                  <button
                    key={family.id}
                    type="button"
                    onClick={() => setActiveFamily(family.id)}
                    className={shopFamilyTabClass(active)}
                  >
                    <p className="text-[14px] font-semibold">{family.label}</p>
                    <p className={`text-[12px] mt-1 ${active ? "text-white/75" : "text-[var(--pd-muted)]"}`}>
                      {count} option{count !== 1 ? "s" : ""}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="border border-[var(--pd-border)] bg-white overflow-hidden">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-0">
                <GuideImageFrame
                  src={familyMeta.image}
                  alt={familyMeta.label}
                  variant="product"
                  className="border-0 border-b sm:border-b-0 sm:border-r border-[var(--pd-border)] min-h-[200px] sm:min-h-0"
                />
                <div className="p-5 sm:p-6">
                  <h2 className="text-lg font-semibold text-[var(--pd-navy)]">{familyMeta.label}</h2>
                  <p className="text-[14px] text-[var(--pd-slate)] mt-2 leading-relaxed">{familyMeta.description}</p>
                  <ul className="mt-3 space-y-1">
                    {familyMeta.variantHints.map((hint) => (
                      <li key={hint} className="text-[12px] text-[var(--pd-teal-dark)]">
                        · {hint}
                      </li>
                    ))}
                  </ul>
                  {familyMeta.orderHint && (
                    <p className="text-[12px] text-[var(--pd-muted)] mt-4 leading-relaxed border-t border-[var(--pd-border)] pt-4">
                      {familyMeta.orderHint}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-3">
                Choose option
              </p>
              <div className="space-y-2">
                {familyProducts.map((product) => {
                  const isSelected = selected?.id === product.id;
                  const inCart = cartLines.find((line) => line.productId === product.id);
                  const badge = getVariantBadge(product.fields);
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(product.id);
                        setQuantity(inCart?.quantity ?? 1);
                      }}
                      className={shopVariantClass(isSelected)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[14px] font-semibold text-[var(--pd-navy)]">
                              {getVariantShortLabel(product.fields)}
                            </p>
                            {badge && (
                              <span className="text-[10px] font-medium px-2 py-0.5 border bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB] uppercase tracking-wide">
                                {badge}
                              </span>
                            )}
                            {inCart && (
                              <span className="text-[10px] font-medium px-2 py-0.5 border bg-[var(--pd-surface)] text-[var(--pd-navy)] border-[var(--pd-border)]">
                                In cart · Qty {inCart.quantity}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] text-[var(--pd-slate)] mt-1 leading-relaxed">
                            {product.description}
                          </p>
                        </div>
                        <p className="text-base font-semibold text-[var(--pd-navy)] shrink-0">${product.price}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selected && (
              <div className="border border-[var(--pd-border)] bg-white p-4 sm:p-5 space-y-4">
                <div>
                  <p className="text-[14px] font-medium text-[var(--pd-navy)] mb-3">Quantity</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(SHOP_QUANTITY_MIN, q - 1))}
                        disabled={quantity <= SHOP_QUANTITY_MIN}
                        className="w-9 h-9 border border-[var(--pd-border)] bg-[var(--pd-surface)] font-semibold text-[var(--pd-navy)] disabled:opacity-40 hover:border-[var(--pd-navy)] transition-colors"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-semibold text-[var(--pd-navy)]">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(SHOP_QUANTITY_MAX, q + 1))}
                        disabled={quantity >= SHOP_QUANTITY_MAX}
                        className="w-9 h-9 border border-[var(--pd-border)] bg-[var(--pd-surface)] font-semibold text-[var(--pd-navy)] disabled:opacity-40 hover:border-[var(--pd-navy)] transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-[12px] text-[var(--pd-muted)]">
                      {quantity === 1 ? "1 unit" : `${quantity} units`} · ${selectedLineSubtotal}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${ORDER_BTN_NAVY} w-full sm:w-auto`}
                  onClick={handleAddToCart}
                >
                  {cartHasSelected ? "Update cart" : "Add to cart"}
                </button>
              </div>
            )}
          </div>

          <ShopCartPanel
            cartItems={cartItems}
            checkingOut={checkingOut}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemove={(productId) => setCartLines((lines) => removeCartLine(lines, productId))}
            onCheckout={() => void handleCheckout()}
          />
        </div>

        <section className="mt-16 pt-12 border-t-2 border-[var(--pd-navy)]">
          <p className="text-[13px] text-[var(--pd-slate)] mb-8 leading-relaxed max-w-2xl">
            Not sure which kit? Most visits use Fork or Tray alone — use the protocol guide below to
            decide. Flat-rate {SHIPPING_LABEL} shipping (${SHIPPING_FLAT_RATE}).
          </p>
          <JbProtocolChooser
            variant="shop"
            activeFamily={activeFamily === "pop_bow" ? undefined : activeFamily}
            onSelectFamily={setActiveFamily}
          />
        </section>

        <p className="text-[11px] text-[var(--pd-muted)] leading-relaxed mt-10 max-w-2xl">
          {EQUIPMENT_SHOP_ATTRIBUTION}
        </p>
      </div>
    </MarketingShell>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoadingState />}>
      <ShopContent />
    </Suspense>
  );
}
