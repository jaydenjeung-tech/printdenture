-- Partial dentures were moved to category 'partial' in 20250611_move_partials_to_partial_category.sql
-- PrintDenture guard SKUs use category 'removable' (night guard & sports guard).
UPDATE products
SET category = 'removable'
WHERE category IN ('nightguard', 'sportsguard')
  AND (
    sites IS NULL
    OR cardinality(sites) = 0
    OR 'printdenture' = ANY (sites)
  );
