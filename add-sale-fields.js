require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function run() {
  // Optional "was" price (MRP). When it's higher than price, the store shows a strikethrough + % off.
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_at_price INTEGER`;
  // Bundle codes: the code only applies when the cart has at least this many items (e.g. BUY2).
  await sql`ALTER TABLE offers ADD COLUMN IF NOT EXISTS min_items INTEGER`;
  console.log("Added products.compare_at_price and offers.min_items columns.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
