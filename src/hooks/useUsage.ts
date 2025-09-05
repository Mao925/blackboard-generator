"use client";

import { useState, useEffect, useCallback } from "react";

export interface UsageData {
  planType: "free" | "pro" | "premium";
  currentUsage: {
    generations: number;
    storageUsedMB: number;
  };
  limits: {
    maxGenerations: number;
    maxStorageMB: number;
  };
  canGenerate: boolean;
  canUpload: boolean;
  usagePercentage: {
    generations: number;
    storage: number;
  };
}

export function useUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/usage");

      if (!response.ok) {
        throw new Error("使用状況の取得に失敗しました");
      }

      const data = await response.json();
      setUsage(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "使用状況の取得に失敗しました";
      setError(errorMessage);
      console.error("Fetch usage error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  // 使用制限チェック
  const checkCanGenerate = useCallback((): boolean => {
    return usage?.canGenerate || false;
  }, [usage]);

  const checkCanUpload = useCallback((): boolean => {
    return usage?.canUpload || false;
  }, [usage]);

  // 制限に近づいているかチェック
  const isNearLimit = useCallback(
    (type: "generations" | "storage", threshold: number = 80): boolean => {
      if (!usage) return false;
      return usage.usagePercentage[type] >= threshold;
    },
    [usage]
  );

  // プラン名の表示用文字列
  const getPlanDisplayName = useCallback((): string => {
    if (!usage) return "";

    const planNames = {
      free: "フリープラン",
      pro: "プロプラン",
      premium: "プレミアムプラン",
    };

    return planNames[usage.planType] || usage.planType;
  }, [usage]);

  // 残り使用可能数
  const getRemainingUsage = useCallback(() => {
    if (!usage) return { generations: 0, storageMB: 0 };

    return {
      generations: Math.max(
        0,
        usage.limits.maxGenerations - usage.currentUsage.generations
      ),
      storageMB: Math.max(
        0,
        usage.limits.maxStorageMB - usage.currentUsage.storageUsedMB
      ),
    };
  }, [usage]);

  return {
    usage,
    loading,
    error,
    fetchUsage,
    checkCanGenerate,
    checkCanUpload,
    isNearLimit,
    getPlanDisplayName,
    getRemainingUsage,
    refresh: fetchUsage,
  };
}
