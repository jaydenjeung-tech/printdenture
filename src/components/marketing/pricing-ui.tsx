import Link from "next/link";
import { formatPricingCardPrice, type PricingCardDisplay } from "@/lib/products/arch-pricing";
import type { PricingProduct } from "@/lib/products/pricing-page";
import { orderProductAuthHref, orderProductHref } from "@/lib/products/order-product-link";
import { GuideImageFrame } from "@/components/marketing/guide-image";

export function PricingProductCard({
  product,
  priceDisplay,
  orderHref,
  orderLabel = "Order",
}: {
  product: PricingProduct;
  priceDisplay: PricingCardDisplay;
  orderHref?: string;
  orderLabel?: string;
}) {
  const href = orderHref ?? orderProductAuthHref(product.id);

  return (
    <div className="group flex flex-col border border-[var(--pd-border)] bg-white transition-colors hover:border-[var(--pd-navy)]/20">
      <div className="p-5 sm:p-6 flex-1">
        <div className="flex items-start gap-3 mb-3">
          <div
            className="w-0.5 self-stretch min-h-[2.5rem] shrink-0"
            style={{ background: product.accent }}
          />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-[var(--pd-navy)] leading-snug">{product.name}</h3>
            <p className="text-[13px] text-[var(--pd-muted)] mt-1.5 leading-relaxed line-clamp-3">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-4 border-t border-[var(--pd-border)]">
        {priceDisplay.flat ? (
          <div className="mb-4">
            <span className="text-2xl font-semibold tracking-[-0.02em] text-[var(--pd-navy)]">
              {priceDisplay.primary}
            </span>
            {priceDisplay.secondary && (
              <span className="text-sm text-[var(--pd-muted)] ml-1.5">{priceDisplay.secondary}</span>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] mb-2">
              Arch pricing
            </p>
            <div className="flex flex-wrap gap-2">
              {priceDisplay.archTiers?.map((tier) => (
                <span
                  key={tier.label}
                  className="inline-flex items-center gap-1.5 border border-[var(--pd-border)] bg-[var(--pd-surface)] px-2.5 py-1.5 text-xs"
                >
                  <span className="text-[var(--pd-muted)]">{tier.label}</span>
                  <span className="font-semibold text-[var(--pd-navy)]">${tier.price}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] text-[var(--pd-muted)]">{product.turnaround}</p>
          <Link href={href}>
            <span
              className="inline-flex h-9 items-center px-4 text-white text-[12px] font-medium transition-opacity hover:opacity-90"
              style={{ background: product.accent }}
            >
              {orderLabel}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PricingDeviceCard({
  label,
  description,
  image,
  imageAlt,
  product,
}: {
  label: string;
  description: string;
  image: string;
  imageAlt: string;
  product: PricingProduct;
}) {
  return (
    <div className="border border-[var(--pd-border)] bg-white overflow-hidden flex flex-col">
      <GuideImageFrame src={image} alt={imageAlt} variant="product" className="border-0 border-b border-[var(--pd-border)]" />
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-teal-dark)] mb-2">
          {label}
        </p>
        <h3 className="font-semibold text-[var(--pd-navy)] mb-2">{product.name}</h3>
        <p className="text-[13px] text-[var(--pd-muted)] leading-relaxed mb-4 flex-1">{product.description}</p>
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--pd-border)]">
          <div>
            <span className="text-2xl font-semibold text-[var(--pd-navy)]">${product.price}</span>
            <p className="text-[12px] text-[var(--pd-muted)] mt-0.5">{product.turnaround}</p>
          </div>
          <Link href={`/shop?family=${shopFamilyFromProduct(product)}`}>
            <span className="inline-flex h-9 items-center px-4 bg-[var(--pd-teal)] text-white text-[12px] font-medium hover:bg-[var(--pd-teal-dark)] transition-colors">
              Order kit
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function PricingTierHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-10 pb-8 border-b-2 border-[var(--pd-navy)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
        {eyebrow}
      </p>
      <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.02em] mb-3">
        {title}
      </h2>
      <p className="text-[15px] text-[var(--pd-slate)] leading-relaxed max-w-2xl">{description}</p>
    </div>
  );
}

export function PricingSectionNav({
  groups,
}: {
  groups: { id: string; label: string; accent: string; tier?: "devices" | "lab" }[];
}) {
  let lastTier: string | undefined;

  return (
    <nav className="hidden lg:block">
      <div className="sticky top-28 border border-[var(--pd-border)] bg-white">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)] px-4 py-3 border-b border-[var(--pd-border)]">
          Jump to
        </p>
        <ul>
          {groups.map((group) => {
            const showTierLabel = group.tier && group.tier !== lastTier;
            if (group.tier) lastTier = group.tier;
            return (
              <li key={group.id}>
                {showTierLabel && (
                  <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--pd-muted)]">
                    {group.tier === "devices" ? "Devices" : "Lab services"}
                  </p>
                )}
                <a
                  href={`#pricing-${group.id}`}
                  className="flex items-center gap-3 px-4 py-3 text-[14px] text-[var(--pd-slate)] hover:bg-[var(--pd-surface)] hover:text-[var(--pd-navy)] transition-colors border-b border-[var(--pd-border)] last:border-b-0"
                >
                  <span className="w-2 h-2 shrink-0" style={{ background: group.accent }} />
                  {group.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export function PricingLoadingSkeleton() {
  return (
    <div className="space-y-14">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="w-48 h-7 bg-[var(--pd-border)] mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="h-52 bg-[var(--pd-border)]" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function shopFamilyFromProduct(product: PricingProduct): string {
  if (product.fields?.includes("jbFork")) return "jb_fork";
  if (product.fields?.includes("popBow")) return "pop_bow";
  return "jb_tray";
}

export { shopFamilyFromProduct, orderProductHref, orderProductAuthHref };
