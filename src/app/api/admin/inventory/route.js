import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const products = await sql`
      SELECT id, name, images, image, sizes, stock_by_size, stock_qty, category
      FROM products
      ORDER BY sort_order ASC NULLS LAST, created_at DESC
    `;
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}
