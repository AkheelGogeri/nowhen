const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      image TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  console.log("Products table created successfully!");

  // Insert your existing 3 products so the shop isn't empty
  await sql`
    INSERT INTO products (name, price, image, description)
    VALUES
      ('Nowhen Signature Tee — Black', 899, '/logo.png', 'Oversized 240 GSM tee'),
      ('Nowhen Signature Tee — Bone', 899, '/logo.png', 'Oversized 240 GSM tee'),
      ('Nowhen Oversized Tee — Charcoal', 999, '/logo.png', 'Oversized 240 GSM tee')
  `;
  console.log("Sample products added!");
}

setup();