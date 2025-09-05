import { NextRequest, NextResponse } from "next/server";
import {
  handleStripeWebhook,
  getPlanTypeFromSubscription,
  stripe,
} from "@/lib/stripe";
import { updateUserPlan } from "@/lib/auth";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe signature" },
        { status: 400 }
      );
    }

    // Webhook検証
    const event = await handleStripeWebhook(body, signature);

    // イベント処理
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChanged(
          event.data.object as Stripe.Subscription
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCanceled(
          event.data.object as Stripe.Subscription
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// チェックアウト完了処理
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;
    if (!userId) {
      console.error("No userId in checkout session metadata");
      return;
    }

    // サブスクリプション情報取得
    if (session.subscription) {
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );
      const planType = getPlanTypeFromSubscription(subscription);

      await updateUserPlan(userId, planType as any);
      console.log(`User ${userId} plan updated to ${planType}`);
    }
  } catch (error) {
    console.error("Handle checkout completed error:", error);
  }
}

// サブスクリプション変更処理
async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error("No userId in subscription metadata");
      return;
    }

    const planType = getPlanTypeFromSubscription(subscription);
    await updateUserPlan(userId, planType as any);
    console.log(`User ${userId} subscription updated to ${planType}`);
  } catch (error) {
    console.error("Handle subscription changed error:", error);
  }
}

// サブスクリプションキャンセル処理
async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  try {
    const userId = subscription.metadata?.userId;
    if (!userId) {
      console.error("No userId in subscription metadata");
      return;
    }

    await updateUserPlan(userId, "free");
    console.log(`User ${userId} subscription canceled, downgraded to free`);
  } catch (error) {
    console.error("Handle subscription canceled error:", error);
  }
}

// 支払い成功処理
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    console.log(`Payment succeeded for invoice ${invoice.id}`);
    // 必要に応じて追加処理
  } catch (error) {
    console.error("Handle payment succeeded error:", error);
  }
}

// 支払い失敗処理
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    console.log(`Payment failed for invoice ${invoice.id}`);
    // 必要に応じて通知処理など
  } catch (error) {
    console.error("Handle payment failed error:", error);
  }
}
