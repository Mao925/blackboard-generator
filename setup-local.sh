#!/bin/bash

echo "🚀 板書ジェネレーター ローカル環境セットアップ"
echo "=========================================="

# 環境変数ファイルの確認
if [ ! -f .env.local ]; then
    echo "📝 .env.local ファイルを作成中..."
    cp .env.example .env.local
    echo "✅ .env.local ファイルを作成しました"
    echo ""
    echo "🚨 重要: .env.local ファイルに以下の環境変数を設定してください："
    echo "  - NEXT_PUBLIC_SUPABASE_URL"
    echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "  - SUPABASE_SERVICE_ROLE_KEY"
    echo "  - OPENAI_API_KEY"
    echo "  - Google Cloud関連の設定"
    echo "  - Stripe関連の設定"
    echo ""
    echo "詳細は LOCAL_SETUP.md を参照してください。"
    echo ""
    read -p "環境変数の設定が完了したら Enter を押してください..."
fi

# 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

# Canvas ライブラリの確認（macOS用）
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🖼️  Canvas ライブラリの依存関係を確認中..."
    if ! command -v pkg-config &> /dev/null; then
        echo "⚠️  pkg-config が見つかりません"
        echo "以下のコマンドでインストールしてください："
        echo "brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman"
        read -p "インストール後、Enter を押してください..."
    fi
fi

# TypeScript 型チェック
echo "🔍 TypeScript 型チェック中..."
npm run type-check

if [ $? -eq 0 ]; then
    echo "✅ 型チェック完了"
else
    echo "❌ 型エラーがあります。修正してください。"
    exit 1
fi

# ビルドテスト
echo "🔧 ビルドテスト中..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ ビルド成功"
else
    echo "❌ ビルドエラーがあります。確認してください。"
    exit 1
fi

echo ""
echo "🎉 セットアップ完了！"
echo ""
echo "🚀 開発サーバーを起動するには："
echo "   npm run dev"
echo ""
echo "🌐 アプリケーションは http://localhost:3000 で起動します"
echo ""
echo "📚 詳細なセットアップ情報は LOCAL_SETUP.md を参照してください"
