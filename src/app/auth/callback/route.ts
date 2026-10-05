import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google OAuth (and email confirmation links) land here with a ?code=... to exchange for a session.
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  // Only allow same-site relative redirects (blocks `?next=https://evil.com` and `//evil.com`).
  const rawNext = req.nextUrl.searchParams.get("next") ?? "";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") && !rawNext.startsWith("/\\") ? rawNext : "/today";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.redirect(new URL(next, req.url));
}
