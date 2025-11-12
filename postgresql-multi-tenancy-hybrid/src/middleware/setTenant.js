// src/middleware/setTenant.js
import { pool } from "../db.js";
import { getTenant } from "../tenantService.js";

export async function setTenant(req, res, next) {
  try {
    const tenantKey = req.headers[process.env.TENANT_HEADER];
    if (!tenantKey) return res.status(400).send("Missing tenant key");

    const tenant = await getTenant(tenantKey);
    if (!tenant) return res.status(404).send("Tenant not found");

    const client = await pool.connect();

    if (tenant.tier === "premium") {
      // Premium tenants use their own schema
      await client.query(`SET search_path TO ${tenant.schema_name}, public`);
    } else {
      // Free tenants share the public schema, with Row-Level Security
      await client.query(`SET app.current_tenant = '${tenant.id}'`);
      await client.query(`SET search_path TO public`);
    }

    req.db = client;
    req.tenant = tenant;

    res.on("finish", () => client.release());
    next();
  } catch (err) {
    console.error("Error in setTenant:", err);
    res.status(500).send("Internal Server Error");
  }
}
