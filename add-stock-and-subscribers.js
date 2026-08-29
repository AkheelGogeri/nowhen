require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;

  console.log("Added products.in_stock and newsletter_subscribers table.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
