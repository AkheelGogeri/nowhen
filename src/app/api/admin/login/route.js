import { NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, adminCookieOptions, createAdminToken, safeEqual } from "@/lib/adminSession";

export async function POST(req) {
  const { password } = await req.json();

  if (process.env.ADMIN_PASSWORD && safeEqual(password, process.env.ADMIN_PASSWORD)) {
    const response = NextResponse.json({ success: true });
    // The cookie holds a signed, expiring token — never the password itself.
    response.cookies.set(ADMIN_COOKIE, await createAdminToken(), {
      ...adminCookieOptions,
      maxAge: ADMIN_SESSION_SECONDS,
    });
    return response;
  }

  return NextResponse.json({ success: false, error: "Incorrect password" }, { status: 401 });
}
