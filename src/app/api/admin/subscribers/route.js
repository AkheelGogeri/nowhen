import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export async function GET() {
  try {
    const subscribers = await sql`SELECT * FROM newsletter_subscribers ORDER BY created_at DESC`;
    return NextResponse.json(subscribers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
  }
}
