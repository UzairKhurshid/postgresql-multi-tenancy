CREATE OR REPLACE FUNCTION public.provision_tenant(p_tenant_key TEXT, p_schema TEXT)
RETURNS void AS $$
BEGIN
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', p_schema);
  EXECUTE format('CREATE TABLE %I.customers (LIKE tmpl.customers INCLUDING ALL)', p_schema);
  EXECUTE format('CREATE TABLE %I.orders (LIKE tmpl.orders INCLUDING ALL)', p_schema);
  EXECUTE format('ALTER TABLE %I.orders DROP CONSTRAINT IF EXISTS orders_customer_id_fkey', p_schema);
  EXECUTE format('ALTER TABLE %I.orders ADD CONSTRAINT %I FOREIGN KEY (customer_id) REFERENCES %I.customers(id) ON DELETE CASCADE',
    p_schema, p_schema || '_orders_fk', p_schema);
  INSERT INTO public.tenants(tenant_key, schema_name)
  VALUES (p_tenant_key, p_schema)
  ON CONFLICT (tenant_key) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
