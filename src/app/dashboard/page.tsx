"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Plus,
  User as UserIcon,
  LogOut,
  FileText,
  Clock,
  Download,
} from "lucide-react";
import { formatDate, getSubjectLabel, getGradeLabel } from "@/lib/utils";
import type { User, SavedBlackboard } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [recentBlackboards, setRecentBlackboards] = useState<SavedBlackboard[]>(
    []
  );

  useEffect(() => {
    // ユーザー情報を取得
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/auth/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser({
        id: "1",
        email: parsedUser.email,
        name: parsedUser.name,
        schoolName: parsedUser.schoolName,
        subjects: parsedUser.subjects || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 保存された板書データを取得（MVPでは仮データ）
      setRecentBlackboards([
        {
          id: "1",
          title: "二次関数の基本",
          subject: "mathematics",
          grade: "junior_high_3",
          imageUrl: "/sample-blackboard.png",
          pdfUrl: "/sample-blackboard.pdf",
          createdAt: new Date(Date.now() - 86400000), // 1日前
          userId: "1",
        },
        {
          id: "2",
          title: "英語の現在完了形",
          subject: "english",
          grade: "junior_high_3",
          imageUrl: "/sample-blackboard-2.png",
          pdfUrl: "/sample-blackboard-2.pdf",
          createdAt: new Date(Date.now() - 172800000), // 2日前
          userId: "1",
        },
      ]);
    } catch (error) {
      console.error("Failed to parse user data:", error);
      router.push("/auth/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">
                板書ジェネレーター
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <UserIcon className="h-4 w-4" />
                <span className="text-sm">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                ログアウト
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            おかえりなさい、{user.name}さん
          </h1>
          <p className="text-gray-600">
            {user.schoolName && `${user.schoolName}での`}
            授業準備をサポートします
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/generate">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">新しい板書を作成</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  教材の写真をアップロードして、新しい板書案を生成します
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/dashboard/saved">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">マイノート</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  保存した板書案を確認・管理します
                </CardDescription>
              </CardContent>
            </Link>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <Link href="/dashboard/profile">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4">
                  <UserIcon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">プロフィール</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  アカウント情報や指導科目を設定します
                </CardDescription>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Blackboards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">最近の板書</h2>
            <Link href="/dashboard/saved">
              <Button variant="outline">すべて表示</Button>
            </Link>
          </div>

          {recentBlackboards.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentBlackboards.map((blackboard) => (
                <Card
                  key={blackboard.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {getSubjectLabel(blackboard.subject)}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {getGradeLabel(blackboard.grade)}
                        </span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">
                      {blackboard.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(blackboard.createdAt)}
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-1" />
                        表示
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  まだ板書が作成されていません
                </h3>
                <p className="text-gray-600 mb-6">
                  最初の板書を作成して、授業準備を効率化しましょう
                </p>
                <Link href="/generate">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    新しい板書を作成
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">今月の板書数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">12</div>
              <p className="text-sm text-gray-600 mt-1">前月比 +3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">指導科目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {user.subjects.map((subject: string) => (
                  <span
                    key={subject}
                    className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded"
                  >
                    {getSubjectLabel(subject)}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">節約した時間</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">6時間</div>
              <p className="text-sm text-gray-600 mt-1">今月の累計</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
