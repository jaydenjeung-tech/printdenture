-- PrintDenture: create products table (if missing) + seed denture/removable catalog.
-- Run this entire file in Supabase SQL Editor. Safe to re-run.

-- ── 1. Table + RLS (idempotent) ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price integer NOT NULL CHECK (price >= 0),
  turnaround text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT '#0F6E56',
  fields text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  sites text[] DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_category_name_unique UNIQUE (category, name)
);

CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);
CREATE INDEX IF NOT EXISTS products_active_sort_idx ON public.products (active, sort_order);

CREATE OR REPLACE FUNCTION public.set_products_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;
CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_products_updated_at();

CREATE OR REPLACE FUNCTION public.is_app_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF to_regclass('public.profiles') IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND (p.is_admin IS TRUE OR p.role = 'admin')
  );
END;
$$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS products_select_active ON public.products;
CREATE POLICY products_select_active
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS products_admin_manage ON public.products;
CREATE POLICY products_admin_manage
  ON public.products
  FOR ALL
  TO authenticated
  USING (public.is_app_admin())
  WITH CHECK (public.is_app_admin());

GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;

-- ── 2. Seed PrintDenture catalog (skips existing category + name) ────────────

INSERT INTO products (category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
SELECT v.category, v.name, v.description, v.price, v.turnaround, v.accent, v.fields, v.active, v.sort_order, v.sites
FROM (VALUES
  ('complete', 'Complete Denture — Upper', 'Definitive upper complete denture from JB Fork-aligned digital records. No try-in path when verification criteria are met.', 449, '7–12 business days', '#0F6E56', ARRAY['shade','arch','jawRelation']::text[], true, 10, ARRAY['printdenture']::text[]),
  ('complete', 'Complete Denture — Lower', 'Definitive lower complete denture from JB Fork-aligned digital records. No try-in path when verification criteria are met.', 449, '7–12 business days', '#0F6E56', ARRAY['shade','arch','jawRelation']::text[], true, 11, ARRAY['printdenture']::text[]),
  ('complete', 'Complete Denture — Full Set', 'Upper and lower definitive complete dentures from aligned scan sets. Designed for practices skipping try-in.', 849, '7–12 business days', '#0F6E56', ARRAY['shade','arch','jawRelation']::text[], true, 12, ARRAY['printdenture']::text[]),

  ('jb_tray', 'JB Tray Case — Upper', 'Complete upper denture from JB Tray final impression and jaw relation — one-visit records, no wax rim.', 429, '7–12 business days', '#5DCAA5', ARRAY['shade','arch','jawRelation']::text[], true, 20, ARRAY['printdenture']::text[]),
  ('jb_tray', 'JB Tray Case — Lower', 'Complete lower denture from JB Tray final impression and jaw relation — VD and centric captured chairside.', 429, '7–12 business days', '#5DCAA5', ARRAY['shade','arch','jawRelation']::text[], true, 21, ARRAY['printdenture']::text[]),
  ('jb_tray', 'JB Tray Case — Full Set', 'Upper and lower dentures from JB Tray protocol records with POP bow esthetic transfer when indicated.', 799, '7–12 business days', '#5DCAA5', ARRAY['shade','arch','jawRelation']::text[], true, 22, ARRAY['printdenture']::text[]),

  ('partial', 'Flexible Partial Denture', 'Valplast-style flexible partial with digital tooth setup and natural clasp design.', 399, '7–10 business days', '#1D9E75', ARRAY['shade','arch']::text[], true, 30, ARRAY['printdenture']::text[]),
  ('partial', 'Cast Metal Partial Denture', 'Cobalt-chrome or titanium framework partial with surveyed clasp design from digital records.', 549, '10–14 business days', '#1D9E75', ARRAY['shade','arch']::text[], true, 31, ARRAY['printdenture']::text[]),

  ('immediate', 'Immediate Denture — Single Arch', 'Delivery denture at extraction visit or shortly after — digital design from pre-op records.', 479, '5–7 business days', '#085041', ARRAY['shade','arch']::text[], true, 40, ARRAY['printdenture']::text[]),
  ('immediate', 'Immediate Denture — Full Set', 'Upper and lower immediate dentures for full-arch extraction cases with rush fabrication.', 899, '7–10 business days', '#085041', ARRAY['shade','arch']::text[], true, 41, ARRAY['printdenture']::text[]),

  ('overdenture', 'Locator Overdenture', 'Implant-retained overdenture with locator attachments — requires aligned CBCT / IOS implant position data.', 699, '12–16 business days', '#378ADD', ARRAY['shade','arch']::text[], true, 50, ARRAY['printdenture']::text[]),
  ('overdenture', 'Bar Overdenture', 'Milled bar or cast bar-retained overdenture for full-arch implant cases with digital verification.', 999, '14–18 business days', '#378ADD', ARRAY['shade','arch']::text[], true, 51, ARRAY['printdenture']::text[]),

  ('reline', 'Hard Reline', 'Chairside or lab hard reline on an existing PrintDenture prosthesis — mail-in shipper available.', 149, '3–5 business days', '#1B2B3A', ARRAY['arch']::text[], true, 60, ARRAY['printdenture']::text[]),
  ('reline', 'Soft Reline', 'Soft liner reline for tissue conditioning or patient comfort on existing dentures.', 179, '3–5 business days', '#1B2B3A', ARRAY['arch']::text[], true, 61, ARRAY['printdenture']::text[]),
  ('reline', 'Denture Repair', 'Tooth addition, fracture repair, or base repair on dentures originally made through PrintDenture.', 89, '2–4 business days', '#1B2B3A', ARRAY['arch']::text[], true, 62, ARRAY['printdenture']::text[]),

  ('partial', 'Removable Partial — Upper', 'Removable upper partial prosthesis from digital scan or model — shade and tooth setup included.', 349, '7–10 business days', '#1D9E75', ARRAY['shade','arch']::text[], true, 32, ARRAY['printdenture']::text[]),
  ('partial', 'Removable Partial — Lower', 'Removable lower partial prosthesis from digital workflow with clasp and tooth arrangement.', 349, '7–10 business days', '#1D9E75', ARRAY['shade','arch']::text[], true, 33, ARRAY['printdenture']::text[]),
  ('partial', 'Temporary Flipper', 'Single-tooth or short-span temporary partial for interim esthetics.', 199, '3–5 business days', '#1D9E75', ARRAY['shade','toothNumber']::text[], true, 34, ARRAY['printdenture']::text[]),

  ('removable', 'Night Guard', 'Custom-fit digital night guard for bruxism — soft, hard, or dual-laminate options.', 129, '5–7 business days', '#D97706', ARRAY['guardType']::text[], true, 80, ARRAY['printdenture']::text[]),
  ('removable', 'Sports Guard', 'Impact-resistant custom sports guard with team color options for pediatric and adult patients.', 149, '5–7 business days', '#9333EA', ARRAY['color']::text[], true, 81, ARRAY['printdenture']::text[])
) AS v(category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
WHERE NOT EXISTS (
  SELECT 1 FROM products p
  WHERE p.name = v.name
);
