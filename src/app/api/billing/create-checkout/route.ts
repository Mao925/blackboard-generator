import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createCheckoutSession, getPlan } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { user, profile } = authResult;
    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "プランIDが必要です" },
        { status: 400 }
      );
    }

    // プラン情報取得
    const plan = getPlan(planId);
    if (!plan || planId === "free") {
      return NextResponse.json({ error: "無効なプランです" }, { status: 400 });
    }

    // 既に同じプランの場合はエラー
    if (profile.plan_type === planId) {
      return NextResponse.json(
        { error: "既に同じプランをご利用中です" },
        { status: 400 }
      );
    }

    // Stripe Checkoutセッション作成
    const session = await createCheckoutSession(
      plan.priceId,
      user.id,
      user.email || "",
      `${process.env.NEXT_PUBLIC_APP_URL}/billing/success`,
      `${process.env.NEXT_PUBLIC_APP_URL}/billing/cancel`
    );

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return NextResponse.json(
      { error: "チェックアウトセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
