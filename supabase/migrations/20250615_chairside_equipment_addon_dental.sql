-- Chairside equipment: PNUADD / Add-on Dental 5-unit boxes at $99.
-- JB Tray upper/lower, ADD POP Bow, JB Fork Radi+ box. Retire single/2-pack fork SKUs.

UPDATE public.products SET active = false
WHERE category = 'equipment'
  AND name IN (
    'JB Tray Starter Kit',
    'JB Fork Radi+ — Single Unit',
    'JB Fork Radi+ — Practice 2-Pack',
    'JB Tray — POP Bow Box (5 sets)'
  );

UPDATE public.products SET
  price = 99,
  description = 'JB Tray maxillary moldable trays — one box of five. One-step final impression & jaw relation (PNUADD).',
  fields = ARRAY['jbTray', 'trayUpper']::text[],
  sort_order = 10
WHERE category = 'equipment' AND name = 'JB Tray — Upper Tray Box (5 EA)';

UPDATE public.products SET
  price = 99,
  description = 'JB Tray mandibular moldable trays with VD rods — one box of five (PNUADD).',
  fields = ARRAY['jbTray', 'trayLower']::text[],
  sort_order = 11
WHERE category = 'equipment' AND name = 'JB Tray — Lower Tray Box (5 EA)';

INSERT INTO public.products (category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
SELECT v.category, v.name, v.description, v.price, v.turnaround, v.accent, v.fields, v.active, v.sort_order, v.sites
FROM (VALUES
  ('equipment', 'ADD POP Bow — Box (5 sets)', 'ADD POP Bow prefabricated sets for occlusal plane and anterior esthetic transfer (PNUADD).', 99, '3–5 business days', '#5DCAA5', ARRAY['jbTray', 'popBow']::text[], true, 12, ARRAY['printdenture']::text[]),
  ('equipment', 'JB Fork Radi+ — Box (5 EA)', 'JB Fork Solution Radi+ jaw-relation devices — one box of five. Replaces occlusal wax rims; facial/CBCT/IOS alignment (PNUADD).', 99, '3–5 business days', '#0F6E56', ARRAY['jbFork', 'forkBox']::text[], true, 20, ARRAY['printdenture']::text[])
) AS v(category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.name = v.name);

UPDATE public.products SET
  price = 99,
  description = 'ADD POP Bow prefabricated sets for occlusal plane and anterior esthetic transfer (PNUADD).',
  fields = ARRAY['jbTray', 'popBow']::text[],
  sort_order = 12
WHERE category = 'equipment' AND name = 'ADD POP Bow — Box (5 sets)';

UPDATE public.products SET
  price = 99,
  description = 'JB Fork Solution Radi+ jaw-relation devices — one box of five. Replaces occlusal wax rims; facial/CBCT/IOS alignment (PNUADD).',
  fields = ARRAY['jbFork', 'forkBox']::text[],
  sort_order = 20
WHERE category = 'equipment' AND name = 'JB Fork Radi+ — Box (5 EA)';
