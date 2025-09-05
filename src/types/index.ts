// ユーザー関連の型定義
export interface User {
  id: string;
  email: string;
  name: string;
  schoolName?: string;
  subjects: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 認証関連の型定義
export interface AuthRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// 板書生成関連の型定義
export interface BlackboardRequest {
  imageFile: File;
  subject: Subject;
  grade: Grade;
  unitName?: string;
  classDuration: ClassDuration;
  keyPoints?: string;
  layoutType: LayoutType;
  textSize: TextSize;
  colorScheme: ColorScheme;
  diagramRatio: DiagramRatio;
}

export interface BlackboardResponse {
  id: string;
  imageUrl: string;
  pdfUrl: string;
  title: string;
  subject: Subject;
  grade: Grade;
  createdAt: Date;
}

// 科目の型定義
export type Subject =
  | "arithmetic" // 算数
  | "mathematics" // 数学
  | "japanese" // 国語
  | "english" // 英語
  | "science" // 理科
  | "social"; // 社会

// 学年の型定義
export type Grade =
  | "elementary_4" // 小4
  | "elementary_5" // 小5
  | "elementary_6" // 小6
  | "junior_high_1" // 中1
  | "junior_high_2" // 中2
  | "junior_high_3" // 中3
  | "high_school_1" // 高1
  | "high_school_2" // 高2
  | "high_school_3" // 高3
  | "other"; // その他

// 授業時間の型定義
export type ClassDuration = 30 | 45 | 60 | 90;

// レイアウトタイプの型定義
export type LayoutType =
  | "problem_solving" // 問題解法型
  | "formula_explanation" // 公式説明型
  | "diagram_focused" // 図解重視型
  | "special_arithmetic"; // 中学受験特殊算型

// テキストサイズの型定義
export type TextSize = "small" | "medium" | "large";

// カラースキームの型定義
export type ColorScheme = "colorful" | "monochrome" | "two_color";

// 図表比率の型定義
export type DiagramRatio = "high" | "standard" | "low";

// マイノート関連の型定義
export interface SavedBlackboard {
  id: string;
  title: string;
  subject: Subject;
  grade: Grade;
  imageUrl: string;
  pdfUrl: string;
  createdAt: Date;
  userId: string;
}

// API応答の型定義
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// フォームの型定義
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  schoolName?: string;
  subjects: Subject[];
}

export interface BlackboardGenerateForm {
  subject: Subject;
  grade: Grade;
  unitName: string;
  classDuration: ClassDuration;
  keyPoints: string;
  layoutType: LayoutType;
  textSize: TextSize;
  colorScheme: ColorScheme;
  diagramRatio: DiagramRatio;
}
