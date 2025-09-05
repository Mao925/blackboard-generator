import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await getCurrentUser();
    
    if (!authResult) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { user, profile } = authResult;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
      },
      profile: {
        name: profile.name,
        plan_type: profile.plan_type,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "認証チェックに失敗しました" },
      { status: 500 }
    );
  }
}
