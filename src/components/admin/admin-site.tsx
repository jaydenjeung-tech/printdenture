"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createAppClient } from "@/lib/supabase";
import { SITE_LABELS, type CatalogProduct, type SiteId } from "@/lib/products/site-catalog";
import { orderBelongsToSite, resolveOrderCatalogProduct } from "@/lib/orders/site-scope";
import { chipClass } from "@/components/marketing/order-ui";

export type AdminSiteChoice = "all" | SiteId;

const STORAGE_KEY = "pd-admin-site";

type OrderScope = {
  site?: string | null;
  product_id?: string | null;
  product_name?: string | null;
};

type AdminSiteContextValue = {
  site: AdminSiteChoice;
  setSite: (site: AdminSiteChoice) => void;
  matchesOrder: (order: OrderScope) => boolean;
};

const AdminSiteContext = createContext<AdminSiteContextValue | null>(null);

export function AdminSiteProvider({ children }: { children: React.ReactNode }) {
  const [site, setSiteState] = useState<AdminSiteChoice>("printdenture");
  const [products, setProducts] = useState<Map<string, CatalogProduct>>(new Map());

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "all" || stored === "printcrown" || stored === "printdenture") {
      setSiteState(stored);
    }
  }, []);

  useEffect(() => {
    const supabase = createAppClient();
    void supabase
      .from("products")
      .select("id, category, sites")
      .then(({ data }) => {
        if (!data) return;
        setProducts(new Map(data.map((product) => [product.id, product])));
      });
  }, []);

  const value = useMemo<AdminSiteContextValue>(() => {
    return {
      site,
      setSite(next) {
        setSiteState(next);
        window.localStorage.setItem(STORAGE_KEY, next);
      },
      matchesOrder(order) {
        if (site === "all") return true;
        const product = resolveOrderCatalogProduct(order, products);
        return orderBelongsToSite(order, product, site);
      },
    };
  }, [products, site]);

  return <AdminSiteContext.Provider value={value}>{children}</AdminSiteContext.Provider>;
}

export function useAdminSite() {
  const value = useContext(AdminSiteContext);
  if (!value) throw new Error("useAdminSite must be used inside AdminSiteProvider");
  return value;
}

const CHOICES: AdminSiteChoice[] = ["printdenture", "printcrown", "all"];

export function AdminSiteTabs() {
  const { site, setSite } = useAdminSite();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-px bg-[#E2E0D8] border border-[#E2E0D8] p-px">
        {CHOICES.map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => setSite(choice)}
            className={chipClass(site === choice, "h-8 px-3 text-[12px]")}
          >
            {choice === "all" ? "All sites" : SITE_LABELS[choice]}
          </button>
        ))}
      </div>
      <p className="text-[12px] text-[#9B9B9B]">Night guards are listed on both sites.</p>
    </div>
  );
}
