import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const products = await sql`SELECT * FROM products ORDER BY sort_order ASC NULLS LAST, created_at DESC`;
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { name, price, sizes, images } = await req.json();

    if (!name || !price || !images || images.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // New products go to the end of the order
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) AS max FROM products`;
    const nextOrder = maxOrder[0].max + 1;

    const result = await sql`
      INSERT INTO products (name, price, sizes, images, image, sort_order)
      VALUES (${name}, ${price}, ${sizes || []}, ${images}, ${images[0]}, ${nextOrder})
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}