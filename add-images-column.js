require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  // Add an "images" column that stores an array of image URLs
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS images TEXT[]
  `;

  // Migrate existing single "image" values into the new "images" array
  await sql`
    UPDATE products
    SET images = ARRAY[image]
    WHERE images IS NULL AND image IS NOT NULL
  `;

  console.log("Products table updated with multi-image support.");
}

setup().catch((err) => {
  console.error("Error updating products table:", err);
  process.exit(1);
});