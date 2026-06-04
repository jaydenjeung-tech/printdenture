-- Run in Supabase SQL Editor (shared project used by PrintCrown + PrintDenture).
-- Controls which storefront shows each product.

ALTER TABLE products
ADD COLUMN IF NOT EXISTS sites text[] DEFAULT NULL;

COMMENT ON COLUMN products.sites IS
  'Storefronts: printcrown, printdenture. NULL = use app default by category.';

-- Optional: backfill existing rows (adjust categories to match your DB)
UPDATE products SET sites = ARRAY['printcrown']::text[]
WHERE category IN ('zirconia', 'printed', 'implant', 'nightguard', 'sportsguard')
  AND (sites IS NULL OR sites = '{}');

UPDATE products SET sites = ARRAY['printdenture']::text[]
WHERE category IN ('complete', 'partial', 'immediate', 'overdenture', 'reline', 'removable', 'jb_tray')
  AND (sites IS NULL OR sites = '{}');
