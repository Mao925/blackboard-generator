import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 認証チェック
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { user } = authResult;
    const blackboardId = params.id;

    // 板書データを取得（自分のもののみ）
    const { data: blackboard, error } = await supabaseAdmin
      .from("blackboards")
      .select("*")
      .eq("id", blackboardId)
      .eq("user_id", user.id)
      .single();

    if (error || !blackboard) {
      return NextResponse.json(
        { error: "板書が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: blackboard.id,
      status: blackboard.generation_status,
      title: blackboard.title,
      originalImageUrl: blackboard.original_image_url,
      generatedImageUrl: blackboard.generated_image_url,
      createdAt: blackboard.created_at,
      updatedAt: blackboard.updated_at,
    });
  } catch (error) {
    console.error("Get blackboard status error:", error);
    return NextResponse.json(
      { error: "ステータス取得中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
