require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_by_size JSONB DEFAULT '{}'`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_qty INTEGER`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS promo_enabled BOOLEAN DEFAULT false`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS promo_text TEXT`;
  await sql`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS promo_link TEXT`;

  // Backfill existing in-stock products with a starting count per size so the site
  // doesn't suddenly show everything as sold out. These are placeholders —
  // go set real counts on /admin/inventory.
  const products = await sql`SELECT id, sizes, in_stock FROM products`;
  for (const p of products) {
    if (p.sizes && p.sizes.length > 0) {
      const counts = {};
      for (const size of p.sizes) {
        counts[size] = p.in_stock === false ? 0 : 10;
      }
      await sql`UPDATE products SET stock_by_size = ${JSON.stringify(counts)} WHERE id = ${p.id}`;
    } else {
      await sql`UPDATE products SET stock_qty = ${p.in_stock === false ? 0 : 10} WHERE id = ${p.id}`;
    }
  }

  console.log("Inventory columns added and backfilled with placeholder counts (10 per size for in-stock items).");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
