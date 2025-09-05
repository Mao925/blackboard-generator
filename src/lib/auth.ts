import { createServerSupabaseClient } from "./supabase-server";
import { supabaseAdmin } from "./supabase";
import type { User } from "@supabase/supabase-js";
import type { Database } from "./supabase";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

// サーバーサイドで現在のユーザーを取得
export async function getCurrentUser(): Promise<{
  user: User;
  profile: UserProfile;
} | null> {
  try {
    const supabase = createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // ユーザープロファイルを取得
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return { user, profile };
  } catch (error) {
    console.error("getCurrentUser error:", error);
    return null;
  }
}

// ユーザープロファイルを作成または更新
export async function upsertUserProfile(
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("users")
      .upsert({
        id: userId,
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Upsert user profile error:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("upsertUserProfile error:", error);
    return null;
  }
}

// プランタイプを更新
export async function updateUserPlan(
  userId: string,
  planType: "free" | "pro" | "premium"
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("users")
      .update({
        plan_type: planType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("Update user plan error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("updateUserPlan error:", error);
    return false;
  }
}

// 使用制限チェック
export async function checkUsageLimits(userId: string): Promise<{
  canGenerate: boolean;
  canUpload: boolean;
  currentUsage: {
    generations: number;
    storageUsedMB: number;
  };
  limits: {
    maxGenerations: number;
    maxStorageMB: number;
  };
}> {
  try {
    // ユーザー情報取得
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("plan_type")
      .eq("id", userId)
      .single();

    if (!user) {
      throw new Error("ユーザーが見つかりません");
    }

    // プラン制限取得
    const { data: planLimits } = await supabaseAdmin
      .from("plan_limits")
      .select("*")
      .eq("plan_type", user.plan_type)
      .single();

    if (!planLimits) {
      throw new Error("プラン情報が見つかりません");
    }

    // 今月の使用量取得
    const currentDate = new Date();
    const firstDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const lastDayOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const { data: usageStats } = await supabaseAdmin
      .from("usage_stats")
      .select("generations_count, storage_used")
      .eq("user_id", userId)
      .gte("date", firstDayOfMonth.toISOString().split("T")[0])
      .lte("date", lastDayOfMonth.toISOString().split("T")[0]);

    const totalGenerations =
      usageStats?.reduce((sum, stat) => sum + stat.generations_count, 0) || 0;
    const totalStorageUsed = Math.max(
      ...(usageStats?.map((stat) => stat.storage_used) || [0])
    );

    return {
      canGenerate: totalGenerations < planLimits.max_generations_per_month,
      canUpload: totalStorageUsed < planLimits.max_storage_mb * 1024 * 1024, // MB to bytes
      currentUsage: {
        generations: totalGenerations,
        storageUsedMB: Math.round(totalStorageUsed / (1024 * 1024)),
      },
      limits: {
        maxGenerations: planLimits.max_generations_per_month,
        maxStorageMB: planLimits.max_storage_mb,
      },
    };
  } catch (error) {
    console.error("checkUsageLimits error:", error);

    // エラー時はフリープランの制限を返す
    return {
      canGenerate: false,
      canUpload: false,
      currentUsage: {
        generations: 0,
        storageUsedMB: 0,
      },
      limits: {
        maxGenerations: 10,
        maxStorageMB: 100,
      },
    };
  }
}

// 使用量を記録
export async function recordUsage(
  userId: string,
  type: "generation" | "download",
  additionalStorageBytes: number = 0
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split("T")[0];

    // 今日の使用量を取得または作成
    const { data: existingUsage } = await supabaseAdmin
      .from("usage_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (existingUsage) {
      // 既存の使用量を更新
      const updates: any = { updated_at: new Date().toISOString() };

      if (type === "generation") {
        updates.generations_count = existingUsage.generations_count + 1;
      } else if (type === "download") {
        updates.downloads_count = existingUsage.downloads_count + 1;
      }

      if (additionalStorageBytes > 0) {
        updates.storage_used =
          existingUsage.storage_used + additionalStorageBytes;
      }

      const { error } = await supabaseAdmin
        .from("usage_stats")
        .update(updates)
        .eq("id", existingUsage.id);

      if (error) {
        console.error("Update usage error:", error);
        return false;
      }
    } else {
      // 新しい使用量レコードを作成
      const newUsage: any = {
        user_id: userId,
        date: today,
        generations_count: type === "generation" ? 1 : 0,
        downloads_count: type === "download" ? 1 : 0,
        storage_used: additionalStorageBytes,
      };

      const { error } = await supabaseAdmin
        .from("usage_stats")
        .insert(newUsage);

      if (error) {
        console.error("Insert usage error:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("recordUsage error:", error);
    return false;
  }
}

// 管理者権限チェック
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const { data: user } = await supabaseAdmin
      .from("users")
      .select("email")
      .eq("id", userId)
      .single();

    if (!user) return false;

    // 管理者メールアドレスのリスト（環境変数で管理）
    const adminEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    return adminEmails.includes(user.email);
  } catch (error) {
    console.error("isAdmin error:", error);
    return false;
  }
}

// セッションからユーザーIDを取得
export function getUserIdFromSession(request: Request): string | null {
  try {
    // Supabase authからユーザーIDを取得する処理
    // 実際の実装はSupabaseのSSR設定に依存
    return null;
  } catch (error) {
    console.error("getUserIdFromSession error:", error);
    return null;
  }
}
