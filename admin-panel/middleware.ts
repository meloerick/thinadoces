import { NextResponse, type NextRequest } from "next/server";

import { ALLOWED_ADMIN_EMAIL } from "@/lib/utils/constants";
import { updateSession } from "@/lib/supabase/middleware";

function withSupabaseCookies(source: NextResponse, destination: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie);
  });
  return destination;
}

function isAllowedEmail(email: string | undefined): boolean {
  return (email ?? "").trim().toLowerCase() === ALLOWED_ADMIN_EMAIL;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);
  const isLoginRoute = pathname === "/admin/login";
  const role = (user?.app_metadata?.role as string | undefined) ?? "user";
  const isAdmin = Boolean(user && role === "admin" && isAllowedEmail(user.email));

  if (isLoginRoute) {
    if (isAdmin) {
      const redirectResponse = NextResponse.redirect(new URL("/admin", request.url));
      return withSupabaseCookies(response, redirectResponse);
    }
    return response;
  }

  if (!user) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    return withSupabaseCookies(response, redirectResponse);
  }

  if (!isAdmin) {
    const redirectResponse = NextResponse.redirect(new URL("/admin/login?error=forbidden", request.url));
    return withSupabaseCookies(response, redirectResponse);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};