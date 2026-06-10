-- Simplify PrintDenture lab-case SKUs: one product per prosthesis/protocol; arch in case details.

UPDATE public.products SET active = false
WHERE name IN (
  'Complete Denture — Upper (JB Fork)',
  'Complete Denture — Lower (JB Fork)',
  'Complete Denture — Full Set (JB Fork)',
  'Complete Denture — Upper (JB Tray)',
  'Complete Denture — Lower (JB Tray)',
  'Complete Denture — Full Set (JB Tray)',
  'Complete Denture — Upper',
  'Complete Denture — Lower',
  'Complete Denture — Full Set',
  'JB Tray Case — Upper',
  'JB Tray Case — Lower',
  'JB Tray Case — Full Set',
  'Immediate Denture — Single Arch',
  'Immediate Denture — Full Set',
  'Removable Partial — Upper',
  'Removable Partial — Lower'
);

INSERT INTO public.products (category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
SELECT v.category, v.name, v.description, v.price, v.turnaround, v.accent, v.fields, v.active, v.sort_order, v.sites
FROM (VALUES
  ('complete', 'Complete Denture — JB Fork Radi+', 'Definitive complete denture from JB Fork-aligned digital scans. Choose upper, lower, or both in case details.', 449, '7–12 business days', '#0F6E56', ARRAY['shade','arch']::text[], true, 10, ARRAY['printdenture']::text[]),
  ('jb_tray', 'Complete Denture — JB Tray', 'Complete denture from JB Tray final impression and jaw relation. Choose upper, lower, or both in case details.', 429, '7–12 business days', '#5DCAA5', ARRAY['shade','arch']::text[], true, 20, ARRAY['printdenture']::text[]),
  ('immediate', 'Immediate Denture', 'Delivery denture at extraction or shortly after — from pre-op or day-of scans. No JB equipment check.', 479, '5–10 business days', '#085041', ARRAY['shade','arch']::text[], true, 30, ARRAY['printdenture']::text[]),
  ('partial', 'Removable Partial Denture', 'Removable partial prosthesis from digital scan or model — shade and tooth setup included.', 349, '7–10 business days', '#1D9E75', ARRAY['shade','arch']::text[], true, 42, ARRAY['printdenture']::text[]),
  ('overdenture', 'All-on-X Fixed Prosthesis', 'Fixed full-arch implant prosthesis from aligned scan sets — JB Fork Radi+ record protocol.', 1499, '14–21 business days', '#378ADD', ARRAY['shade','arch']::text[], true, 52, ARRAY['printdenture']::text[])
) AS v(category, name, description, price, turnaround, accent, fields, active, sort_order, sites)
WHERE NOT EXISTS (SELECT 1 FROM public.products p WHERE p.name = v.name);

UPDATE public.products SET
  description = 'Definitive complete denture from JB Fork-aligned digital scans. Choose upper, lower, or both in case details.',
  price = 449,
  fields = ARRAY['shade','arch']::text[],
  active = true,
  sort_order = 10
WHERE name = 'Complete Denture — JB Fork Radi+';

UPDATE public.products SET
  description = 'Complete denture from JB Tray final impression and jaw relation. Choose upper, lower, or both in case details.',
  price = 429,
  fields = ARRAY['shade','arch']::text[],
  active = true,
  sort_order = 20
WHERE name = 'Complete Denture — JB Tray';

UPDATE public.products SET
  name = 'Immediate Denture',
  description = 'Delivery denture at extraction or shortly after — from pre-op or day-of scans. No JB equipment check.',
  price = 479,
  fields = ARRAY['shade','arch']::text[],
  active = true,
  sort_order = 30
WHERE name IN ('Immediate Denture', 'Immediate Denture — Single Arch');
