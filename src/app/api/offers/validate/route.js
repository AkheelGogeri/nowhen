import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Enter a code" }, { status: 400 });
    }

    const result = await sql`
      SELECT * FROM offers
      WHERE UPPER(code) = UPPER(${code})
        AND active = true
        AND (expires_at IS NULL OR expires_at > NOW())
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 404 });
    }

    const offer = result[0];
    return NextResponse.json({
      code: offer.code,
      discount_percent: offer.discount_percent,
      discount_amount: offer.discount_amount,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to validate code" }, { status: 500 });
  }
}
