"use client";

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

export interface BlackboardFormData {
  file: File;
  subject: string;
  grade: string;
  layoutType: string;
  textSize: string;
  colorScheme: string;
  diagramRatio: string;
  unitName?: string;
  keyPoints?: string;
  classDuration?: number;
}

export interface BlackboardStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  title?: string;
  originalImageUrl?: string;
  generatedImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export function useBlackboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentBlackboard, setCurrentBlackboard] =
    useState<BlackboardStatus | null>(null);

  // 板書生成開始
  const generateBlackboard = useCallback(
    async (formData: BlackboardFormData): Promise<string> => {
      setIsGenerating(true);

      try {
        const formDataToSend = new FormData();
        formDataToSend.append("file", formData.file);
        formDataToSend.append("subject", formData.subject);
        formDataToSend.append("grade", formData.grade);
        formDataToSend.append("layoutType", formData.layoutType);
        formDataToSend.append("textSize", formData.textSize);
        formDataToSend.append("colorScheme", formData.colorScheme);
        formDataToSend.append("diagramRatio", formData.diagramRatio);

        if (formData.unitName) {
          formDataToSend.append("unitName", formData.unitName);
        }
        if (formData.keyPoints) {
          formDataToSend.append("keyPoints", formData.keyPoints);
        }
        if (formData.classDuration) {
          formDataToSend.append(
            "classDuration",
            formData.classDuration.toString()
          );
        }

        const response = await fetch("/api/blackboards/generate", {
          method: "POST",
          body: formDataToSend,
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 429) {
            toast.error(
              "今月の生成制限に達しました。プランをアップグレードしてください。"
            );
          } else {
            toast.error(result.error || "板書生成に失敗しました");
          }
          throw new Error(result.error || "板書生成に失敗しました");
        }

        toast.success("板書生成を開始しました");
        return result.blackboardId;
      } catch (error) {
        console.error("Generate blackboard error:", error);
        throw error;
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  // 板書ステータス確認
  const checkStatus = useCallback(
    async (blackboardId: string): Promise<BlackboardStatus> => {
      try {
        const response = await fetch(`/api/blackboards/${blackboardId}/status`);

        if (!response.ok) {
          throw new Error("ステータス取得に失敗しました");
        }

        const status = await response.json();
        setCurrentBlackboard(status);

        return status;
      } catch (error) {
        console.error("Check status error:", error);
        throw error;
      }
    },
    []
  );

  // 板書一覧取得
  const fetchBlackboards = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      subject?: string;
      grade?: string;
      status?: string;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      try {
        const searchParams = new URLSearchParams();

        if (params?.page) searchParams.set("page", params.page.toString());
        if (params?.limit) searchParams.set("limit", params.limit.toString());
        if (params?.subject) searchParams.set("subject", params.subject);
        if (params?.grade) searchParams.set("grade", params.grade);
        if (params?.status) searchParams.set("status", params.status);
        if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
        if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);

        const response = await fetch(`/api/blackboards?${searchParams}`);

        if (!response.ok) {
          throw new Error("板書一覧の取得に失敗しました");
        }

        return await response.json();
      } catch (error) {
        console.error("Fetch blackboards error:", error);
        throw error;
      }
    },
    []
  );

  // ポーリングでステータス監視
  const pollStatus = useCallback(
    async (
      blackboardId: string,
      onStatusChange?: (status: BlackboardStatus) => void,
      maxAttempts: number = 60, // 最大5分間（5秒間隔）
      interval: number = 5000
    ): Promise<BlackboardStatus> => {
      let attempts = 0;

      return new Promise((resolve, reject) => {
        const poll = async () => {
          try {
            attempts++;
            const status = await checkStatus(blackboardId);

            if (onStatusChange) {
              onStatusChange(status);
            }

            if (status.status === "completed") {
              toast.success("板書生成が完了しました！");
              resolve(status);
              return;
            }

            if (status.status === "failed") {
              toast.error("板書生成に失敗しました");
              reject(new Error("板書生成に失敗しました"));
              return;
            }

            if (attempts >= maxAttempts) {
              toast.error("板書生成がタイムアウトしました");
              reject(new Error("板書生成がタイムアウトしました"));
              return;
            }

            // まだ処理中の場合は再度ポーリング
            setTimeout(poll, interval);
          } catch (error) {
            reject(error);
          }
        };

        poll();
      });
    },
    [checkStatus]
  );

  return {
    isGenerating,
    currentBlackboard,
    generateBlackboard,
    checkStatus,
    fetchBlackboards,
    pollStatus,
    setCurrentBlackboard,
  };
}
