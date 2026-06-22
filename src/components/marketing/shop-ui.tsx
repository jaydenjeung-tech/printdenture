"use client";

import Link from "next/link";
import { MarketingShell } from "@/components/marketing/marketing-shell";
import {
  ORDER_BTN_PRIMARY,
  ORDER_CHIP_DEFAULT,
  OrderNoticeBanner,
} from "@/components/marketing/order-ui";
import { cn } from "@/lib/utils";
import { SHIPPING_FLAT_RATE, SHIPPING_LABEL } from "@/lib/shipping";
import {
  cartItemCount,
  cartSubtotal,
  cartTotal,
  getVariantShortLabel,
  SHOP_QUANTITY_MAX,
  SHOP_QUANTITY_MIN,
  type ShopCartItem,
} from "@/lib/equipment-shop";

export function ShopPageHeader() {
  return (
    <section className="border-b border-[var(--pd-border)] bg-white relative overflow-hidden">
      <div className="absolute inset-0 pd-grid-bg opacity-[0.04] text-[var(--pd-navy)]" aria-hidden />
      <div className="relative max-w-5xl mx-auto px-6 lg:px-10 pt-28 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
          Capture devices
        </p>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
          JB Tray, JB Fork & ADD POP Bow
        </h1>
        <p className="text-[14px] text-[var(--pd-slate)] mt-2 max-w-2xl leading-relaxed">
          Order the chairside capture kit for your practice. When it arrives, mark received on your{" "}
          <Link href="/dashboard" className="text-[var(--pd-teal-dark)] font-medium hover:underline">
            dashboard
          </Link>
          , capture records, then submit from{" "}
          <Link href="/order" className="text-[var(--pd-teal-dark)] font-medium hover:underline">
            New lab case
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

export function shopFamilyTabClass(active: boolean) {
  return cn(
    "border p-4 text-left transition-colors",
    active
      ? "bg-[var(--pd-navy)] text-white border-[var(--pd-navy)]"
      : cn(ORDER_CHIP_DEFAULT, "text-[var(--pd-slate)] hover:text-[var(--pd-navy)]")
  );
}

export function shopVariantClass(selected: boolean) {
  return cn(
    "w-full text-left border p-4 transition-colors",
    selected
      ? "border-[var(--pd-teal)] bg-[#E1F5EE]/30 ring-1 ring-[var(--pd-teal)]/20"
      : "border-[var(--pd-border)] bg-white hover:border-[var(--pd-teal)]/50"
  );
}

export function ShopLoadingState() {
  return (
    <MarketingShell>
      <ShopPageHeader />
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-16 text-center">
        <p className="text-[14px] text-[var(--pd-muted)]">Loading equipment…</p>
      </div>
    </MarketingShell>
  );
}

function CartQuantityControl({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= SHOP_QUANTITY_MIN}
        className="w-7 h-7 border border-[var(--pd-border)] bg-[var(--pd-surface)] text-[13px] font-semibold text-[var(--pd-navy)] disabled:opacity-40 hover:border-[var(--pd-navy)] transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-6 text-center text-[13px] font-semibold text-[var(--pd-navy)]">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= SHOP_QUANTITY_MAX}
        className="w-7 h-7 border border-[var(--pd-border)] bg-[var(--pd-surface)] text-[13px] font-semibold text-[var(--pd-navy)] disabled:opacity-40 hover:border-[var(--pd-navy)] transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}

export function ShopCartPanel({
  cartItems,
  checkingOut,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: {
  cartItems: ShopCartItem[];
  checkingOut: boolean;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}) {
  const subtotal = cartSubtotal(cartItems);
  const total = cartTotal(cartItems, SHIPPING_FLAT_RATE);
  const itemCount = cartItemCount(cartItems);

  return (
    <div className="lg:sticky lg:top-28 border border-[var(--pd-border)] bg-white p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">
          Cart
        </p>
        {itemCount > 0 && (
          <span className="text-[11px] font-medium text-[var(--pd-teal-dark)]">
            {itemCount} item{itemCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {cartItems.length === 0 ? (
        <p className="text-[14px] text-[var(--pd-muted)] leading-relaxed">
          Add items from any category — mix JB Tray, JB Fork, and POP Bow in one order.
        </p>
      ) : (
        <>
          <div className="space-y-3 border-b border-[var(--pd-border)] pb-3">
            {cartItems.map((item) => (
              <div key={item.productId} className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--pd-navy)] leading-snug">
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-[var(--pd-muted)] mt-0.5">
                      {getVariantShortLabel(item.product.fields)}
                    </p>
                  </div>
                  <p className="text-[13px] font-semibold text-[var(--pd-navy)] shrink-0">
                    ${item.product.price * item.quantity}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <CartQuantityControl
                    quantity={item.quantity}
                    onDecrease={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    onIncrease={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                  />
                  <button
                    type="button"
                    onClick={() => onRemove(item.productId)}
                    className="text-[12px] text-[var(--pd-muted)] hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-[14px]">
            <div className="flex justify-between text-[var(--pd-slate)]">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between text-[var(--pd-slate)]">
              <span>Shipping ({SHIPPING_LABEL})</span>
              <span>${SHIPPING_FLAT_RATE}</span>
            </div>
            <div className="flex justify-between font-semibold text-[var(--pd-navy)] pt-1">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          <button
            type="button"
            className={`${ORDER_BTN_PRIMARY} w-full h-11`}
            disabled={checkingOut}
            onClick={onCheckout}
          >
            {checkingOut ? "Redirecting to checkout…" : `Checkout · $${total}`}
          </button>
        </>
      )}

      <Link
        href="/order"
        className="block text-center text-[13px] text-[var(--pd-teal-dark)] hover:underline font-medium"
      >
        ← Back to lab case order
      </Link>
    </div>
  );
}
