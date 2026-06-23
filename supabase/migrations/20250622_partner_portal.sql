-- Design partner portal: assign cases to partner users and store returned CAD files.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS design_outsource_partner_id uuid,
  ADD COLUMN IF NOT EXISTS design_deliverables jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.orders.design_outsource_partner_id IS
  'Assigned design partner (profiles.id where role = design_partner).';
COMMENT ON COLUMN public.orders.design_deliverables IS
  'CAD files uploaded by the design partner: [{path,fileName,uploadedAt,uploadedBy}].';

CREATE INDEX IF NOT EXISTS orders_design_outsource_partner_idx
  ON public.orders (design_outsource_partner_id)
  WHERE design_outsource_partner_id IS NOT NULL;
