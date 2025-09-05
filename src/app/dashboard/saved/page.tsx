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
  Search,
  Filter,
  Grid,
  List,
  Download,
  FileText,
  Trash2,
  Eye,
  Calendar,
  Tag,
} from "lucide-react";
import { formatDate, getSubjectLabel, getGradeLabel } from "@/lib/utils";
import type { SavedBlackboard, Subject, Grade } from "@/types";

export default function SavedBlackboardsPage() {
  const router = useRouter();
  const [blackboards, setBlackboards] = useState<SavedBlackboard[]>([]);
  const [filteredBlackboards, setFilteredBlackboards] = useState<
    SavedBlackboard[]
  >([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Subject | "all">(
    "all"
  );
  const [selectedGrade, setSelectedGrade] = useState<Grade | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "subject" | "grade">("date");

  useEffect(() => {
    // ログイン確認
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/auth/login");
      return;
    }

    // 保存された板書データを取得（MVPでは仮データ）
    const mockData: SavedBlackboard[] = [
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
      {
        id: "3",
        title: "鎌倉時代の文化",
        subject: "social",
        grade: "junior_high_2",
        imageUrl: "/sample-blackboard-3.png",
        pdfUrl: "/sample-blackboard-3.pdf",
        createdAt: new Date(Date.now() - 259200000), // 3日前
        userId: "1",
      },
      {
        id: "4",
        title: "特殊算・つるかめ算",
        subject: "arithmetic",
        grade: "elementary_6",
        imageUrl: "/sample-blackboard-4.png",
        pdfUrl: "/sample-blackboard-4.pdf",
        createdAt: new Date(Date.now() - 345600000), // 4日前
        userId: "1",
      },
      {
        id: "5",
        title: "化学反応式",
        subject: "science",
        grade: "junior_high_3",
        imageUrl: "/sample-blackboard-5.png",
        pdfUrl: "/sample-blackboard-5.pdf",
        createdAt: new Date(Date.now() - 432000000), // 5日前
        userId: "1",
      },
    ];

    setBlackboards(mockData);
    setFilteredBlackboards(mockData);
  }, [router]);

  // フィルタリングとソート処理
  useEffect(() => {
    let filtered = blackboards.filter((board) => {
      const matchesSearch = board.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesSubject =
        selectedSubject === "all" || board.subject === selectedSubject;
      const matchesGrade =
        selectedGrade === "all" || board.grade === selectedGrade;

      return matchesSearch && matchesSubject && matchesGrade;
    });

    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "subject":
          return getSubjectLabel(a.subject).localeCompare(
            getSubjectLabel(b.subject)
          );
        case "grade":
          return getGradeLabel(a.grade).localeCompare(getGradeLabel(b.grade));
        default:
          return 0;
      }
    });

    setFilteredBlackboards(filtered);
  }, [blackboards, searchTerm, selectedSubject, selectedGrade, sortBy]);

  const handleDelete = (id: string) => {
    if (window.confirm("この板書を削除しますか？")) {
      setBlackboards((prev) => prev.filter((board) => board.id !== id));
    }
  };

  const uniqueSubjects = Array.from(
    new Set(blackboards.map((board) => board.subject))
  ) as Subject[];
  const uniqueGrades = Array.from(
    new Set(blackboards.map((board) => board.grade))
  ) as Grade[];

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
                マイノート
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Controls */}
        <div className="mb-8 space-y-4">
          {/* Search and View Mode */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="タイトルで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                フィルター:
              </span>
            </div>

            <select
              value={selectedSubject}
              onChange={(e) =>
                setSelectedSubject(e.target.value as Subject | "all")
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべての科目</option>
              {uniqueSubjects.map((subject) => (
                <option key={subject} value={subject}>
                  {getSubjectLabel(subject)}
                </option>
              ))}
            </select>

            <select
              value={selectedGrade}
              onChange={(e) =>
                setSelectedGrade(e.target.value as Grade | "all")
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">すべての学年</option>
              {uniqueGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {getGradeLabel(grade)}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "date" | "subject" | "grade")
              }
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="date">作成日時順</option>
              <option value="subject">科目順</option>
              <option value="grade">学年順</option>
            </select>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-600">
            {filteredBlackboards.length} 件の板書が見つかりました
            {filteredBlackboards.length !== blackboards.length && (
              <span> (全 {blackboards.length} 件中)</span>
            )}
          </div>
        </div>

        {/* Content */}
        {filteredBlackboards.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredBlackboards.map((blackboard) => (
              <Card
                key={blackboard.id}
                className={`hover:shadow-lg transition-shadow ${
                  viewMode === "list" ? "flex flex-row" : ""
                }`}
              >
                {viewMode === "grid" ? (
                  <>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(blackboard.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardTitle className="text-lg">
                        {blackboard.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(blackboard.createdAt)}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          表示
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="flex items-center w-full p-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {getSubjectLabel(blackboard.subject)}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                          {getGradeLabel(blackboard.grade)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">
                        {blackboard.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(blackboard.createdAt)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        表示
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(blackboard.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ||
                selectedSubject !== "all" ||
                selectedGrade !== "all"
                  ? "条件に一致する板書が見つかりません"
                  : "保存された板書がありません"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ||
                selectedSubject !== "all" ||
                selectedGrade !== "all"
                  ? "検索条件を変更してみてください"
                  : "最初の板書を作成して、授業準備を効率化しましょう"}
              </p>
              {searchTerm ||
              selectedSubject !== "all" ||
              selectedGrade !== "all" ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedSubject("all");
                    setSelectedGrade("all");
                  }}
                >
                  フィルターをクリア
                </Button>
              ) : (
                <Button onClick={() => router.push("/generate")}>
                  新しい板書を作成
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
