-- Unify Night Guard & Sports Guard across PrintCrown and PrintDenture.
-- One SKU per guard type (nightguard / sportsguard), visible on both sites.

-- Deactivate legacy PrintDenture rows in removable when a canonical guard row already exists.
UPDATE public.products SET active = false
WHERE category = 'removable'
  AND name IN ('Night Guard', 'Sports Guard')
  AND EXISTS (
    SELECT 1 FROM public.products canonical
    WHERE canonical.name = products.name
      AND canonical.category IN ('nightguard', 'sportsguard')
      AND canonical.id <> products.id
  );

-- Promote removable-only guard rows to canonical categories.
UPDATE public.products SET
  category = 'nightguard',
  sites = ARRAY['printcrown', 'printdenture']::text[],
  fields = ARRAY['guardType', 'arch']::text[],
  description = 'Custom-fit digital night guard for bruxism — soft, hard, or dual-laminate options.',
  price = 129,
  accent = '#D97706',
  sort_order = 80,
  active = true
WHERE category = 'removable' AND name = 'Night Guard'
  AND NOT EXISTS (
    SELECT 1 FROM public.products p2
    WHERE p2.category = 'nightguard' AND p2.name = 'Night Guard'
  );

UPDATE public.products SET
  category = 'sportsguard',
  sites = ARRAY['printcrown', 'printdenture']::text[],
  fields = ARRAY['color', 'arch']::text[],
  description = 'Impact-resistant custom sports guard with team color options for pediatric and adult patients.',
  price = 149,
  accent = '#9333EA',
  sort_order = 81,
  active = true
WHERE category = 'removable' AND name = 'Sports Guard'
  AND NOT EXISTS (
    SELECT 1 FROM public.products p2
    WHERE p2.category = 'sportsguard' AND p2.name = 'Sports Guard'
  );

-- Align canonical guard rows (including existing PrintCrown catalog).
UPDATE public.products SET
  sites = ARRAY['printcrown', 'printdenture']::text[],
  fields = ARRAY['guardType', 'arch']::text[],
  description = 'Custom-fit digital night guard for bruxism — soft, hard, or dual-laminate options.',
  price = 129,
  accent = '#D97706',
  sort_order = 80,
  active = true
WHERE category = 'nightguard' AND name = 'Night Guard';

UPDATE public.products SET
  sites = ARRAY['printcrown', 'printdenture']::text[],
  fields = ARRAY['color', 'arch']::text[],
  description = 'Impact-resistant custom sports guard with team color options for pediatric and adult patients.',
  price = 149,
  accent = '#9333EA',
  sort_order = 81,
  active = true
WHERE category = 'sportsguard' AND name = 'Sports Guard';

-- Insert shared guard SKUs when missing entirely.
INSERT INTO public.products (category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
SELECT v.category, v.name, v.description, v.price, v.turnaround, v.accent, v.fields, v.active, v.sort_order, v.sites
FROM (VALUES
  ('nightguard', 'Night Guard', 'Custom-fit digital night guard for bruxism — soft, hard, or dual-laminate options.', 129, '5–7 business days', '#D97706', ARRAY['guardType', 'arch']::text[], true, 80, ARRAY['printcrown', 'printdenture']::text[]),
  ('sportsguard', 'Sports Guard', 'Impact-resistant custom sports guard with team color options for pediatric and adult patients.', 149, '5–7 business days', '#9333EA', ARRAY['color', 'arch']::text[], true, 81, ARRAY['printcrown', 'printdenture']::text[])
) AS v(category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.name = v.name AND p.category = v.category);
