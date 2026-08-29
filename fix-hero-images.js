require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function run() {
  const slides = [
    { desktop: "/img1.jpeg", mobile: "/img1-mobile.png" },
    { desktop: "/img3.png", mobile: "/img2-mobile.png" },
  ];

  await sql`
    UPDATE site_settings
    SET hero_slides = ${JSON.stringify(slides)}, updated_at = NOW()
    WHERE id = 1
  `;

  console.log("Hero slides updated to point at existing files.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
