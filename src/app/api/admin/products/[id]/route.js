import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const sql = neon(process.env.DATABASE_URL);

export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM products WHERE id = ${id}`;
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const { name, price, compare_at_price, sizes, images, description, in_stock, category, featured } = await req.json();

    if (!name || !price || !images || images.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await sql`
      UPDATE products
      SET name = ${name}, price = ${price}, compare_at_price = ${compare_at_price || null}, sizes = ${sizes || []}, images = ${images}, image = ${images[0]}, description = ${description || null}, in_stock = ${in_stock ?? true}, category = ${category || null}, featured = ${featured ?? false}
      WHERE id = ${id}
      RETURNING *
    `;

    revalidatePath("/", "layout");
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}