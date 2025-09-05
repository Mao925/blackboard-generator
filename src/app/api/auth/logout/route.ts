import { createServerSupabaseClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        { error: "ログアウトに失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "ログアウトしました" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "ログアウトに失敗しました" },
      { status: 500 }
    );
  }
}
