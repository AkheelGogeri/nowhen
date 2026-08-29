import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const reviews = await sql`
      SELECT id, name, rating, comment, created_at
      FROM reviews
      WHERE product_id = ${productId} AND approved = true
      ORDER BY created_at DESC
    `;

    const count = reviews.length;
    const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    return NextResponse.json({ reviews, average, count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { productId, name, rating, comment } = await req.json();

    if (!productId || !name || !rating) {
      return NextResponse.json({ error: "Name and rating are required" }, { status: 400 });
    }
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    await sql`
      INSERT INTO reviews (product_id, name, rating, comment, approved)
      VALUES (${productId}, ${name}, ${numericRating}, ${comment || null}, false)
    `;

    return NextResponse.json({ success: true, message: "Thanks! Your review will appear once approved." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
