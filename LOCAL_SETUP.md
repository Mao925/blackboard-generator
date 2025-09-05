# 🚀 ローカル開発環境セットアップガイド

## 📋 必要な環境

- Node.js 18.0.0 以上
- npm または yarn
- Supabase プロジェクト
- OpenAI API アカウント
- Google Cloud Platform アカウント（Vision API）
- Stripe アカウント（課金機能用）

## ⚙️ セットアップ手順

### 1. 環境変数の設定

```bash
# .env.local ファイルを作成
cp .env.example .env.local
```

`.env.local` に以下の値を設定してください：

#### Supabase 設定
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### OpenAI API 設定
```env
OPENAI_API_KEY=sk-your-openai-api-key
```

#### Google Cloud Vision API 設定
```env
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-key.json
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
```

#### Stripe 設定
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRICE_ID_PRO=price_your-pro-price-id
STRIPE_PRICE_ID_PREMIUM=price_your-premium-price-id
```

#### アプリケーション設定
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=admin@example.com
```

### 2. Supabase データベースのセットアップ

1. Supabase Dashboard にログイン
2. 新しいプロジェクトを作成
3. SQL Editor で `supabase/schema.sql` の内容を実行

### 3. Google Cloud 認証キーの設定

1. Google Cloud Console でサービスアカウントを作成
2. Vision API を有効化
3. サービスアカウントキー（JSON）をダウンロード
4. `google-cloud-key.json` としてプロジェクトルートに保存

### 4. Stripe 商品の設定

1. Stripe Dashboard でテスト環境の商品・価格を作成
2. Price ID を `.env.local` に設定

### 5. 開発サーバーの起動

```bash
npm run dev
```

アプリケーションが http://localhost:3000 で起動します。

## 🧪 機能テスト手順

### 1. ユーザー認証
- 新規会員登録
- メール・パスワードログイン
- Google OAuth ログイン

### 2. 板書生成機能
- 画像アップロード
- 設定選択（教科、学年、レイアウトなど）
- 生成処理の確認
- 結果の確認・ダウンロード

### 3. プラン・課金機能
- 使用量の確認
- プラン変更（テスト環境）
- 制限の動作確認

## 🔧 トラブルシューティング

### Canvas ライブラリエラー

macOS の場合：
```bash
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman
npm rebuild canvas
```

### Google Cloud 認証エラー

1. サービスアカウントキーのパスが正しいか確認
2. Vision API が有効化されているか確認
3. 認証情報の権限を確認

### Supabase 接続エラー

1. プロジェクト URL と API キーが正しいか確認
2. RLS (Row Level Security) の設定を確認
3. データベーススキーマが正しく作成されているか確認

### Stripe テストエラー

1. テストキーを使用しているか確認
2. 商品・価格がテスト環境で作成されているか確認
3. Webhook エンドポイントの設定を確認

## 📚 開発者向け情報

### ディレクトリ構造
```
src/
├── app/                 # Next.js App Router
├── components/          # React コンポーネント
├── hooks/              # カスタムフック
├── lib/                # ユーティリティ・クライアント
└── types/              # TypeScript 型定義
```

### 主要技術スタック
- **Framework**: Next.js 15
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment**: Stripe
- **AI**: OpenAI GPT-4
- **OCR**: Google Cloud Vision API
- **Image Processing**: Canvas API, Sharp
- **UI**: Tailwind CSS, Radix UI
- **Form**: React Hook Form + Zod

### API エンドポイント
- `/api/auth/*` - 認証関連
- `/api/blackboards/*` - 板書生成関連
- `/api/billing/*` - 課金関連
- `/api/usage` - 使用量取得
- `/api/webhooks/stripe` - Stripe Webhook

## 🐛 よくある問題

1. **メモリ不足エラー**: 大きな画像を処理する際に発生。`NODE_OPTIONS="--max-old-space-size=4096"` を設定
2. **CORS エラー**: Supabase の CORS 設定を確認
3. **型エラー**: `npm run type-check` で TypeScript エラーを確認

## 🚀 本番環境デプロイ

1. Vercel での自動デプロイ設定
2. 環境変数の本番用設定
3. Stripe の本番環境切り替え
4. ドメイン設定とSSL証明書

詳細は `DEPLOYMENT.md` を参照してください。
