import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createPortalSession, stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const authResult = await getCurrentUser();
    if (!authResult) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { user } = authResult;

    // Stripeカスタマー検索
    const customers = await stripe.customers.list({
      email: user.email || "",
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json(
        { error: "サブスクリプションが見つかりません" },
        { status: 404 }
      );
    }

    const customer = customers.data[0];

    // Portalセッション作成
    const session = await createPortalSession(
      customer.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Create portal session error:", error);
    return NextResponse.json(
      { error: "ポータルセッションの作成に失敗しました" },
      { status: 500 }
    );
  }
}
