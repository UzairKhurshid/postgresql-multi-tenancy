CREATE SCHEMA IF NOT EXISTS tmpl;

CREATE TABLE tmpl.customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE tmpl.orders (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES tmpl.customers(id) ON DELETE CASCADE,
  amount_cents INT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);
