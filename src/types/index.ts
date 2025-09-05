// 教科の型定義
export type Subject = 
  | "math" 
  | "japanese" 
  | "english" 
  | "science" 
  | "social_studies" 
  | "physics" 
  | "chemistry" 
  | "biology" 
  | "world_history" 
  | "japanese_history" 
  | "geography" 
  | "other";

// 学年の型定義
export type Grade = 
  | "elementary_4" 
  | "elementary_5" 
  | "elementary_6" 
  | "junior_1" 
  | "junior_2" 
  | "junior_3" 
  | "high_1" 
  | "high_2" 
  | "high_3";

// ユーザーの型定義
export interface User {
  id: string;
  email: string;
  full_name?: string;
  plan_type: "free" | "pro" | "premium";
  created_at: string;
  updated_at: string;
  stripe_customer_id?: string;
  trial_ends_at?: string;
  subscription_status?: "active" | "canceled" | "past_due" | "unpaid";
}

// ログインフォームの型定義
export interface LoginForm {
  email: string;
  password: string;
}

// 会員登録フォームの型定義
export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

// 板書生成設定の型定義
export interface BlackboardGenerateForm {
  subject: Subject;
  grade: Grade;
  layoutType: "standard" | "detailed" | "simple";
  textSize: "small" | "medium" | "large";
  colorScheme: "classic" | "modern" | "colorful";
  diagramRatio: number;
  unitName?: string;
  keyPoints?: string[];
  classDuration?: number;
}

// 板書データの型定義
export interface Blackboard {
  id: string;
  user_id: string;
  title: string;
  subject: Subject;
  grade: Grade;
  original_image_url: string;
  generated_image_url?: string;
  thumbnail_url?: string;
  ocr_text?: string;
  ai_analysis?: string;
  generation_config: BlackboardGenerateForm;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  updated_at: string;
  file_size?: number;
  processing_time?: number;
}

// 使用統計の型定義
export interface UsageStats {
  id: string;
  user_id: string;
  date: string;
  generations_count: number;
  storage_used: number;
  created_at: string;
}

// プラン制限の型定義
export interface PlanLimits {
  id: string;
  plan_type: "free" | "pro" | "premium";
  max_generations_per_month: number;
  max_storage_mb: number;
  features: string[];
  price_monthly: number;
  stripe_price_id?: string;
}

// API レスポンスの型定義
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 板書生成リクエストの型定義
export interface GenerateBlackboardRequest {
  image: File;
  config: BlackboardGenerateForm;
}

// 板書生成レスポンスの型定義
export interface GenerateBlackboardResponse {
  id: string;
  status: "pending" | "processing";
  message: string;
}

// 板書ステータスレスポンスの型定義
export interface BlackboardStatusResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  current_step?: string;
  result?: {
    generated_image_url: string;
    thumbnail_url: string;
    ocr_text: string;
    ai_analysis: string;
    processing_time: number;
  };
  error?: string;
}

// 使用量データの型定義
export interface UsageData {
  current_period: {
    generations_used: number;
    storage_used_mb: number;
  };
  limits: {
    max_generations: number;
    max_storage_mb: number;
  };
  plan: {
    type: "free" | "pro" | "premium";
    name: string;
    features: string[];
  };
  overage_fees?: {
    generation_fee: number;
    storage_fee: number;
    total: number;
  };
}

// Stripe チェックアウトセッション作成リクエストの型定義
export interface CreateCheckoutRequest {
  price_id: string;
  success_url: string;
  cancel_url: string;
}

// Stripe チェックアウトセッション作成レスポンスの型定義
export interface CreateCheckoutResponse {
  session_id: string;
  url: string;
}

// Stripe カスタマーポータルセッション作成レスポンスの型定義
export interface CreatePortalResponse {
  url: string;
}

// プロフィール更新の型定義
export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
}

// エラーレスポンスの型定義
export interface ErrorResponse {
  error: string;
  details?: string;
  code?: string;
}
