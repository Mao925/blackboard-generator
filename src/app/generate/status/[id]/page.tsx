"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { useBlackboard } from "@/hooks/useBlackboard";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface StatusPageProps {
  params: { id: string };
}

export default function StatusPage({ params }: StatusPageProps) {
  const router = useRouter();
  const { pollStatus, currentBlackboard } = useBlackboard();
  const [isPolling, setIsPolling] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startPolling = async () => {
      try {
        await pollStatus(params.id, (status) => {
          // プログレスバーのアニメーション
          if (status.status === "processing") {
            setProgress((prev) => Math.min(prev + 10, 80));
          } else if (status.status === "completed") {
            setProgress(100);
          }
        });
      } catch (error) {
        console.error("Polling error:", error);
        toast.error("ステータス監視中にエラーが発生しました");
      } finally {
        setIsPolling(false);
      }
    };

    startPolling();

    // プログレスバーの初期アニメーション
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 80) return prev;
        return prev + 5;
      });
    }, 1000);

    return () => {
      clearInterval(progressInterval);
    };
  }, [params.id, pollStatus]);

  const getStatusIcon = () => {
    switch (currentBlackboard?.status) {
      case "completed":
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case "failed":
        return <XCircle className="h-8 w-8 text-red-600" />;
      case "processing":
      case "pending":
      default:
        return <Clock className="h-8 w-8 text-blue-600 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (currentBlackboard?.status) {
      case "completed":
        return "板書生成が完了しました！";
      case "failed":
        return "板書生成に失敗しました";
      case "processing":
        return "AI が板書を生成中です...";
      case "pending":
        return "生成処理の開始を待機中です...";
      default:
        return "状態を確認中...";
    }
  };

  const getStatusDescription = () => {
    switch (currentBlackboard?.status) {
      case "completed":
        return "生成された板書を確認し、必要に応じてダウンロードしてください。";
      case "failed":
        return "生成処理中にエラーが発生しました。もう一度お試しください。";
      case "processing":
        return "OCR処理、AI分析、画像生成を順次実行しています。しばらくお待ちください。";
      case "pending":
        return "キューに追加されました。順次処理を開始します。";
      default:
        return "処理状況を確認しています...";
    }
  };

  const handleDownload = async () => {
    if (!currentBlackboard?.generatedImageUrl) return;

    try {
      const response = await fetch(currentBlackboard.generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `板書_${currentBlackboard.title || "generated"}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("ダウンロードが開始されました");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("ダウンロードに失敗しました");
    }
  };

  const handleViewResult = () => {
    router.push(`/dashboard/blackboards/${params.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ナビゲーション */}
        <div className="mb-6">
          <Link href="/generate">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              生成ページに戻る
            </Button>
          </Link>
        </div>

        {/* メインカード */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <CardTitle className="text-2xl">{getStatusText()}</CardTitle>
            <CardDescription>{getStatusDescription()}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* プログレスバー */}
            {currentBlackboard?.status !== "completed" &&
              currentBlackboard?.status !== "failed" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>進行状況</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              )}

            {/* 処理詳細 */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    progress >= 20 ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">画像アップロード完了</span>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    progress >= 40
                      ? "bg-green-500"
                      : progress >= 20
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">OCR処理中</span>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    progress >= 60
                      ? "bg-green-500"
                      : progress >= 40
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">AI分析中</span>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    progress >= 80
                      ? "bg-green-500"
                      : progress >= 60
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">板書画像生成中</span>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    progress >= 100
                      ? "bg-green-500"
                      : progress >= 80
                      ? "bg-blue-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                />
                <span className="text-sm">完了</span>
              </div>
            </div>

            {/* 板書情報 */}
            {currentBlackboard && (
              <div className="bg-gray-50 p-4 rounded-md space-y-2">
                <h4 className="font-medium">板書情報</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {currentBlackboard.title && (
                    <p>
                      <span className="font-medium">タイトル:</span>{" "}
                      {currentBlackboard.title}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">生成開始:</span>{" "}
                    {new Date(currentBlackboard.createdAt).toLocaleString(
                      "ja-JP"
                    )}
                  </p>
                  {currentBlackboard.updatedAt !==
                    currentBlackboard.createdAt && (
                    <p>
                      <span className="font-medium">最終更新:</span>{" "}
                      {new Date(currentBlackboard.updatedAt).toLocaleString(
                        "ja-JP"
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* アクションボタン */}
            <div className="space-y-3">
              {currentBlackboard?.status === "completed" && (
                <div className="space-y-3">
                  <Button onClick={handleViewResult} className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    生成結果を確認
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    板書をダウンロード
                  </Button>
                </div>
              )}

              {currentBlackboard?.status === "failed" && (
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/generate")}
                    className="w-full"
                  >
                    もう一度生成する
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="outline"
                    className="w-full"
                  >
                    ダッシュボードに戻る
                  </Button>
                </div>
              )}

              {isPolling && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                  >
                    バックグラウンドで処理を継続
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">
                    ダッシュボードから後で結果を確認できます
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 推定時間の表示 */}
        {isPolling && (
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-2">📱 処理には通常1-3分程度かかります</p>
                <p>💡 このページを閉じても処理は継続されます</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
