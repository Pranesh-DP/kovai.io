import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Paths that require a signed-in user. */
const PROTECTED_PREFIXES = ["/dashboard", "/tasks"];

/** Signed-in users visiting these paths are redirected to /dashboard. */
const AUTH_PATHS = ["/", "/login"];

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  const isAuthPage = AUTH_PATHS.includes(pathname);

  // Unauthenticated user hitting a protected route → /login?next=<path>
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    const targetPath = request.nextUrl.pathname + (request.nextUrl.search || "");
    loginUrl.searchParams.set("next", targetPath);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on the login page or root → /dashboard
  if (isAuthPage && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static and _next/image (Next.js internals)
     *  - favicon.ico, sitemap.xml, robots.txt
     *  - /auth/callback (handled by route handler, must not redirect)
     *  - Files with extensions (images, fonts, etc.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|auth/callback|[^/]+\\.[^/]+$).*)",
  ],
};
