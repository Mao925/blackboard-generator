"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import type { PricingPlan } from "@/lib/stripe";

interface PricingCardProps {
  plan: PricingPlan;
  currentPlan?: string;
  onSelectPlan?: (planId: string) => void;
}

export function PricingCard({
  plan,
  currentPlan,
  onSelectPlan,
}: PricingCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const isCurrentPlan = currentPlan === plan.id;
  const isFree = plan.id === "free";

  const handleSelectPlan = async () => {
    if (!user) {
      toast.error("ログインが必要です");
      return;
    }

    if (isCurrentPlan) {
      toast.info("現在ご利用中のプランです");
      return;
    }

    if (isFree) {
      toast.info(
        "フリープランへのダウングレードはサポートページからお問い合わせください"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "チェックアウトの作成に失敗しました");
      }

      // Stripeチェックアウトページにリダイレクト
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(
        error instanceof Error ? error.message : "エラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getButtonText = (): string => {
    if (loading) return "処理中...";
    if (isCurrentPlan) return "利用中";
    if (isFree) return "無料で始める";
    return `${plan.name}を選択`;
  };

  const getButtonVariant = (): "default" | "outline" => {
    if (isCurrentPlan) return "outline";
    return "default";
  };

  return (
    <Card
      className={`relative ${plan.recommended ? "ring-2 ring-blue-500" : ""}`}
    >
      {plan.recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            おすすめ
          </span>
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold">{formatPrice(plan.price)}</span>
          {!isFree && <span className="text-gray-600">/月</span>}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Button
          onClick={handleSelectPlan}
          variant={getButtonVariant()}
          className="w-full"
          disabled={loading || isCurrentPlan}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getButtonText()}
        </Button>

        <div className="space-y-3">
          <FeatureItem
            included={true}
            text={`月間${
              plan.features.maxGenerationsPerMonth === 1000
                ? "無制限"
                : `${plan.features.maxGenerationsPerMonth}回`
            }の板書生成`}
          />
          <FeatureItem
            included={true}
            text={`${
              plan.features.maxStorageMB >= 1000
                ? `${plan.features.maxStorageMB / 1000}GB`
                : `${plan.features.maxStorageMB}MB`
            }のストレージ`}
          />
          <FeatureItem
            included={true}
            text={`最大${plan.features.maxFileSizeMB}MBのファイルアップロード`}
          />
          <FeatureItem
            included={plan.features.priorityProcessing}
            text="優先処理"
          />
          <FeatureItem
            included={plan.features.advancedAI}
            text="高度なAI機能"
          />
          <FeatureItem
            included={true}
            text={`出力形式: ${plan.features.exportFormats.join(", ")}`}
          />
          <FeatureItem
            included={plan.features.customTemplates}
            text="カスタムテンプレート"
          />
          <FeatureItem
            included={plan.features.bulkExport}
            text="一括エクスポート"
          />
          <FeatureItem
            included={true}
            text={`サポート: ${getSupportLabel(plan.features.support)}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface FeatureItemProps {
  included: boolean;
  text: string;
}

function FeatureItem({ included, text }: FeatureItemProps) {
  return (
    <div className="flex items-center space-x-3">
      <div
        className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
          included ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
        }`}
      >
        <Check className="h-3 w-3" />
      </div>
      <span className={included ? "text-gray-900" : "text-gray-500"}>
        {text}
      </span>
    </div>
  );
}

function getSupportLabel(support: string): string {
  const labels = {
    community: "コミュニティ",
    email: "メール",
    priority: "優先サポート",
  };
  return labels[support as keyof typeof labels] || support;
}
