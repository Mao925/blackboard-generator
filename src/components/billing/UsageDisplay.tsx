"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, FileImage, Zap } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";

interface UsageDisplayProps {
  showUpgradePrompt?: boolean;
}

export function UsageDisplay({ showUpgradePrompt = true }: UsageDisplayProps) {
  const {
    usage,
    loading,
    error,
    getPlanDisplayName,
    getRemainingUsage,
    isNearLimit,
  } = useUsage();

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !usage) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">
            使用状況を読み込めませんでした
          </div>
        </CardContent>
      </Card>
    );
  }

  const remaining = getRemainingUsage();
  const generationsNearLimit = isNearLimit("generations");
  const storageNearLimit = isNearLimit("storage");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>使用状況</span>
        </CardTitle>
        <CardDescription>
          {getPlanDisplayName()} - 今月の利用状況
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 生成回数 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">板書生成回数</span>
            <span className="text-sm text-gray-600">
              {usage.currentUsage.generations} / {usage.limits.maxGenerations}
            </span>
          </div>
          <Progress
            value={usage.usagePercentage.generations}
            className={`h-2 ${generationsNearLimit ? "bg-red-100" : ""}`}
          />
          {generationsNearLimit && (
            <div className="flex items-center space-x-1 text-amber-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>残り{remaining.generations}回です</span>
            </div>
          )}
        </div>

        {/* ストレージ使用量 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">ストレージ使用量</span>
            <span className="text-sm text-gray-600">
              {usage.currentUsage.storageUsedMB}MB / {usage.limits.maxStorageMB}
              MB
            </span>
          </div>
          <Progress
            value={usage.usagePercentage.storage}
            className={`h-2 ${storageNearLimit ? "bg-red-100" : ""}`}
          />
          {storageNearLimit && (
            <div className="flex items-center space-x-1 text-amber-600 text-sm">
              <FileImage className="h-4 w-4" />
              <span>残り{remaining.storageMB}MBです</span>
            </div>
          )}
        </div>

        {/* 制限到達の警告 */}
        {(!usage.canGenerate || !usage.canUpload) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">制限に達しました</span>
            </div>
            <div className="mt-2 text-sm text-red-700">
              {!usage.canGenerate && <p>• 今月の生成回数上限に達しています</p>}
              {!usage.canUpload && <p>• ストレージ容量上限に達しています</p>}
            </div>
          </div>
        )}

        {/* アップグレード促進 */}
        {showUpgradePrompt &&
          usage.planType === "free" &&
          (generationsNearLimit || storageNearLimit) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="text-blue-800 font-medium mb-2">
                より多くの機能をご利用いただけます
              </div>
              <div className="text-sm text-blue-700 mb-3">
                プロプランなら月間100回の生成と1GBのストレージがご利用いただけます。
              </div>
              <a
                href="/billing"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                プランを見る
              </a>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
