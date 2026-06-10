-- Case files + record checklist snapshot on lab orders.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS record_checklist jsonb,
  ADD COLUMN IF NOT EXISTS case_files jsonb;

COMMENT ON COLUMN public.orders.record_checklist IS
  'Try-in-skip checklist confirmation snapshot at submission.';
COMMENT ON COLUMN public.orders.case_files IS
  'Uploaded case files: [{ kind, path, fileName }] — scans, CBCT, photos, etc.';
