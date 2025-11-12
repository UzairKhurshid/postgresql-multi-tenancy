import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import url from "url";

dotenv.config();
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function runMigrations() {
  const files = ["001_public.sql", "002_template_schema.sql", "003_helpers.sql"];
  for (const file of files) {
    const sql = fs.readFileSync(path.join(__dirname, "../migrations", file), "utf8");
    console.log("Running", file);
    await pool.query(sql);
  }
  console.log("✅ Migrations complete");
}

if (process.argv[2] === "migrate") {
  runMigrations().then(() => process.exit());
}
