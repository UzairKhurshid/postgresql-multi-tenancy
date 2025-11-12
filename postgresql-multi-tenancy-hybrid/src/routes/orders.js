import { Router } from "express";
const r = Router();

// GET all orders
r.get("/", async (req, res) => {
  try {
    const { rows } = await req.db.query(`
      SELECT o.*, c.name AS customer_name
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ORDER BY o.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).send("Failed to fetch orders");
  }
});

// POST create new order
r.post("/", async (req, res) => {
  try {
    const { customer_id, amount_cents, status } = req.body;
    let query, params;

    if (req.tenant.tier === "premium") {
      // Premium tenant → schema-level isolation
      query = `
        INSERT INTO orders(customer_id, amount_cents, status)
        VALUES ($1, $2, COALESCE($3, 'pending'))
        RETURNING *`;
      params = [customer_id, amount_cents, status];
    } else {
      // Free tenant → shared table in public schema
      query = `
        INSERT INTO public.orders(tenant_id, customer_id, amount_cents, status)
        VALUES ($1, $2, $3, COALESCE($4, 'pending'))
        RETURNING *`;
      params = [req.tenant.id, customer_id, amount_cents, status];
    }

    const { rows } = await req.db.query(query, params);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).send("Failed to create order");
  }
});

// src/routes/orders.js
r.get("/customer/:id", async (req, res) => {
  try {
    const customerId = req.params.id;
    let query, params;

    if (req.tenant.tier === "premium") {
      // premium tenant → schema isolation
      query = `
        SELECT o.*, c.name AS customer_name
        FROM orders o
        JOIN customers c ON c.id = o.customer_id
        WHERE c.id = $1
        ORDER BY o.id DESC`;
      params = [customerId];
    } else {
      // free tenant → shared public tables
      query = `
        SELECT o.*, c.name AS customer_name
        FROM public.orders o
        JOIN public.customers c ON c.id = o.customer_id
        WHERE o.tenant_id = $1 AND c.id = $2
        ORDER BY o.id DESC`;
      params = [req.tenant.id, customerId];
    }

    const { rows } = await req.db.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching orders for customer:", err);
    res.status(500).send("Failed to fetch orders");
  }
});

export default r;
