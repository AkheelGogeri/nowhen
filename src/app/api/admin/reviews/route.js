import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const reviews = await sql`
      SELECT reviews.*, products.name AS product_name
      FROM reviews
      JOIN products ON products.id = reviews.product_id
      ORDER BY reviews.created_at DESC
    `;
    return NextResponse.json(reviews);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
