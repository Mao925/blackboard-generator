import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, checkUsageLimits } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { user, profile } = authResult;

    // 使用状況と制限取得
    const usageLimits = await checkUsageLimits(user.id);

    return NextResponse.json({
      planType: profile.plan_type,
      currentUsage: usageLimits.currentUsage,
      limits: usageLimits.limits,
      canGenerate: usageLimits.canGenerate,
      canUpload: usageLimits.canUpload,
      usagePercentage: {
        generations: Math.round(
          (usageLimits.currentUsage.generations /
            usageLimits.limits.maxGenerations) *
            100
        ),
        storage: Math.round(
          (usageLimits.currentUsage.storageUsedMB /
            usageLimits.limits.maxStorageMB) *
            100
        ),
      },
    });
  } catch (error) {
    console.error("Get usage error:", error);
    return NextResponse.json(
      { error: "使用状況の取得に失敗しました" },
      { status: 500 }
    );
  }
}
