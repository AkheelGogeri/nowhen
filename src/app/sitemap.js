import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nowhen.example.com";

  const staticRoutes = ["", "/shop", "/about", "/contact", "/faq", "/terms"].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));

  let productRoutes = [];
  try {
    const products = await sql`SELECT id, created_at FROM products`;
    productRoutes = products.map((p) => ({
      url: `${baseUrl}/shop/${p.id}`,
      lastModified: p.created_at,
    }));
  } catch (err) {
    console.error("Failed to build sitemap product routes:", err);
  }

  return [...staticRoutes, ...productRoutes];
}
