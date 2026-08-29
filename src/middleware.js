import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  const isApiRoute = pathname.startsWith("/api/admin");

  const adminCookie = req.cookies.get("nowhen_admin")?.value;
  const isAuthed = adminCookie === process.env.ADMIN_PASSWORD;

  if (isLoginApi) {
    return NextResponse.next();
  }

  if (!isAuthed && isApiRoute) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAuthed && !isLoginPage) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  if (isAuthed && isLoginPage) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};