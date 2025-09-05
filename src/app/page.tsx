import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Clock, Smartphone, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">
              板書ジェネレーター
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">ログイン</Button>
            </Link>
            <Link href="/auth/register">
              <Button>会員登録</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            授業準備を
            <span className="text-blue-600">革新</span>
            する
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            教材の写真を撮るだけで、AIが自動で見やすい板書案を生成。
            塾講師の皆様の授業準備時間を大幅に削減します。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="w-full sm:w-auto">
                無料で始める
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                デモを見る
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <Zap className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle className="text-lg">5秒で生成</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                教材の写真をアップロードするだけで、わずか5秒で板書案が完成
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-lg">全科目対応</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                算数・数学・国語・英語・理科・社会まで、すべての科目をサポート
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Smartphone className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-lg">スマホ対応</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                スマートフォンで片手操作可能。移動中でも簡単に授業準備
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-lg">時間短縮</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                従来の授業準備時間を50%削減。より質の高い指導に集中
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            使い方は簡単3ステップ
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">教材をアップロード</h3>
              <p className="text-gray-600">
                教科書や問題集のページを写真で撮影してアップロード
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">設定を選択</h3>
              <p className="text-gray-600">
                科目・学年・レイアウトタイプなどを簡単選択
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">板書案完成</h3>
              <p className="text-gray-600">
                AIが自動生成した見やすい板書案をダウンロード
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            今すぐ授業準備を効率化しませんか？
          </h2>
          <p className="text-xl text-gray-600 mb-6">
            無料アカウント作成で、すぐに板書生成を体験できます
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="px-8">
              無料で始める
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">板書ジェネレーター</span>
          </div>
          <p className="text-gray-400">
            © 2024 板書ジェネレーター. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
