import { NextResponse } from "next/server";
import { deleteSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  await deleteSession(token);

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, "", { expires: new Date(0), path: "/" });
  return response;
}
