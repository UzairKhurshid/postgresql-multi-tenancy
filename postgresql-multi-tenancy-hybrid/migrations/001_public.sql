CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_key text UNIQUE NOT NULL,
  schema_name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);
