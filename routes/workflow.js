// routes/userRoutes.js
const express = require("express");
const { getTenantClient } = require("../config/tenantManager");

const router = express.Router({ mergeParams: true });

router.post("/", async (req, res) => {
  const { tenantId } = req.params;
  const { name, email } = req.body;

  const client = await getTenantClient(tenantId);
  try {
    await client.query("INSERT INTO users (name, email) VALUES ($1, $2)", [name, email]);
    res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create user" });
  } finally {
    client.release();
  }
});

router.get("/", async (req, res) => {
  const { tenantId } = req.params;
  const client = await getTenantClient(tenantId);
  try {
    const { rows } = await client.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  } finally {
    client.release();
  }
});

module.exports = router;
