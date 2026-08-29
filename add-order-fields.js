require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  await sql`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT
  `;

  await sql`
    ALTER TABLE orders
    ADD COLUMN IF NOT EXISTS shipping_address TEXT
  `;

  console.log("Orders table updated with razorpay_payment_id and shipping_address.");
}

setup().catch((err) => {
  console.error("Error updating orders table:", err);
  process.exit(1);
});
