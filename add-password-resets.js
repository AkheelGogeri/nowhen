require("dotenv").config({ path: ".env.local" });
const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function run() {
  await sql`
    CREATE TABLE IF NOT EXISTS password_resets (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("Created password_resets table.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
