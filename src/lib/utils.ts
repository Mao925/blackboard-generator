import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 科目名の日本語表示用関数
export function getSubjectLabel(subject: string): string {
  const subjectLabels: Record<string, string> = {
    arithmetic: "算数",
    mathematics: "数学",
    japanese: "国語",
    english: "英語",
    science: "理科",
    social: "社会",
  };
  return subjectLabels[subject] || subject;
}

// 学年名の日本語表示用関数
export function getGradeLabel(grade: string): string {
  const gradeLabels: Record<string, string> = {
    elementary_4: "小学4年",
    elementary_5: "小学5年",
    elementary_6: "小学6年",
    junior_high_1: "中学1年",
    junior_high_2: "中学2年",
    junior_high_3: "中学3年",
    high_school_1: "高校1年",
    high_school_2: "高校2年",
    high_school_3: "高校3年",
    other: "その他",
  };
  return gradeLabels[grade] || grade;
}

// レイアウトタイプの日本語表示用関数
export function getLayoutTypeLabel(layoutType: string): string {
  const layoutTypeLabels: Record<string, string> = {
    problem_solving: "問題解法型",
    formula_explanation: "公式説明型",
    diagram_focused: "図解重視型",
    special_arithmetic: "中学受験特殊算型",
  };
  return layoutTypeLabels[layoutType] || layoutType;
}

// ファイルサイズのフォーマット関数
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// 日付のフォーマット関数
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// エラーメッセージの処理関数
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "予期しないエラーが発生しました";
}

// 画像ファイルの検証関数
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/pdf",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "JPG、PNG、またはPDFファイルのみアップロード可能です",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "ファイルサイズは10MB以下である必要があります",
    };
  }

  return { isValid: true };
}
