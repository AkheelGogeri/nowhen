require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  await sql`
    CREATE TABLE IF NOT EXISTS offers (
      id SERIAL PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discount_percent INTEGER,
      discount_amount INTEGER,
      active BOOLEAN DEFAULT true,
      expires_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      razorpay_order_id TEXT,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      items JSONB,
      amount INTEGER,
      status TEXT DEFAULT 'created',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Offers and orders tables created successfully.");
}

setup().catch((err) => {
  console.error("Error setting up tables:", err);
  process.exit(1);
});