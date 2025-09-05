import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

// サーバーサイド用Stripeクライアント
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

// クライアントサイド用Stripeクライアント
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};

// プラン定義
export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number; // 月額（円）
  priceId: string; // Stripe Price ID
  features: {
    maxGenerationsPerMonth: number;
    maxStorageMB: number;
    maxFileSizeMB: number;
    priorityProcessing: boolean;
    advancedAI: boolean;
    exportFormats: string[];
    support: "community" | "email" | "priority";
    customTemplates: boolean;
    bulkExport: boolean;
  };
  recommended?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "フリープラン",
    description: "個人利用に最適",
    price: 0,
    priceId: "", // フリープランはStripe Price IDなし
    features: {
      maxGenerationsPerMonth: 10,
      maxStorageMB: 100,
      maxFileSizeMB: 10,
      priorityProcessing: false,
      advancedAI: false,
      exportFormats: ["PNG"],
      support: "community",
      customTemplates: false,
      bulkExport: false,
    },
  },
  {
    id: "pro",
    name: "プロプラン",
    description: "本格的な指導者向け",
    price: 1980,
    priceId: process.env.STRIPE_PRICE_ID_PRO || "",
    features: {
      maxGenerationsPerMonth: 100,
      maxStorageMB: 1000,
      maxFileSizeMB: 50,
      priorityProcessing: true,
      advancedAI: true,
      exportFormats: ["PNG", "PDF", "SVG"],
      support: "email",
      customTemplates: true,
      bulkExport: true,
    },
    recommended: true,
  },
  {
    id: "premium",
    name: "プレミアムプラン",
    description: "塾・学校などの組織向け",
    price: 4980,
    priceId: process.env.STRIPE_PRICE_ID_PREMIUM || "",
    features: {
      maxGenerationsPerMonth: 1000,
      maxStorageMB: 10000,
      maxFileSizeMB: 100,
      priorityProcessing: true,
      advancedAI: true,
      exportFormats: ["PNG", "PDF", "SVG", "PowerPoint"],
      support: "priority",
      customTemplates: true,
      bulkExport: true,
    },
  },
];

// プラン取得
export function getPlan(planId: string): PricingPlan | null {
  return PRICING_PLANS.find((plan) => plan.id === planId) || null;
}

// Checkoutセッション作成
export async function createCheckoutSession(
  priceId: string,
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      consent_collection: {
        terms_of_service: "required",
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    });

    return session;
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error);
    throw new Error("チェックアウトセッションの作成に失敗しました");
  }
}

// カスタマーポータルセッション作成
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session;
  } catch (error) {
    console.error("Stripe portal session creation failed:", error);
    throw new Error("ポータルセッションの作成に失敗しました");
  }
}

// サブスクリプション状況取得
export async function getSubscription(
  customerId: string
): Promise<Stripe.Subscription | null> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 1,
    });

    return subscriptions.data[0] || null;
  } catch (error) {
    console.error("Failed to fetch subscription:", error);
    return null;
  }
}

// Webhookイベント処理
export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    return event;
  } catch (error) {
    console.error("Stripe webhook verification failed:", error);
    throw new Error("Webhook verification failed");
  }
}

// サブスクリプション状態からプランタイプを取得
export function getPlanTypeFromSubscription(
  subscription: Stripe.Subscription | null
): string {
  if (!subscription || subscription.status !== "active") {
    return "free";
  }

  const priceId = subscription.items.data[0]?.price.id;

  if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
    return "pro";
  } else if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
    return "premium";
  }

  return "free";
}

// 使用量ベースの課金計算
export function calculateUsageFee(
  plan: PricingPlan,
  actualUsage: {
    generations: number;
    storageUsedMB: number;
  }
): number {
  let extraFee = 0;

  // 生成回数の超過料金
  if (actualUsage.generations > plan.features.maxGenerationsPerMonth) {
    const extraGenerations =
      actualUsage.generations - plan.features.maxGenerationsPerMonth;
    extraFee += extraGenerations * 10; // 1回あたり10円
  }

  // ストレージの超過料金
  if (actualUsage.storageUsedMB > plan.features.maxStorageMB) {
    const extraStorageMB =
      actualUsage.storageUsedMB - plan.features.maxStorageMB;
    extraFee += Math.ceil(extraStorageMB / 100) * 100; // 100MBあたり100円
  }

  return extraFee;
}

// プラン比較用のデータ
export const PLAN_COMPARISON_FEATURES = [
  {
    key: "maxGenerationsPerMonth",
    label: "月間生成回数",
    format: (value: number) => (value === 1000 ? "無制限" : `${value}回`),
  },
  {
    key: "maxStorageMB",
    label: "ストレージ容量",
    format: (value: number) =>
      value >= 1000 ? `${value / 1000}GB` : `${value}MB`,
  },
  {
    key: "maxFileSizeMB",
    label: "最大ファイルサイズ",
    format: (value: number) => `${value}MB`,
  },
  {
    key: "priorityProcessing",
    label: "優先処理",
    format: (value: boolean) => (value ? "対応" : "未対応"),
  },
  {
    key: "advancedAI",
    label: "高度なAI機能",
    format: (value: boolean) => (value ? "利用可能" : "基本機能のみ"),
  },
  {
    key: "exportFormats",
    label: "出力形式",
    format: (value: string[]) => value.join(", "),
  },
  {
    key: "support",
    label: "サポート",
    format: (value: string) => {
      const supportLabels = {
        community: "コミュニティ",
        email: "メール",
        priority: "優先サポート",
      };
      return supportLabels[value as keyof typeof supportLabels] || value;
    },
  },
];
