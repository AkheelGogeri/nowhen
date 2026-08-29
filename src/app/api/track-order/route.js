import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { email, orderId } = await req.json();

    const numericId = Number(orderId);
    if (!email || !orderId || !Number.isInteger(numericId)) {
      return NextResponse.json({ error: "Enter your email and order number" }, { status: 400 });
    }

    const result = await sql`
      SELECT id, items, amount, status, discount_amount, offer_code, created_at
      FROM orders
      WHERE id = ${numericId} AND LOWER(customer_email) = LOWER(${email})
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "No matching order found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to look up order" }, { status: 500 });
  }
}
