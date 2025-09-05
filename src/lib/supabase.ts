import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// クライアントサイド用
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// サーバーサイド用（サービスロール）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// 型定義
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          school_name: string | null;
          subjects: string[];
          plan_type: "free" | "pro" | "premium";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          school_name?: string | null;
          subjects: string[];
          plan_type?: "free" | "pro" | "premium";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          school_name?: string | null;
          subjects?: string[];
          plan_type?: "free" | "pro" | "premium";
          created_at?: string;
          updated_at?: string;
        };
      };
      blackboards: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          subject: string;
          grade: string;
          unit_name: string | null;
          class_duration: number | null;
          key_points: string | null;
          layout_type: string;
          text_size: string;
          color_scheme: string;
          diagram_ratio: string;
          original_image_url: string | null;
          generated_image_url: string | null;
          generated_pdf_url: string | null;
          ocr_text: string | null;
          ai_analysis: any | null;
          generation_status: "pending" | "processing" | "completed" | "failed";
          tags: string[];
          is_public: boolean;
          download_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          subject: string;
          grade: string;
          unit_name?: string | null;
          class_duration?: number | null;
          key_points?: string | null;
          layout_type: string;
          text_size: string;
          color_scheme: string;
          diagram_ratio: string;
          original_image_url?: string | null;
          generated_image_url?: string | null;
          generated_pdf_url?: string | null;
          ocr_text?: string | null;
          ai_analysis?: any | null;
          generation_status?: "pending" | "processing" | "completed" | "failed";
          tags?: string[];
          is_public?: boolean;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          subject?: string;
          grade?: string;
          unit_name?: string | null;
          class_duration?: number | null;
          key_points?: string | null;
          layout_type?: string;
          text_size?: string;
          color_scheme?: string;
          diagram_ratio?: string;
          original_image_url?: string | null;
          generated_image_url?: string | null;
          generated_pdf_url?: string | null;
          ocr_text?: string | null;
          ai_analysis?: any | null;
          generation_status?: "pending" | "processing" | "completed" | "failed";
          tags?: string[];
          is_public?: boolean;
          download_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          generations_count: number;
          downloads_count: number;
          storage_used: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          generations_count?: number;
          downloads_count?: number;
          storage_used?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          generations_count?: number;
          downloads_count?: number;
          storage_used?: number;
          created_at?: string;
        };
      };
      plan_limits: {
        Row: {
          plan_type: string;
          max_generations_per_month: number;
          max_storage_mb: number;
          max_file_size_mb: number;
          ai_features_enabled: boolean;
          priority_processing: boolean;
        };
        Insert: {
          plan_type: string;
          max_generations_per_month: number;
          max_storage_mb: number;
          max_file_size_mb: number;
          ai_features_enabled?: boolean;
          priority_processing?: boolean;
        };
        Update: {
          plan_type?: string;
          max_generations_per_month?: number;
          max_storage_mb?: number;
          max_file_size_mb?: number;
          ai_features_enabled?: boolean;
          priority_processing?: boolean;
        };
      };
    };
  };
};
