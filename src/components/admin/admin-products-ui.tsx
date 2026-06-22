"use client";

import { cn } from "@/lib/utils";
import {
  chipClass,
  ORDER_BTN_BACK,
  ORDER_BTN_NAVY,
  ORDER_BTN_PRIMARY,
  ORDER_INPUT_CLASS,
  ORDER_LABEL_CLASS,
  ORDER_TEXTAREA_CLASS,
} from "@/components/marketing/order-ui";
import {
  defaultSitesForCategory,
  getProductSites,
  SITE_LABELS,
  type SiteId,
} from "@/lib/products/site-catalog";

export type AdminProduct = {
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

export type AdminProductForm = Omit<AdminProduct, "id">;

export type AdminCategory = {
  value: string;
  label: string;
  accent: string;
  group: string;
};

export type AdminFieldOption = {
  value: string;
  label: string;
};

const BOTH_SITES: SiteId[] = ["printcrown", "printdenture"];

export function sitesMatch(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && BOTH_SITES.every((s) => a.includes(s) && b.includes(s));
}

export function AdminProductsHeader({
  onRestoreGuards,
  onSeedCatalog,
  onAdd,
  seeding,
}: {
  onRestoreGuards: () => void;
  onSeedCatalog: () => void;
  onAdd: () => void;
  seeding: boolean;
}) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--pd-teal-dark)] mb-2">
          Catalog
        </p>
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold text-[var(--pd-navy)] tracking-[-0.03em]">
          Products
        </h1>
        <p className="text-[14px] text-[var(--pd-slate)] mt-2 max-w-2xl leading-relaxed">
          Shared catalog for PrintCrown and PrintDenture. Use{" "}
          <strong className="font-medium text-[var(--pd-navy)]">Visible on</strong> to control which
          storefront shows each product.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onRestoreGuards}
          disabled={seeding}
          className={`${ORDER_BTN_BACK} h-9 px-4 text-[13px] border-amber-300 text-amber-900 hover:border-amber-500`}
        >
          {seeding ? "Restoring…" : "Restore guards"}
        </button>
        <button
          type="button"
          onClick={onSeedCatalog}
          disabled={seeding}
          className={`${ORDER_BTN_BACK} h-9 px-4 text-[13px] text-[var(--pd-teal-dark)] hover:border-[var(--pd-teal)]`}
        >
          {seeding ? "Syncing…" : "+ Denture defaults"}
        </button>
        <button type="button" onClick={onAdd} className={`${ORDER_BTN_NAVY} h-9 px-4 text-[13px]`}>
          + Add product
        </button>
      </div>
    </div>
  );
}

export function AdminProductsLegend() {
  return (
    <div className="mb-8 flex flex-wrap gap-2 text-[11px] font-medium uppercase tracking-wide">
      <span className="px-2.5 py-1 border border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]">
        PrintCrown — crown, implant
      </span>
      <span className="px-2.5 py-1 border border-[#9FE1CB] bg-[#E1F5EE] text-[var(--pd-teal-dark)]">
        PrintDenture — denture, reline
      </span>
      <span className="px-2.5 py-1 border border-amber-200 bg-amber-50 text-amber-800">
        Both sites — guards
      </span>
    </div>
  );
}

export function AdminNotice({
  variant,
  children,
}: {
  variant: "success" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      className={cn(
        "mb-6 text-[14px] border px-4 py-3",
        variant === "success"
          ? "text-[var(--pd-teal-dark)] bg-[#E1F5EE] border-[#9FE1CB]"
          : "text-red-700 bg-red-50 border-red-200"
      )}
    >
      {children}
    </p>
  );
}

function AdminSiteBadges({ sites }: { sites: SiteId[] }) {
  if (sitesMatch(sites, BOTH_SITES)) {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 border bg-amber-50 text-amber-800 border-amber-200 uppercase tracking-wide">
        Both sites
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1">
      {sites.map((s) => (
        <span
          key={s}
          className={cn(
            "text-[10px] font-medium px-2 py-0.5 border uppercase tracking-wide",
            s === "printcrown"
              ? "bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]"
              : "bg-[#E1F5EE] text-[var(--pd-teal-dark)] border-[#9FE1CB]"
          )}
        >
          {SITE_LABELS[s]}
        </span>
      ))}
    </div>
  );
}

