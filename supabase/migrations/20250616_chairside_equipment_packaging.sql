-- Chairside equipment: correct PNUADD / Add-on Dental packaging.
-- JB Tray box = 5 upper/lower sets ($99). JB Fork box = 10 EA ($99). POP Bow pouch = 12 sets ($21).

UPDATE public.products SET active = false
WHERE category = 'equipment'
  AND name IN (
    'JB Tray Starter Kit',
    'JB Tray — Upper Tray Box (5 EA)',
    'JB Tray — Lower Tray Box (5 EA)',
    'JB Tray — POP Bow Box (5 sets)',
    'ADD POP Bow — Box (5 sets)',
    'JB Fork Radi+ — Single Unit',
    'JB Fork Radi+ — Practice 2-Pack',
    'JB Fork Radi+ — Box (5 EA)'
  );

INSERT INTO public.products (category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
SELECT v.category, v.name, v.description, v.price, v.turnaround, v.accent, v.fields, v.active, v.sort_order, v.sites
FROM (VALUES
  ('equipment', 'JB Tray — Box (5 sets)', 'One box with five upper + lower JB Tray sets (no POP Bow). One-step final impression & jaw relation (PNUADD).', 99, '3–5 business days', '#5DCAA5', ARRAY['jbTray', 'trayBox']::text[], true, 10, ARRAY['printdenture']::text[]),
  ('equipment', 'JB Fork Radi+ — Box (10 EA)', 'One box with ten JB Fork Solution Radi+ devices (no POP Bow). Jaw relation for digital & implant cases (PNUADD).', 99, '3–5 business days', '#0F6E56', ARRAY['jbFork', 'forkBox']::text[], true, 20, ARRAY['printdenture']::text[]),
  ('equipment', 'ADD POP Bow — Pouch (12 sets)', 'Separate pouch with twelve ADD POP Bow sets for occlusal plane & anterior esthetic transfer (PNUADD).', 21, '3–5 business days', '#5DCAA5', ARRAY['popBow', 'popBowPouch']::text[], true, 30, ARRAY['printdenture']::text[])
) AS v(category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.name = v.name);

UPDATE public.products SET
  price = 99,
  description = 'One box with five upper + lower JB Tray sets (no POP Bow). One-step final impression & jaw relation (PNUADD).',
  fields = ARRAY['jbTray', 'trayBox']::text[],
  active = true,
  sort_order = 10
WHERE category = 'equipment' AND name = 'JB Tray — Box (5 sets)';

UPDATE public.products SET
  price = 99,
  description = 'One box with ten JB Fork Solution Radi+ devices (no POP Bow). Jaw relation for digital & implant cases (PNUADD).',
  fields = ARRAY['jbFork', 'forkBox']::text[],
  active = true,
  sort_order = 20
WHERE category = 'equipment' AND name = 'JB Fork Radi+ — Box (10 EA)';

UPDATE public.products SET
  price = 21,
  description = 'Separate pouch with twelve ADD POP Bow sets for occlusal plane & anterior esthetic transfer (PNUADD).',
  fields = ARRAY['popBow', 'popBowPouch']::text[],
  active = true,
  sort_order = 30
WHERE category = 'equipment' AND name = 'ADD POP Bow — Pouch (12 sets)';
