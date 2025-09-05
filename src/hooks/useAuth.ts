"use client";

import { useState, useEffect } from "react";
import { createClientSupabaseClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    loading: true,
    error: null,
  });

  const supabase = createClientSupabaseClient();

  useEffect(() => {
    // 初期セッション取得
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Session error:", error);
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "セッション取得に失敗しました",
        });
      }
    };

    getInitialSession();

    // 認証状態変更の監視
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        setAuthState({
          user: session.user,
          profile,
          loading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ユーザープロファイル取得
  const fetchUserProfile = async (
    userId: string
  ): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile fetch error:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
  };

  // ログイン
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "ログインに失敗しました";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  // Google OAuth ログイン
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Googleログインに失敗しました";
      setAuthState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  // サインアップ
  const signUp = async (
    email: string,
    password: string,
    metadata: {
      name: string;
      school_name?: string;
      subjects?: string[];
    }
  ) => {
    try {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "アカウント作成に失敗しました";
      setAuthState((prev) => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  // ログアウト
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  // プロファイル更新
  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!authState.user) {
        throw new Error("ログインが必要です");
      }

      const { data, error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authState.user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setAuthState((prev) => ({
        ...prev,
        profile: data,
      }));

      return data;
    } catch (error) {
      console.error("Profile update error:", error);
      throw error;
    }
  };

  return {
    ...authState,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    updateProfile,
    refreshProfile: () => {
      if (authState.user) {
        fetchUserProfile(authState.user.id).then((profile) => {
          setAuthState((prev) => ({ ...prev, profile }));
        });
      }
    },
  };
}
