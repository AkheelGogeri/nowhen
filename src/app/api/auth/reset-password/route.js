import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const result = await sql`
      SELECT user_id FROM password_resets WHERE token = ${token} AND expires_at > NOW()
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${result[0].user_id}`;
    await sql`DELETE FROM password_resets WHERE token = ${token}`;
    // Invalidate any existing sessions so old logins can't linger after a reset.
    await sql`DELETE FROM sessions WHERE user_id = ${result[0].user_id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
