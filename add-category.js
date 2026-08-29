require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT`;
  console.log("Added products.category column.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
