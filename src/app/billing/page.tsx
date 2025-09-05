"use client";

import { PricingCard } from "@/components/billing/PricingCard";
import { UsageDisplay } from "@/components/billing/UsageDisplay";
import { PRICING_PLANS } from "@/lib/stripe";
import { useAuth } from "@/hooks/useAuth";
import { useUsage } from "@/hooks/useUsage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, CreditCard, HelpCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function BillingPage() {
  const { user, profile } = useAuth();
  const { usage } = useUsage();

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/billing/portal", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "ポータルセッションの作成に失敗しました");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Portal error:", error);
      toast.error(
        error instanceof Error ? error.message : "エラーが発生しました"
      );
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">
              課金情報を表示するにはログインが必要です
            </p>
            <Link href="/auth/login">
              <Button>ログイン</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">料金プラン</h1>
          <p className="text-gray-600 mt-2">
            あなたに最適なプランを選択してください
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側: 使用状況とアクション */}
          <div className="lg:col-span-1 space-y-6">
            <UsageDisplay />

            {/* 現在のプラン情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>現在のプラン</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">
                      {profile?.plan_type === "free" && "フリープラン"}
                      {profile?.plan_type === "pro" && "プロプラン"}
                      {profile?.plan_type === "premium" && "プレミアムプラン"}
                    </p>
                    <p className="text-sm text-gray-600">
                      {profile?.plan_type === "free"
                        ? "無料でご利用いただけます"
                        : "有料プランをご利用中です"}
                    </p>
                  </div>

                  {profile?.plan_type !== "free" && (
                    <Button
                      onClick={handleManageSubscription}
                      variant="outline"
                      className="w-full"
                    >
                      サブスクリプション管理
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* サポート情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>サポート</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <p>
                    プランに関するご質問やサポートが必要な場合は、お気軽にお問い合わせください。
                  </p>
                  <div className="space-y-2">
                    <a
                      href="mailto:support@blackboard-generator.com"
                      className="block text-blue-600 hover:underline"
                    >
                      📧 メールサポート
                    </a>
                    <a
                      href="/docs/faq"
                      className="block text-blue-600 hover:underline"
                    >
                      ❓ よくある質問
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右側: プラン一覧 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {PRICING_PLANS.map((plan) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  currentPlan={profile?.plan_type}
                />
              ))}
            </div>

            {/* プラン比較表 */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>プラン詳細比較</CardTitle>
                <CardDescription>
                  各プランの機能を詳しく比較できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 pr-4">機能</th>
                        <th className="text-center py-3 px-4">フリー</th>
                        <th className="text-center py-3 px-4">プロ</th>
                        <th className="text-center py-3 px-4">プレミアム</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 pr-4">月間生成回数</td>
                        <td className="text-center py-3 px-4">10回</td>
                        <td className="text-center py-3 px-4">100回</td>
                        <td className="text-center py-3 px-4">1,000回</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 pr-4">ストレージ容量</td>
                        <td className="text-center py-3 px-4">100MB</td>
                        <td className="text-center py-3 px-4">1GB</td>
                        <td className="text-center py-3 px-4">10GB</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 pr-4">優先処理</td>
                        <td className="text-center py-3 px-4">❌</td>
                        <td className="text-center py-3 px-4">✅</td>
                        <td className="text-center py-3 px-4">✅</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 pr-4">高度なAI機能</td>
                        <td className="text-center py-3 px-4">基本</td>
                        <td className="text-center py-3 px-4">✅</td>
                        <td className="text-center py-3 px-4">✅</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 pr-4">出力形式</td>
                        <td className="text-center py-3 px-4">PNG</td>
                        <td className="text-center py-3 px-4">PNG, PDF, SVG</td>
                        <td className="text-center py-3 px-4">
                          すべて + PowerPoint
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 pr-4">カスタムテンプレート</td>
                        <td className="text-center py-3 px-4">❌</td>
                        <td className="text-center py-3 px-4">✅</td>
                        <td className="text-center py-3 px-4">✅</td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4">サポート</td>
                        <td className="text-center py-3 px-4">コミュニティ</td>
                        <td className="text-center py-3 px-4">メール</td>
                        <td className="text-center py-3 px-4">優先サポート</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
