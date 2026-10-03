require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'online'`;
  await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS note TEXT`;
  await sql`UPDATE orders SET source = 'online' WHERE source IS NULL`;
  console.log("Added orders.source and orders.note.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
