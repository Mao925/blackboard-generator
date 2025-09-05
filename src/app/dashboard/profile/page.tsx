"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  ArrowLeft,
  Save,
  User,
  Mail,
  Building,
  Tag,
  Loader2,
} from "lucide-react";
import { getSubjectLabel } from "@/lib/utils";
import type { User as UserType, Subject } from "@/types";

const SUBJECTS: Subject[] = [
  "arithmetic",
  "mathematics",
  "japanese",
  "english",
  "science",
  "social",
];

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    schoolName: "",
    subjects: [] as Subject[],
  });

  useEffect(() => {
    // ログイン確認とユーザー情報取得
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      const userInfo: UserType = {
        id: "1",
        email: parsedUser.email,
        name: parsedUser.name,
        schoolName: parsedUser.schoolName || "",
        subjects: parsedUser.subjects || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(userInfo);
      setFormData({
        name: userInfo.name,
        email: userInfo.email,
        schoolName: userInfo.schoolName || "",
        subjects: userInfo.subjects as Subject[],
      });
    } catch (error) {
      console.error("Failed to parse user data:", error);
      router.push("/auth/login");
    }
  }, [router]);

  const handleSubjectToggle = (subject: Subject) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // バリデーション
    if (!formData.name.trim()) {
      setMessage({ type: "error", text: "お名前を入力してください" });
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setMessage({ type: "error", text: "メールアドレスを入力してください" });
      setLoading(false);
      return;
    }

    if (formData.subjects.length === 0) {
      setMessage({
        type: "error",
        text: "指導科目を少なくとも1つ選択してください",
      });
      setLoading(false);
      return;
    }

    try {
      // TODO: 実際のAPI呼び出し実装
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });

      // if (!response.ok) {
      //   throw new Error('プロフィールの更新に失敗しました');
      // }

      // MVPでは簡易更新実装
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待機

      // ローカルストレージを更新
      const updatedUser = {
        ...formData,
        subjects: formData.subjects,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // stateを更新
      if (user) {
        setUser({
          ...user,
          ...formData,
          updatedAt: new Date(),
        });
      }

      setMessage({ type: "success", text: "プロフィールを更新しました" });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "プロフィールの更新に失敗しました",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              ダッシュボード
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                プロフィール設定
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>アカウント情報</span>
            </CardTitle>
            <CardDescription>
              プロフィール情報を編集してください。変更内容は保存ボタンをクリックすることで反映されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {message && (
                <div
                  className={`p-3 text-sm rounded-md ${
                    message.type === "success"
                      ? "text-green-600 bg-green-50 border border-green-200"
                      : "text-red-600 bg-red-50 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* 基本情報 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>基本情報</span>
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="山田太郎"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-700"
                    >
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="example@example.com"
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="schoolName"
                    className="text-sm font-medium text-gray-700"
                  >
                    所属塾名{" "}
                    <span className="text-gray-500 text-xs">(任意)</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="schoolName"
                      type="text"
                      value={formData.schoolName}
                      onChange={(e) =>
                        setFormData({ ...formData, schoolName: e.target.value })
                      }
                      placeholder="〇〇塾"
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* 指導科目 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span>指導科目</span>
                </h3>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    指導可能な科目を選択してください{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {SUBJECTS.map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectToggle(subject)}
                        className={`p-3 text-sm rounded-md border transition-all duration-200 ${
                          formData.subjects.includes(subject)
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                        disabled={loading}
                      >
                        {getSubjectLabel(subject)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    選択した科目: {formData.subjects.length}個
                  </p>
                </div>
              </div>

              {/* アカウント統計 */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium text-gray-900">
                  アカウント統計
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">作成した板書数</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      6時間
                    </div>
                    <div className="text-sm text-gray-600">節約した時間</div>
                  </div>
                </div>
              </div>

              {/* 保存ボタン */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={loading} className="px-8">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      変更を保存
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* アカウント削除セクション */}
        <Card className="mt-8 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">危険な操作</CardTitle>
            <CardDescription>
              以下の操作は元に戻せません。慎重に行ってください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "本当にアカウントを削除しますか？この操作は元に戻せません。"
                  )
                ) {
                  // TODO: アカウント削除API実装
                  localStorage.removeItem("user");
                  router.push("/");
                }
              }}
            >
              アカウントを削除
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
