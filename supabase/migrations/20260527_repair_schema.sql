-- Safe, idempotent repair migration for audits and leads
-- This script is NON-DESTRUCTIVE: it only creates missing objects or adds
-- missing columns/indexes/constraints when safe to do so. It never drops
-- existing columns or data.

-- 1) Ensure UUID generation function is available (pgcrypto)
-- We use gen_random_uuid() from pgcrypto; creating the extension is safe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Create audits table if missing
-- Columns are added only if missing. Existing columns and data are left untouched.
CREATE TABLE IF NOT EXISTS audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tools jsonb,
  recommendations jsonb,
  total_monthly_savings numeric,
  total_annual_savings numeric,
  confidence numeric DEFAULT 0,
  summary text,
  team_size integer,
  public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3) Create leads table if missing
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id uuid,
  email text,
  company_name text,
  role text,
  team_size integer,
  created_at timestamptz DEFAULT now()
);

-- 4) Add missing columns to audits (idempotent)
ALTER TABLE audits
  ADD COLUMN IF NOT EXISTS tools jsonb,
  ADD COLUMN IF NOT EXISTS recommendations jsonb,
  ADD COLUMN IF NOT EXISTS total_monthly_savings numeric,
  ADD COLUMN IF NOT EXISTS total_annual_savings numeric,
  ADD COLUMN IF NOT EXISTS confidence numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS team_size integer,
  ADD COLUMN IF NOT EXISTS public boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE audits
  ALTER COLUMN confidence SET DEFAULT 0,
  ALTER COLUMN public SET DEFAULT false;

-- 5) Add missing columns to leads (idempotent)
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS audit_id uuid,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS role text,
  ADD COLUMN IF NOT EXISTS team_size integer,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 6) Ensure indexes exist for common lookups: audits.created_at and leads.audit_id
-- Use IF NOT EXISTS via conditional DO blocks because CREATE INDEX IF NOT EXISTS
-- is supported in modern Postgres, but we include guards for compatibility.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_audits_created_at'
  ) THEN
    CREATE INDEX idx_audits_created_at ON audits (created_at);
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'idx_leads_audit_id'
  ) THEN
    CREATE INDEX idx_leads_audit_id ON leads (audit_id);
  END IF;
END$$;

-- 7) Ensure foreign key from leads.audit_id -> audits.id exists and is valid
-- We only add the constraint if there are no dangling audit_id values
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_name='leads'
    AND tc.constraint_name='fk_leads_audit_id'
  ) THEN
    -- Verify there are no leads.audit_id values that don't exist in audits
    IF NOT EXISTS (
      SELECT 1 FROM leads l LEFT JOIN audits a ON l.audit_id = a.id
      WHERE l.audit_id IS NOT NULL AND a.id IS NULL
    ) THEN
      ALTER TABLE leads
        ADD CONSTRAINT fk_leads_audit_id FOREIGN KEY (audit_id)
        REFERENCES audits(id) ON DELETE CASCADE;
    ELSE
      RAISE NOTICE 'Skipping foreign key creation: dangling leads.audit_id rows exist';
    END IF;
  END IF;
END$$;

-- 8) Add helpful comments on schema for maintainers
COMMENT ON TABLE audits IS 'Audits produced by the audit engine. Non-destructive migration added missing columns only.';
COMMENT ON TABLE leads IS 'Lead capture table. audit_id references audits.id when present.';

-- End of repair migration
