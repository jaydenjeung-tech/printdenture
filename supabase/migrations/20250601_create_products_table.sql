-- Create shared product catalog (run this BEFORE the seed migration).
-- Safe to re-run: uses IF NOT EXISTS / DROP POLICY IF EXISTS.

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

COMMENT ON TABLE public.products IS
  'Lab product catalog shared across PrintCrown and PrintDenture storefronts.';
COMMENT ON COLUMN public.products.sites IS
  'Storefronts: printcrown, printdenture. NULL = use app default by category.';

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

-- Admin check (requires public.profiles with is_admin / role columns)
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
