-- Sequential 6-digit case numbers shared across doctor dashboard, admin, lab, and barcodes.

CREATE SEQUENCE IF NOT EXISTS public.order_case_number_seq;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS case_number integer;

-- Backfill existing orders oldest-first so numbers stay stable.
WITH numbered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS rn
  FROM public.orders
  WHERE case_number IS NULL
)
UPDATE public.orders o
SET case_number = n.rn
FROM numbered n
WHERE o.id = n.id;

SELECT setval(
  'public.order_case_number_seq',
  GREATEST(COALESCE((SELECT MAX(case_number) FROM public.orders), 0), 1),
  true
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_case_number_key
  ON public.orders (case_number)
  WHERE case_number IS NOT NULL;

CREATE OR REPLACE FUNCTION public.assign_order_case_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.case_number IS NULL THEN
    NEW.case_number := nextval('public.order_case_number_seq');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS orders_assign_case_number ON public.orders;
CREATE TRIGGER orders_assign_case_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_order_case_number();
