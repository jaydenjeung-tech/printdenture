-- Track scan outsourcing to external design partners (complete denture cases).

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS design_outsource_status text,
  ADD COLUMN IF NOT EXISTS design_outsource_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS design_outsource_email text,
  ADD COLUMN IF NOT EXISTS design_outsource_notes text,
  ADD COLUMN IF NOT EXISTS design_outsource_sent_by uuid;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_design_outsource_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_design_outsource_status_check
  CHECK (design_outsource_status IS NULL OR design_outsource_status IN ('sent', 'completed'));

COMMENT ON COLUMN public.orders.design_outsource_status IS
  'External CAD partner workflow: sent = files emailed; completed = design returned.';
COMMENT ON COLUMN public.orders.design_outsource_email IS
  'Design partner inbox used for the latest outsource send.';
COMMENT ON COLUMN public.orders.design_outsource_notes IS
  'Admin instructions included in the outsource email.';

CREATE INDEX IF NOT EXISTS orders_design_outsource_pending_idx
  ON public.orders (design_outsource_status)
  WHERE design_outsource_status IS NULL;
