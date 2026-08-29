import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import { hashPassword, createSession, SESSION_COOKIE } from "@/lib/auth";

const sql = neon(process.env.DATABASE_URL);

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${email})`;
    if (existing.length > 0) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email.toLowerCase()}, ${passwordHash})
      RETURNING id, name, email, phone, address
    `;
    const user = result[0];

    const { token, expiresAt } = await createSession(user.id);
    const response = NextResponse.json({ user });
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
    return NextResponse.json({ error: "Failed to sign up" }, { status: 500 });
  }
}
