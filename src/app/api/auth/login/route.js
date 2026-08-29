import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { verifyPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await sql`SELECT * FROM users WHERE LOWER(email) = LOWER(${email})`;
    const user = result[0];

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    const { token, expiresAt } = await createSession(user.id);
    const response = NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address },
    });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to log in" }, { status: 500 });
  }
}
