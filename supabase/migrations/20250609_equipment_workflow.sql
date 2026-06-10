-- JB Tray / JB Fork equipment workflow: profile readiness + equipment products + order_type

-- ── Profile equipment readiness ─────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS jb_tray_status text NOT NULL DEFAULT 'need'
    CHECK (jb_tray_status IN ('have', 'need', 'ordered')),
  ADD COLUMN IF NOT EXISTS jb_fork_status text NOT NULL DEFAULT 'need'
    CHECK (jb_fork_status IN ('have', 'need', 'ordered')),
  ADD COLUMN IF NOT EXISTS jb_tray_trained boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS jb_fork_trained boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.jb_tray_status IS 'have | need | ordered';
COMMENT ON COLUMN public.profiles.jb_fork_status IS 'have | need | ordered';

-- ── Order type (lab case vs equipment shipment) ───────────────────────────────
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_type text NOT NULL DEFAULT 'lab_case'
    CHECK (order_type IN ('lab_case', 'equipment'));

COMMENT ON COLUMN public.orders.order_type IS 'lab_case = denture/crown case; equipment = JB Tray/Fork kit';

-- ── Equipment products (PrintDenture direct sales) ───────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS products_category_name_key
  ON public.products (category, name);

INSERT INTO public.products (
  category, name, description, price, turnaround, accent, fields, active, sort_order, sites
) VALUES
  (
    'equipment',
    'JB Tray Starter Kit',
    'Upper tray × 5, lower tray × 5, and POP Bow × 5 sets — everything needed to start the JB Tray one-visit impression protocol.',
    299,
    '3–5 business days',
    '#5DCAA5',
    ARRAY['jbTray']::text[],
    true,
    1,
    ARRAY['printdenture']::text[]
  ),
  (
    'equipment',
    'JB Fork Radi+ Kit',
    'JB Fork Radi+ impression and jaw-relation device with anterior markers for facial, CBCT, and IOS alignment.',
    449,
    '3–5 business days',
    '#0F6E56',
    ARRAY['jbFork']::text[],
    true,
    2,
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
