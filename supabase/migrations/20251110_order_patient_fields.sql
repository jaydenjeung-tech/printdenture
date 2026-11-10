-- Patient identity for the lab. Notes still carry the same lines if an older client omits these columns.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS patient_name text,
  ADD COLUMN IF NOT EXISTS patient_chart text,
  ADD COLUMN IF NOT EXISTS requested_delivery date,
  ADD COLUMN IF NOT EXISTS shade_note text;

COMMENT ON COLUMN public.orders.patient_name IS 'Patient on this lab case.';
COMMENT ON COLUMN public.orders.patient_chart IS 'Optional practice chart number.';
COMMENT ON COLUMN public.orders.requested_delivery IS 'Optional next visit the office asked the lab to meet.';
COMMENT ON COLUMN public.orders.shade_note IS 'Optional shade instruction, such as match an existing denture.';
