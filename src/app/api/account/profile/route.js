import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { getUserFromToken, SESSION_COOKIE } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL);

export async function PUT(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  try {
    const { name, phone, address } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await sql`
      UPDATE users SET name = ${name}, phone = ${phone || null}, address = ${address || null}
      WHERE id = ${user.id}
      RETURNING id, name, email, phone, address
    `;

    return NextResponse.json({ user: result[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
