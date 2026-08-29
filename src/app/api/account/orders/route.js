import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getUserFromToken, SESSION_COOKIE } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL);

export async function GET(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    const orders = await sql`
      SELECT id, items, amount, status, discount_amount, offer_code, created_at
      FROM orders
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;
    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
