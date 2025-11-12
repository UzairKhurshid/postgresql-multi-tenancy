import { Router } from "express";
const r = Router();

// list customers
r.get("/", async (req, res) => {
  try {
    const { rows } = await req.db.query("SELECT * FROM customers ORDER BY id DESC LIMIT 50");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).send("Failed to fetch customers");
  }
});

// create customer
r.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    let query, params;

    if (req.tenant.tier === "premium") {
      // Premium tenant: schema-based isolation
      query = "INSERT INTO customers(name, email) VALUES ($1, $2) RETURNING *";
      params = [name, email];
    } else {
      // Free tenant: shared public schema, include tenant_id
      query = `
        INSERT INTO public.customers(tenant_id, name, email)
        VALUES ($1, $2, $3)
        RETURNING *`;
      params = [req.tenant.id, name, email];
    }

    const { rows } = await req.db.query(query, params);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating customer:", err);
    res.status(500).send("Failed to create customer");
  }
});

export default r;
