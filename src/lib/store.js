import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

// Server-side reads used by pages that render on the server (homepage,
// product metadata). Each one returns a safe fallback instead of throwing,
// so a database hiccup degrades the page rather than breaking it.

export async function getProducts() {
  try {
    return await sql`SELECT * FROM products ORDER BY sort_order ASC NULLS LAST, created_at DESC`;
  } catch (err) {
    console.error("Failed to load products:", err);
    return [];
  }
}

export async function getProduct(id) {
  if (!/^\d+$/.test(String(id))) return null;
  try {
    const result = await sql`SELECT * FROM products WHERE id = ${id}`;
    return result[0] || null;
  } catch (err) {
    console.error("Failed to load product:", err);
    return null;
  }
}

export async function getSettings() {
  try {
    const result = await sql`SELECT * FROM site_settings WHERE id = 1`;
    return result[0] || {};
  } catch (err) {
    console.error("Failed to load settings:", err);
    return {};
  }
}

export async function getRecentReviews() {
  try {
    return await sql`
      SELECT reviews.id, reviews.name, reviews.rating, reviews.comment, reviews.created_at,
             products.id AS product_id, products.name AS product_name
      FROM reviews
      JOIN products ON products.id = reviews.product_id
      WHERE reviews.approved = true AND reviews.comment IS NOT NULL AND reviews.comment != ''
      ORDER BY reviews.created_at DESC
      LIMIT 3
    `;
  } catch (err) {
    console.error("Failed to load reviews:", err);
    return [];
  }
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nowhen.in";
