"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SVGBlackboard } from "@/components/SVGBlackboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Upload,
  Loader2,
  Download,
  Eye,
  ArrowLeft,
} from "lucide-react";
import {
  validateImageFile,
  formatFileSize,
  getSubjectLabel,
  getGradeLabel,
  getLayoutTypeLabel,
} from "@/lib/utils";
import type {
  BlackboardGenerateForm,
  Subject,
  Grade,
  ClassDuration,
  LayoutType,
  TextSize,
  ColorScheme,
  DiagramRatio,
} from "@/types";

const SUBJECTS: Subject[] = [
  "arithmetic",
  "mathematics",
  "japanese",
  "english",
  "science",
  "social",
];
const GRADES: Grade[] = [
  "elementary_4",
  "elementary_5",
  "elementary_6",
  "junior_high_1",
  "junior_high_2",
  "junior_high_3",
  "high_school_1",
  "high_school_2",
  "high_school_3",
  "other",
];
const CLASS_DURATIONS: ClassDuration[] = [30, 45, 60, 90];
const LAYOUT_TYPES: LayoutType[] = [
  "problem_solving",
  "formula_explanation",
  "diagram_focused",
  "special_arithmetic",
];
const TEXT_SIZES: TextSize[] = ["small", "medium", "large"];
const COLOR_SCHEMES: ColorScheme[] = ["colorful", "monochrome", "two_color"];
const DIAGRAM_RATIOS: DiagramRatio[] = ["high", "standard", "low"];

