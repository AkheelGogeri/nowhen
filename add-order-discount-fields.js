require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS offer_code TEXT`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0`;
  console.log("Added offer_code and discount_amount to orders.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
