-- Which storefront created the row. Shared by PrintCrown and PrintDenture.
-- NULL stays visible on both (night guards, and messages that never named a case).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS site text
  CHECK (site IS NULL OR site IN ('printcrown', 'printdenture'));

ALTER TABLE public.support_messages
  ADD COLUMN IF NOT EXISTS site text
  CHECK (site IS NULL OR site IN ('printcrown', 'printdenture'));

COMMENT ON COLUMN public.orders.site IS
  'printcrown or printdenture. NULL = shared (guard) or not yet tagged.';

COMMENT ON COLUMN public.support_messages.site IS
  'printcrown or printdenture. NULL = general thread not tied to one storefront.';

UPDATE public.orders AS o
SET site = CASE
  WHEN p.sites @> ARRAY['printdenture']::text[]
    AND NOT (p.sites @> ARRAY['printcrown']::text[]) THEN 'printdenture'
  WHEN p.sites @> ARRAY['printcrown']::text[]
    AND NOT (p.sites @> ARRAY['printdenture']::text[]) THEN 'printcrown'
  WHEN p.category IN ('zirconia', 'printed', 'implant') THEN 'printcrown'
  WHEN p.category IN (
    'complete', 'partial', 'immediate', 'overdenture', 'reline', 'removable', 'jb_tray', 'equipment'
  ) THEN 'printdenture'
  ELSE NULL
END
FROM public.products AS p
WHERE o.product_id = p.id
  AND o.site IS NULL;

UPDATE public.support_messages AS m
SET site = o.site
FROM public.orders AS o
WHERE m.order_id = o.id
  AND m.site IS NULL
  AND o.site IS NOT NULL;
