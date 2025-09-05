import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { user } = authResult;
    const { searchParams } = new URL(request.url);

    // クエリパラメータ
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const subject = searchParams.get("subject");
    const grade = searchParams.get("grade");
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // ベースクエリ
    let query = supabaseAdmin
      .from("blackboards")
      .select("*", { count: "exact" })
      .eq("user_id", user.id);

    // フィルタリング
    if (subject) {
      query = query.eq("subject", subject);
    }
    if (grade) {
      query = query.eq("grade", grade);
    }
    if (status) {
      query = query.eq("generation_status", status);
    }

    // ソート
    query = query.order(sortBy, { ascending: sortOrder === "asc" });

    // ページネーション
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: blackboards, error, count } = await query;

    if (error) {
      console.error("Get blackboards error:", error);
      return NextResponse.json(
        { error: "データ取得中にエラーが発生しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      blackboards: blackboards || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get blackboards error:", error);
    return NextResponse.json(
      { error: "データ取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
