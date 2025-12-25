import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  // Default to chat or root if next param is missing
  const next = searchParams.get("next") ?? "/";

  // 👇 THE FIX: Calculate the true origin based on Nginx headers
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const origin = `${protocol}://${host}`;
  console.log(`[Auth] Processing callback for code: ${code?.substring(0, 5)}...`);

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("[Auth Error] Exchange failed:", error.message);
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${error.message}`);
      }
      
      console.log("[Auth] Success! Redirecting to:", next);
      return NextResponse.redirect(`${origin}${next}`);

    } catch (err) {
      console.error("[Auth Critical] Unexpected error:", err);
      return NextResponse.redirect(`${origin}/auth/auth-code-error`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`);
}