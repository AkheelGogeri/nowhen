import { NextResponse } from "next/server";
import { getUserFromToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await getUserFromToken(token);

  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
