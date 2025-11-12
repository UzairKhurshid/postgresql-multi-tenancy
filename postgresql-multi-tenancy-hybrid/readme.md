1:run migrations.
node src/db.js migrate
2:ALTER TABLE public.tenants ADD COLUMN tier TEXT DEFAULT 'free';
3:provision tenants
🏆 Premium Tenant (dedicated schema)
node src/provisionTenant.js acme t_acme premium
✅ This:
Creates schema t_acme
Copies tables from tmpl
Adds an entry in public.tenants
💡 Free Tenant (shared schema)
run this to drop constraint
ALTER TABLE public.tenants ALTER COLUMN schema_name DROP NOT NULL;
node src/provisionTenant.js beta null free
✅ This only adds an entry in public.tenants, no schema.

4: create customers and orders table for public as well.
CREATE TABLE public.customers (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.orders (
  id SERIAL PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  customer_id INT NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL CHECK (amount_cents >= 0),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);


4:start server
node src/app.js
5:TESt:
🧮 STEP 7: Re-Test Everything
✅ Create Customer (free)
Invoke-RestMethod -Uri "http://localhost:3000/customers" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "x-tenant" = "beta" } `
  -Body '{"name": "Bob", "email": "bob@beta.com"}'

Fetch customer list
Invoke-RestMethod -Uri "http://localhost:3000/customers" `
  -Headers @{ "x-tenant" = "beta" }


create order
Invoke-RestMethod -Uri "http://localhost:3000/orders" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "x-tenant" = "beta" } `
  -Body '{"customer_id": 4, "amount_cents": 4999, "status": "paid"}'


Fetch orders for free tenant
Invoke-RestMethod -Uri "http://localhost:3000/orders" `
  -Headers @{ "x-tenant" = "beta" }

fetch order of a specific tenant in public
Invoke-RestMethod -Uri "http://localhost:3000/orders/customer/3" `
  -Headers @{ "x-tenant" = "beta" }

✅ Create Customer (premiumm)
Invoke-RestMethod -Uri "http://localhost:3000/customers" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "x-tenant" = "acme" } `
  -Body '{"name": "Alice", "email": "alice@acme.com"}'
Then fetch:
Invoke-RestMethod -Uri "http://localhost:3000/customers" `
  -Headers @{ "x-tenant" = "acme" }

create order
Invoke-RestMethod -Uri "http://localhost:3000/orders" `
  -Method POST `
  -Headers @{ "Content-Type" = "application/json"; "x-tenant" = "acme" } `
  -Body '{"customer_id": 1, "amount_cents": 2999, "status": "paid"}'

fetch orders
Invoke-RestMethod -Uri "http://localhost:3000/orders" `
  -Headers @{ "x-tenant" = "acme" }

🧩 STEP 8: (Optional) Verify in pgAdmin
You can expand:
Databases → mts → Schemas →
  public → Tables → customers (shared)
  t_acme → Tables → customers (premium)
And even run:
SELECT * FROM t_acme.customers;
SELECT * FROM public.customers;
✅ Each tenant is completely separate.



!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
Now Migrating Customer and his data from public to separate schema 
1:create a new tenant entry in teneants table
SELECT public.provision_tenant('bob', 't_bob');
this will create customers and orders table for t_bob

2:Then insert into your tenants table:
INSERT INTO public.tenants (tenant_key, schema_name, tier)
VALUES ('bob', 't_bob', 'premium');

3:Fetch tenant id from public.tenants
SELECT id FROM public.tenants WHERE tenant_key = 'beta'; --a4ef6f09-6b9e-4d13-b00c-cb9155e6bb8e

4:Insert into t_bob customers
INSERT INTO t_bob.customers (id, name, email, created_at)
SELECT c.id, c.name, c.email, c.created_at
FROM public.customers c
WHERE c.tenant_id = 'a4ef6f09-6b9e-4d13-b00c-cb9155e6bb8e' AND c.email = 'bob@beta.com';

4:Insert into t_bob orders
INSERT INTO t_bob.orders (id, customer_id, amount_cents, status, created_at)
SELECT o.id, o.customer_id, o.amount_cents, o.status, o.created_at
FROM public.orders o
JOIN public.customers c ON c.id = o.customer_id
WHERE c.email = 'bob@beta.com' AND c.tenant_id = 'a4ef6f09-6b9e-4d13-b00c-cb9155e6bb8e';


5: Clean up public data
DELETE FROM public.orders
WHERE tenant_id = '<old_tenant_id>'
  AND customer_id IN (
    SELECT id FROM public.customers
    WHERE tenant_id = '<old_tenant_id>' AND email = 'bob@beta.com'
  );

DELETE FROM public.customers
WHERE tenant_id = '<old_tenant_id>' AND email = 'bob@beta.com';
