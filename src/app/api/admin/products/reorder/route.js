import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { orderedIds } = await req.json();

    if (!Array.isArray(orderedIds)) {
      return NextResponse.json({ error: "orderedIds must be an array" }, { status: 400 });
    }

    // Update each product's sort_order based on its position in the array
    for (let i = 0; i < orderedIds.length; i++) {
      await sql`UPDATE products SET sort_order = ${i} WHERE id = ${orderedIds[i]}`;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to reorder products" }, { status: 500 });
  }
}