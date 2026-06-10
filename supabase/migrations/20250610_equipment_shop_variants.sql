-- Equipment shop variants: starter kits, single boxes, and multi-packs
-- (products table may predate updated_at — add column safely before upserts)

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

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

-- Required for INSERT ... ON CONFLICT (category, name) on older products tables
CREATE UNIQUE INDEX IF NOT EXISTS products_category_name_key
  ON public.products (category, name);

INSERT INTO public.products (
  category, name, description, price, turnaround, accent, fields, active, sort_order, sites
) VALUES
  (
    'equipment',
    'JB Tray — Upper Tray Box (5 EA)',
    'One box of five maxillary JB Tray moldable trays. Ideal for practices that already have lower trays or POP Bow.',
    109,
    '3–5 business days',
    '#5DCAA5',
    ARRAY['jbTray', 'trayUpper']::text[],
    true,
    11,
    ARRAY['printdenture']::text[]
  ),
  (
    'equipment',
    'JB Tray — Lower Tray Box (5 EA)',
    'One box of five mandibular JB Tray moldable trays with VD rods.',
    109,
    '3–5 business days',
    '#5DCAA5',
    ARRAY['jbTray', 'trayLower']::text[],
    true,
    12,
    ARRAY['printdenture']::text[]
  ),
  (
    'equipment',
    'JB Tray — POP Bow Box (5 sets)',
    'POP Bow sets for occlusal plane and anterior tooth position transfer with the JB Tray protocol.',
    95,
    '3–5 business days',
    '#5DCAA5',
    ARRAY['jbTray', 'popBow']::text[],
    true,
    13,
    ARRAY['printdenture']::text[]
  ),
  (
    'equipment',
    'JB Fork Radi+ — Practice 2-Pack',
    'Two JB Fork Radi+ units for busy edentulous / full-arch practices — save vs. single-unit pricing.',
    799,
    '3–5 business days',
    '#0F6E56',
    ARRAY['jbFork', 'forkTwin']::text[],
    true,
    21,
    ARRAY['printdenture']::text[]
  )
ON CONFLICT (category, name) DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  turnaround = EXCLUDED.turnaround,
  accent = EXCLUDED.accent,
  fields = EXCLUDED.fields,
  active = EXCLUDED.active,
  sort_order = EXCLUDED.sort_order,
  sites = EXCLUDED.sites;

-- Tag starter / default SKUs for order-flow quick purchase
UPDATE public.products
SET fields = ARRAY['jbTray', 'starter']::text[]
WHERE category = 'equipment' AND name = 'JB Tray Starter Kit';

UPDATE public.products
SET
  name = 'JB Fork Radi+ — Single Unit',
  description = 'One JB Fork Radi+ device with anterior markers for facial, CBCT, and IOS alignment.',
  fields = ARRAY['jbFork', 'forkSingle']::text[],
  sort_order = 20
WHERE category = 'equipment' AND name = 'JB Fork Radi+ Kit';
