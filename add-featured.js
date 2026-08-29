require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false`;
  console.log("Added products.featured column.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
