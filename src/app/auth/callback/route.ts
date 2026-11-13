import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirect } from "@/lib/safe-redirect";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;

  const error = searchParams.get("error");
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");

  // Prefer configured production site URL; fallback to request origin
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  const siteUrl = rawSiteUrl.replace(/\/+$/, "").replace(/\/login$/, "");

  // If the OAuth provider returned an error (e.g. user denied consent), bail.
  if (error) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_failed`);
  }

  if (!code) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_failed`);
  }

  const supabase = await createClient();
  const { error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${siteUrl}/login?error=auth_failed`);
  }

  // Validate the "next" redirect using getSafeRedirect to prevent open redirects
  const redirectTo = getSafeRedirect(rawNext, "/dashboard");

  return NextResponse.redirect(`${siteUrl}${redirectTo}`);
}

