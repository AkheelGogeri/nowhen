import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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
    const { name, price, compare_at_price, sizes, images, description, in_stock, category, featured } = await req.json();

    if (!name || !price || !images || images.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // New products go to the end of the order
    const maxOrder = await sql`SELECT COALESCE(MAX(sort_order), 0) AS max FROM products`;
    const nextOrder = maxOrder[0].max + 1;

    const result = await sql`
      INSERT INTO products (name, price, compare_at_price, sizes, images, image, sort_order, description, in_stock, category, featured)
      VALUES (${name}, ${price}, ${compare_at_price || null}, ${sizes || []}, ${images}, ${images[0]}, ${nextOrder}, ${description || null}, ${in_stock ?? true}, ${category || null}, ${featured ?? false})
      RETURNING *
    `;

    revalidatePath("/", "layout");
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add product" }, { status: 500 });
  }
}