-- Fix PrintDenture product categories by SKU name (not blanket category swap).
-- Partials → partial; guards → removable.

UPDATE products
SET category = 'partial'
WHERE name IN (
  'Flexible Partial Denture',
  'Cast Metal Partial Denture',
  'Removable Partial — Upper',
  'Removable Partial — Lower',
  'Temporary Flipper'
);

UPDATE products
SET category = 'removable'
WHERE name IN ('Night Guard', 'Sports Guard');

-- Legacy guard categories on PrintDenture
UPDATE products
SET category = 'removable'
WHERE category IN ('nightguard', 'sportsguard')
  AND (
    sites IS NULL
    OR cardinality(sites) = 0
    OR 'printdenture' = ANY (sites)
  );
