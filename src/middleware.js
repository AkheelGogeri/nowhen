import { NextResponse } from "next/server";

export function middleware(req) {
  const isLoginPage = req.nextUrl.pathname === "/admin/login";
  const adminCookie = req.cookies.get("nowhen_admin")?.value;
  const isAuthed = adminCookie === process.env.ADMIN_PASSWORD;

  if (!isAuthed && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isAuthed && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};