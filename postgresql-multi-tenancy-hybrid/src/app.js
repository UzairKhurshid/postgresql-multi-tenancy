import express from "express";
import dotenv from "dotenv";
import { setTenant } from "./middleware/setTenant.js";
import customers from "./routes/customers.js";
import orders from "./routes/orders.js";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("Multi-tenant API is running 🚀"));
app.use("/customers", setTenant, customers);
app.use("/orders", setTenant, orders);

app.listen(process.env.PORT, () =>
  console.log(`✅ Server started on port ${process.env.PORT}`)
);
