import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidAdminToken } from "@/lib/adminSession";

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isOpenApi = pathname === "/api/admin/login" || pathname === "/api/admin/logout";
  const isApiRoute = pathname.startsWith("/api/admin");

  if (isOpenApi) {
    return NextResponse.next();
  }

  const isAuthed = await isValidAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);

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
