-- Partial dentures that were stored under category 'removable' → partial (by name only).
UPDATE products
SET category = 'partial'
WHERE category = 'removable'
  AND name IN (
    'Flexible Partial Denture',
    'Cast Metal Partial Denture',
    'Removable Partial — Upper',
    'Removable Partial — Lower',
    'Temporary Flipper'
  );
