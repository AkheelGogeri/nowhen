require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      hero_slides JSONB DEFAULT '[]',
      marquee_text TEXT DEFAULT 'WEAR THE MOMENT',
      banner_text TEXT DEFAULT 'Outside of Time',
      collection_text TEXT DEFAULT 'New Collection Launched',
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;

  // Insert one row with your current hero images as the starting point
  await sql`
    INSERT INTO site_settings (id, hero_slides, marquee_text, banner_text, collection_text)
    VALUES (
      1,
      ${JSON.stringify([
        { desktop: "/img1.jpeg", mobile: "/img1-mobile.jpeg" },
        { desktop: "/img3.jpeg", mobile: "/img3-mobile.jpeg" },
      ])},
      'WEAR THE MOMENT',
      'Outside of Time',
      'New Collection Launched'
    )
    ON CONFLICT (id) DO NOTHING
  `;

  console.log("site_settings table created with default homepage content.");
}

setup().catch((err) => {
  console.error("Error creating site_settings table:", err);
  process.exit(1);
});