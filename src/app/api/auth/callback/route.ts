import { createServerSupabaseClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(
        new URL("/auth/login?error=callback_error", requestUrl.origin)
      );
    }
  }

  // 認証成功後はダッシュボードにリダイレクト
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}
