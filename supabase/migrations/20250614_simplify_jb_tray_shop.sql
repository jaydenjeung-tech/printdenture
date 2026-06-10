-- JB Tray shop: retire bundled starter kit; upper/lower 5-packs at $99.

UPDATE public.products SET active = false
WHERE category = 'equipment' AND name = 'JB Tray Starter Kit';

UPDATE public.products SET
  price = 99,
  description = 'Five maxillary JB Tray moldable trays — one box, $99.',
  fields = ARRAY['jbTray', 'trayUpper']::text[],
  sort_order = 10
WHERE category = 'equipment' AND name = 'JB Tray — Upper Tray Box (5 EA)';

UPDATE public.products SET
  price = 99,
  description = 'Five mandibular JB Tray moldable trays with VD rods — one box, $99.',
  fields = ARRAY['jbTray', 'trayLower']::text[],
  sort_order = 11
WHERE category = 'equipment' AND name = 'JB Tray — Lower Tray Box (5 EA)';

UPDATE public.products SET sort_order = 12
WHERE category = 'equipment' AND name = 'JB Tray — POP Bow Box (5 sets)';
