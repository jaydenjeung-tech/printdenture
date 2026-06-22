-- Practice account approval workflow (Option B)
-- Run in Supabase SQL Editor (shared project used by PrintCrown + PrintDenture).

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'approved';

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_account_status_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_account_status_check
  CHECK (account_status IN ('pending', 'approved', 'rejected'));

COMMENT ON COLUMN profiles.account_status IS
  'pending = self-registered awaiting admin approval; approved = active; rejected = denied';

-- Existing accounts remain approved via DEFAULT 'approved'.

CREATE INDEX IF NOT EXISTS profiles_account_status_idx ON profiles (account_status)
  WHERE account_status = 'pending';
