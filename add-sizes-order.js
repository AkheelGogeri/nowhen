require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS sizes TEXT[] DEFAULT ARRAY[]::TEXT[]
  `;

  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS sort_order INTEGER
  `;

  // Give existing products a sort_order based on creation date so nothing is unordered
  await sql`
    UPDATE products
    SET sort_order = sub.rn
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
      FROM products
    ) sub
    WHERE products.id = sub.id AND products.sort_order IS NULL
  `;

  console.log("Products table updated with sizes and sort_order.");
}

setup().catch((err) => {
  console.error("Error updating products table:", err);
  process.exit(1);
});