// db.js
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getTenantClient(tenant) {
  const client = await pool.connect();

  if (tenant.is_premium) {
    // Switch to premium schema
    await client.query(`SET search_path TO ${tenant.schema_name}, public;`);
  } else {
    // Shared tenant - use row-level isolation
    await client.query(`SET app.current_tenant = '${tenant.id}';`);
  }

  return client;
}
