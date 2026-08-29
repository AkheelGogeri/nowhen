import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const offers = await sql`SELECT * FROM offers ORDER BY created_at DESC`;
    return NextResponse.json(offers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { code, discount_percent, discount_amount, expires_at } = await req.json();

    if (!code || (!discount_percent && !discount_amount)) {
      return NextResponse.json(
        { error: "Code and a percent or fixed discount are required" },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO offers (code, discount_percent, discount_amount, expires_at, active)
      VALUES (${code.toUpperCase()}, ${discount_percent || null}, ${discount_amount || null}, ${expires_at || null}, true)
      RETURNING *
    `;

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(error);
    if (error.message?.includes("duplicate key")) {
      return NextResponse.json({ error: "That code already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