function AdminActionButton({
  children,
  onClick,
  disabled,
  tone = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "warn" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 px-3 text-[12px] border border-[var(--pd-border)] bg-white transition-colors disabled:opacity-30",
        tone === "default" && "text-[var(--pd-slate)] hover:border-[var(--pd-navy)] hover:text-[var(--pd-navy)]",
        tone === "warn" && "text-[var(--pd-slate)] hover:border-amber-500 hover:text-amber-700",
        tone === "danger" && "text-[var(--pd-slate)] hover:border-red-400 hover:text-red-600"
      )}
    >
      {children}
    </button>
  );
}

export function AdminProductCategorySection({
  category,
  items,
  onMoveUp,
  onMoveDown,
  onToggleActive,
  onEdit,
  onDelete,
}: {
  category: AdminCategory;
  items: AdminProduct[];
  onMoveUp: (product: AdminProduct) => void;
  onMoveDown: (product: AdminProduct) => void;
  onToggleActive: (product: AdminProduct) => void;
  onEdit: (product: AdminProduct) => void;
  onDelete: (product: AdminProduct) => void;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-3 pb-3 border-b border-[var(--pd-border)]">
        <span className="w-1 h-5 shrink-0" style={{ background: category.accent }} aria-hidden />
        <h2 className="text-[14px] font-semibold text-[var(--pd-navy)]">{category.label}</h2>
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-muted)]">
          {category.group}
        </span>
        <span className="text-[12px] text-[var(--pd-muted)]">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <div className="border border-dashed border-[var(--pd-border)] bg-[var(--pd-surface)] px-4 py-8 text-center">
          <p className="text-[14px] text-[var(--pd-muted)]">No products yet</p>
        </div>
      ) : (
        <div className="border border-[var(--pd-border)] bg-white divide-y divide-[var(--pd-border)]">
          {items.map((product, idx) => (
            <div
              key={product.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-4 px-4 py-4",
                !product.active && "opacity-50"
              )}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex flex-col gap-0.5 shrink-0 pt-0.5">
                  <button
                    type="button"
                    onClick={() => onMoveUp(product)}
                    disabled={idx === 0}
                    className="w-6 h-5 flex items-center justify-center text-[var(--pd-muted)] hover:text-[var(--pd-navy)] disabled:opacity-20 text-xs"
                    aria-label="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveDown(product)}
                    disabled={idx === items.length - 1}
                    className="w-6 h-5 flex items-center justify-center text-[var(--pd-muted)] hover:text-[var(--pd-navy)] disabled:opacity-20 text-xs"
                    aria-label="Move down"
                  >
                    ▼
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="font-semibold text-[14px] text-[var(--pd-navy)]">{product.name}</span>
                    {!product.active && (
                      <span className="text-[10px] font-medium px-2 py-0.5 border bg-[var(--pd-surface)] text-[var(--pd-muted)] border-[var(--pd-border)] uppercase tracking-wide">
                        Inactive
                      </span>
                    )}
                  </div>
                  <AdminSiteBadges sites={getProductSites(product)} />
                  <p className="text-[13px] text-[var(--pd-slate)] mt-1.5 line-clamp-2">{product.description}</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 shrink-0 pl-9 sm:pl-0">
                <div className="text-right">
                  <p className="font-semibold text-[14px] text-[var(--pd-navy)]">${product.price}</p>
                  <p className="text-[12px] text-[var(--pd-muted)]">{product.turnaround}</p>
                </div>
                <div className="flex items-center gap-1">
                  <AdminActionButton
                    onClick={() => onToggleActive(product)}
                    tone={product.active ? "warn" : "default"}
                  >
                    {product.active ? "Deactivate" : "Activate"}
                  </AdminActionButton>
                  <AdminActionButton onClick={() => onEdit(product)}>Edit</AdminActionButton>
                  <AdminActionButton onClick={() => onDelete(product)} tone="danger">
                    Delete
                  </AdminActionButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function AdminProductsLoading() {
  return (
    <div className="py-16 text-center">
      <p className="text-[14px] text-[var(--pd-muted)]">Loading catalog…</p>
    </div>
  );
}

export function AdminProductFormModal({
  mode,
  form,
  categories,
  fieldOptions,
  sites,
  saving,
  saveError,
  onClose,
  onSave,
  onChange,
  onToggleField,
  onToggleSite,
  onSetBothSites,
  onCategoryChange,
}: {
  mode: "add" | "edit";
  form: AdminProductForm;
  categories: AdminCategory[];
  fieldOptions: AdminFieldOption[];
  sites: SiteId[];
  saving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSave: () => void;
  onChange: <K extends keyof AdminProductForm>(key: K, value: AdminProductForm[K]) => void;
  onToggleField: (field: string) => void;
  onToggleSite: (site: SiteId) => void;
  onSetBothSites: () => void;
  onCategoryChange: (category: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white border border-[var(--pd-border)] w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-[var(--pd-border)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--pd-teal-dark)] mb-1">
            Catalog
          </p>
          <h3 className="text-lg font-semibold text-[var(--pd-navy)]">
            {mode === "add" ? "Add product" : "Edit product"}
          </h3>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className={ORDER_LABEL_CLASS}>Category</label>
            <select
              value={form.category}
              onChange={(e) => onCategoryChange(e.target.value)}
              className={ORDER_INPUT_CLASS}
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label} ({c.group})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={ORDER_LABEL_CLASS}>Visible on *</label>
            <div className="flex flex-wrap gap-2">
              {sites.map((site) => (
                <button
                  key={site}
                  type="button"
                  onClick={() => onToggleSite(site)}
                  className={chipClass(form.sites?.includes(site) ?? false)}
                >
                  {SITE_LABELS[site]}
                </button>
              ))}
              <button
                type="button"
                onClick={onSetBothSites}
                className={chipClass(sitesMatch(form.sites ?? [], BOTH_SITES))}
              >
                Both sites
              </button>
            </div>
            <p className="text-[11px] text-[var(--pd-muted)] mt-1.5">
              Category changes apply suggested defaults. Toggle sites individually or select both.
            </p>
          </div>

          <div>
            <label className={ORDER_LABEL_CLASS}>Product name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={ORDER_INPUT_CLASS}
            />
          </div>

          <div>
            <label className={ORDER_LABEL_CLASS}>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              rows={2}
              className={ORDER_TEXTAREA_CLASS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={ORDER_LABEL_CLASS}>Price ($) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => onChange("price", parseInt(e.target.value, 10) || 0)}
                className={ORDER_INPUT_CLASS}
              />
            </div>
            <div>
              <label className={ORDER_LABEL_CLASS}>Turnaround</label>
              <input
                type="text"
                value={form.turnaround}
                onChange={(e) => onChange("turnaround", e.target.value)}
                className={ORDER_INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className={ORDER_LABEL_CLASS}>Required fields</label>
            <div className="flex flex-wrap gap-2">
              {fieldOptions.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => onToggleField(f.value)}
                  className={chipClass(form.fields.includes(f.value), "h-8 px-3 text-[12px]")}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => onChange("active", e.target.checked)}
              className="w-4 h-4 accent-[var(--pd-teal)]"
            />
            <span className="text-[14px] text-[var(--pd-slate)]">Active on storefront</span>
          </label>

          {saveError && <AdminNotice variant="error">{saveError}</AdminNotice>}
        </div>

        <div className="flex gap-2 p-5 border-t border-[var(--pd-border)] bg-[var(--pd-surface)]">
          <button type="button" onClick={onClose} className={`${ORDER_BTN_BACK} flex-1 h-10 text-[13px]`}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !form.name.trim() || !form.price}
            className={`${ORDER_BTN_PRIMARY} flex-1 h-10 text-[13px]`}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminProductDeleteModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white border border-[var(--pd-border)] w-full max-w-sm p-6 text-center">
        <p className="font-semibold text-[var(--pd-navy)] mb-1">Delete this product?</p>
        <p className="text-[13px] text-[var(--pd-slate)]">This cannot be undone.</p>
        <div className="flex gap-2 mt-6">
          <button type="button" onClick={onCancel} className={`${ORDER_BTN_BACK} flex-1 h-10 text-[13px]`}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 h-10 text-[13px] font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function applyCategoryDefaults(
  category: string,
  categories: AdminCategory[]
): Pick<AdminProductForm, "category" | "accent" | "sites"> {
  const cat = categories.find((c) => c.value === category);
  return {
    category,
    accent: cat?.accent ?? "#0F6E56",
    sites: defaultSitesForCategory(category),
  };
}