export default function GeneratePage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [generatedBlackboard, setGeneratedBlackboard] = useState<string | null>(
    null
  );
  const [svgBlackboardData, setSvgBlackboardData] = useState<any>(null);
  const [formData, setFormData] = useState<BlackboardGenerateForm>({
    subject: "mathematics",
    grade: "junior_high_3",
    unitName: "",
    classDuration: 60,
    keyPoints: "",
    layoutType: "problem_solving",
    textSize: "medium",
    colorScheme: "colorful",
    diagramRatio: "standard",
  });

  useEffect(() => {
    // ログイン確認（簡易版 - 本格版では useAuth フックを使用）
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (!response.ok) {
          console.log('Auth check failed, redirecting to login');
          router.push("/auth/login");
        }
      } catch (error) {
        console.warn('Auth check error, using localStorage fallback:', error);
        // ローカルストレージでのフォールバック
        const userData = localStorage.getItem("user");
        if (!userData) {
          router.push("/auth/login");
        }
      }
    };
    
    // 認証チェックをスキップして開発を継続（MVP版）
    // checkAuth();
  }, [router]);

  const handleFileUpload = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || "");
      return;
    }

    setUploadedFile(file);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDownload = async (format: 'png' | 'pdf') => {
    if (!generatedBlackboard) return;

    try {
      // 画像をBlobとして取得
      const response = await fetch(generatedBlackboard);
      const blob = await response.blob();
      
      // ダウンロード用のリンクを作成
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `blackboard_${timestamp}.${format}`;
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setError('ダウンロードに失敗しました');
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile) {
      setError("画像ファイルをアップロードしてください");
      return;
    }

    setGenerating(true);
    setError("");

    try {
      // 実際のAPI呼び出し
      const formDataToSend = new FormData();
      formDataToSend.append('file', uploadedFile);
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('grade', formData.grade);
      formDataToSend.append('unitName', formData.unitName);
      formDataToSend.append('classDuration', formData.classDuration.toString());
      formDataToSend.append('keyPoints', formData.keyPoints);
      formDataToSend.append('layoutType', formData.layoutType);
      formDataToSend.append('textSize', formData.textSize);
      formDataToSend.append('colorScheme', formData.colorScheme);
      formDataToSend.append('diagramRatio', formData.diagramRatio);

      // AbortController でタイムアウト制御
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒タイムアウト

      const response = await fetch('/api/blackboards/generate', {
        method: 'POST',
        body: formDataToSend,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'APIエラーが発生しました' }));
        throw new Error(errorData.error || '板書生成に失敗しました');
      }

      const result = await response.json();
      
      // SVGフォーマット対応
      if (result.type === 'svg' && result.svgData) {
        setSvgBlackboardData(result.svgData);
        setGeneratedBlackboard(null);
      } else if (result.imageUrl) {
        // 後方互換性
        setGeneratedBlackboard(result.imageUrl);
        setSvgBlackboardData(null);
      } else {
        throw new Error('板書データの受信に失敗しました');
      }
    } catch (err) {
      console.error('Generation error:', err);
      
      let errorMessage = "板書生成に失敗しました";
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = "処理時間が長すぎるため中断されました。再度お試しください。";
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = "ネットワークエラーが発生しました。インターネット接続を確認してください。";
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              戻る
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">板書生成</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!generatedBlackboard && !svgBlackboardData ? (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Step 1: File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>ステップ 1: 教材のアップロード</CardTitle>
                <CardDescription>
                  教科書や問題集のページを写真で撮影してアップロードしてください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver
                      ? "border-blue-400 bg-blue-50"
                      : uploadedFile
                      ? "border-green-400 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-4">
                      <div className="text-green-600">
                        <Upload className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-lg font-medium">
                          ファイルがアップロードされました
                        </p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{uploadedFile.name}</p>
                        <p>{formatFileSize(uploadedFile.size)}</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadedFile(null);
                          setError("");
                        }}
                      >
                        別のファイルを選択
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          ファイルをドラッグ&ドロップ
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          または下のボタンからファイルを選択
                        </p>
                        <label htmlFor="file-upload">
                          <Button variant="outline" asChild>
                            <span>ファイルを選択</span>
                          </Button>
                        </label>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        対応形式: JPG, PNG, PDF (最大10MB)
                      </p>
                    </div>
                  )}
                </div>

                {error && (
                  <div className="mt-4 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Settings */}
            <Card>
              <CardHeader>
                <CardTitle>ステップ 2: 設定</CardTitle>
                <CardDescription>
                  板書生成のための詳細設定を行ってください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* 科目選択 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      科目 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subject: e.target.value as Subject,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {SUBJECTS.map((subject) => (
                        <option key={subject} value={subject}>
                          {getSubjectLabel(subject)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 学年選択 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      学年 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.grade}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          grade: e.target.value as Grade,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                          {getGradeLabel(grade)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* 単元名 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      単元名{" "}
                      <span className="text-gray-500 text-xs">(任意)</span>
                    </label>
                    <Input
                      type="text"
                      placeholder="例: 二次関数"
                      value={formData.unitName}
                      onChange={(e) =>
                        setFormData({ ...formData, unitName: e.target.value })
                      }
                      maxLength={50}
                    />
                  </div>

                  {/* 授業時間 */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      授業時間
                    </label>
                    <select
                      value={formData.classDuration}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          classDuration: parseInt(
                            e.target.value
                          ) as ClassDuration,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {CLASS_DURATIONS.map((duration) => (
                        <option key={duration} value={duration}>
                          {duration}分
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 重点ポイント */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    重点ポイント{" "}
                    <span className="text-gray-500 text-xs">(任意)</span>
                  </label>
                  <textarea
                    placeholder="授業で特に強調したいポイントがあれば入力してください"
                    value={formData.keyPoints}
                    onChange={(e) =>
                      setFormData({ ...formData, keyPoints: e.target.value })
                    }
                    maxLength={200}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    {formData.keyPoints.length}/200文字
                  </p>
                </div>

                {/* レイアウト設定 */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      レイアウト
                    </label>
                    <select
                      value={formData.layoutType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          layoutType: e.target.value as LayoutType,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {LAYOUT_TYPES.map((layout) => (
                        <option key={layout} value={layout}>
                          {getLayoutTypeLabel(layout)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      文字サイズ
                    </label>
                    <select
                      value={formData.textSize}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          textSize: e.target.value as TextSize,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="small">小</option>
                      <option value="medium">中</option>
                      <option value="large">大</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      色使い
                    </label>
                    <select
                      value={formData.colorScheme}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          colorScheme: e.target.value as ColorScheme,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="colorful">カラフル</option>
                      <option value="monochrome">モノクロ</option>
                      <option value="two_color">2色使い</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!uploadedFile || generating}
                className="px-8"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    板書生成中...
                  </>
                ) : (
                  "板書を生成する"
                )}
              </Button>
            </div>
          </div>
        ) : (
          /* Generated Result */
          <div className="max-w-7xl mx-auto space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">
                  📝 板書が生成されました！
                </CardTitle>
                <CardDescription className="text-center">
                  生成された板書をプレビューし、ダウンロードしてください
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Board Preview */}
                {svgBlackboardData ? (
                  <div className="text-center">
                    <SVGBlackboard
                      title={svgBlackboardData.title}
                      mainContent={svgBlackboardData.mainContent}
                      sections={svgBlackboardData.sections}
                      teachingPoints={svgBlackboardData.teachingPoints}
                    />
                  </div>
                ) : generatedBlackboard ? (
                  /* Legacy support */
                  <div className="text-center">
                    
                    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                      <img
                        src={generatedBlackboard}
                        alt="生成された板書"
                        className="w-full h-auto"
                        onError={(e) => {
                        // 画像読み込みエラー時の代替表示
                        (e.target as HTMLImageElement).style.display = "none";
                        const parent = (e.target as HTMLImageElement)
                          .parentElement;
                        if (parent) {
                          parent.innerHTML =
                            '<div class="h-64 flex items-center justify-center bg-gray-100 text-gray-500">生成された板書のプレビュー</div>';
                        }
                      }}
                    />
                  </div>
                </div>
                ) : null}

                {/* Actions - SVGの場合はSVGBlackboardコンポーネント内でダウンロードボタンを提供 */}
                {generatedBlackboard && (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      size="lg" 
                      className="flex-1 max-w-xs"
                      onClick={() => handleDownload('png')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      PNG画像をダウンロード
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="flex-1 max-w-xs"
                      onClick={() => handleDownload('pdf')}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      PDFをダウンロード
                    </Button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      setGeneratedBlackboard(null);
                      setSvgBlackboardData(null);
                      setUploadedFile(null);
                      setError("");
                    }}
                    className="flex-1 max-w-xs"
                  >
                    新しい板書を作成
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push("/dashboard")}
                    className="flex-1 max-w-xs"
                  >
                    ダッシュボードに戻る
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </main>
    </div>
  );
}
