-- PrintDenture design-only orders handed to Ultran OS. Vendor assignment stays in Ultran.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS ultran_case_id uuid,
  ADD COLUMN IF NOT EXISTS ultran_os_number text,
  ADD COLUMN IF NOT EXISTS ultran_handoff_error text;

COMMENT ON COLUMN public.orders.ultran_os_number IS
  'Ultran OS number after a design-only order is ingested. JBJD is assigned in Ultran.';
