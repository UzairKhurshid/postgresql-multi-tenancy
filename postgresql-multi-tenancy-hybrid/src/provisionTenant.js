import { pool } from "./db.js";

async function main() {
  const tenantKey = process.argv[2];
  const schema = process.argv[3];
  const tier = process.argv[4] || "free"; // default tier is 'free'

  if (!tenantKey) {
    console.log("Usage: node src/provisionTenant.js <tenant_key> <schema_name_or_null> [tier]");
    console.log("Example for free: node src/provisionTenant.js beta null free");
    console.log("Example for premium: node src/provisionTenant.js acme t_acme premium");
    process.exit(1);
  }

  const schemaValue = schema === "null" ? null : schema;

  // Insert tenant record
  await pool.query(
    `INSERT INTO public.tenants (tenant_key, schema_name, tier)
     VALUES ($1, $2, $3)
     ON CONFLICT (tenant_key) DO UPDATE SET tier = EXCLUDED.tier`,
    [tenantKey, schemaValue, tier]
  );

  // Create schema only for premium tenants
  if (tier === "premium") {
    await pool.query("SELECT public.provision_tenant($1, $2)", [tenantKey, schemaValue]);
    console.log(`✅ Premium tenant '${tenantKey}' created with schema '${schemaValue}'`);
  } else {
    console.log(`✅ Free tenant '${tenantKey}' created (shared public schema)`);
  }

  process.exit(0);
}

main();
