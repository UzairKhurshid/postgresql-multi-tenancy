// src/tenantService.js
import { pool } from "./db.js";

export async function getTenant(tenantKey) {
  const { rows } = await pool.query(
    "SELECT * FROM public.tenants WHERE tenant_key = $1",
    [tenantKey]
  );
  return rows[0]; // Return full tenant record
}
