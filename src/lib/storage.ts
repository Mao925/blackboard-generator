import { supabase } from "./supabase";
import { supabaseAdmin } from "./supabase";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  contentType: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

// ファイルアップロード（クライアント用）
export async function uploadImage(
  file: File,
  userId: string,
  folder: "originals" | "generated" | "thumbnails" = "originals"
): Promise<UploadResult> {
  try {
    // supabaseクライアントは直接インポート済み

    // ファイル名生成
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${userId}/${folder}/${fileName}`;

    // ファイルアップロード
    const { data, error } = await supabase.storage
      .from("blackboard-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`アップロードに失敗しました: ${error.message}`);
    }

    // パブリックURLを取得
    const { data: urlData } = supabase.storage
      .from("blackboard-images")
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      size: file.size,
      contentType: file.type,
    };
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

// サーバーサイドファイルアップロード
export async function uploadImageBuffer(
  buffer: Buffer,
  fileName: string,
  userId: string,
  folder: "originals" | "generated" | "thumbnails" = "generated"
): Promise<UploadResult> {
  try {
    const filePath = `${userId}/${folder}/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from("blackboard-images")
      .upload(filePath, buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: "image/png",
      });

    if (error) {
      throw new Error(`アップロードに失敗しました: ${error.message}`);
    }

    // パブリックURLを取得
    const { data: urlData } = supabaseAdmin.storage
      .from("blackboard-images")
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      size: buffer.length,
      contentType: "image/png",
    };
  } catch (error) {
    console.error("Upload buffer error:", error);
    throw error;
  }
}

// 画像リサイズとアップロード
export async function resizeAndUploadImage(
  inputBuffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
  },
  fileName: string,
  userId: string,
  folder: "originals" | "generated" | "thumbnails" = "generated"
): Promise<UploadResult> {
  try {
    let sharpInstance = sharp(inputBuffer);

    // リサイズ
    if (options.width || options.height) {
      sharpInstance = sharpInstance.resize(options.width, options.height, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // フォーマット変換と品質設定
    switch (options.format) {
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({ quality: options.quality || 90 });
        break;
      case "png":
        sharpInstance = sharpInstance.png({ quality: options.quality || 90 });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({ quality: options.quality || 90 });
        break;
      default:
        sharpInstance = sharpInstance.png();
    }

    const processedBuffer = await sharpInstance.toBuffer();

    return await uploadImageBuffer(processedBuffer, fileName, userId, folder);
  } catch (error) {
    console.error("Resize and upload error:", error);
    throw error;
  }
}

// 画像メタデータ取得
export async function getImageMetadata(buffer: Buffer): Promise<ImageMetadata> {
  try {
    const metadata = await sharp(buffer).metadata();

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || "unknown",
      size: buffer.length,
    };
  } catch (error) {
    console.error("Get image metadata error:", error);
    throw new Error("画像メタデータの取得に失敗しました");
  }
}

// サムネイル生成
export async function generateThumbnail(
  originalBuffer: Buffer,
  userId: string,
  originalFileName: string
): Promise<UploadResult> {
  try {
    const thumbnailBuffer = await sharp(originalBuffer)
      .resize(300, 200, {
        fit: "cover",
        position: "center",
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailFileName = `thumb_${originalFileName.replace(
      /\.[^/.]+$/,
      ""
    )}.jpg`;

    return await uploadImageBuffer(
      thumbnailBuffer,
      thumbnailFileName,
      userId,
      "thumbnails"
    );
  } catch (error) {
    console.error("Generate thumbnail error:", error);
    throw new Error("サムネイル生成に失敗しました");
  }
}

// ファイル削除
export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.storage
      .from("blackboard-images")
      .remove([filePath]);

    if (error) {
      console.error("Delete image error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Delete image error:", error);
    return false;
  }
}

// ユーザーのストレージ使用量計算
export async function calculateUserStorageUsage(
  userId: string
): Promise<number> {
  try {
    const { data: files, error } = await supabaseAdmin.storage
      .from("blackboard-images")
      .list(userId, {
        limit: 1000,
        offset: 0,
      });

    if (error) {
      console.error("Calculate storage usage error:", error);
      return 0;
    }

    const totalSize =
      files?.reduce((sum, file) => {
        return sum + (file.metadata?.size || 0);
      }, 0) || 0;

    return totalSize;
  } catch (error) {
    console.error("Calculate storage usage error:", error);
    return 0;
  }
}

// URLから画像バッファを取得
export async function downloadImageFromUrl(url: string): Promise<Buffer> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`画像の取得に失敗しました: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("Download image error:", error);
    throw error;
  }
}

// 画像の最適化
export async function optimizeImage(
  inputBuffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: "jpeg" | "png" | "webp";
  } = {}
): Promise<Buffer> {
  try {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 85,
      format = "jpeg",
    } = options;

    let sharpInstance = sharp(inputBuffer);

    // メタデータ取得
    const metadata = await sharpInstance.metadata();

    // リサイズが必要かチェック
    if (
      metadata.width &&
      metadata.height &&
      (metadata.width > maxWidth || metadata.height > maxHeight)
    ) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // フォーマット変換
    switch (format) {
      case "jpeg":
        sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
        break;
      case "png":
        sharpInstance = sharpInstance.png({ quality });
        break;
      case "webp":
        sharpInstance = sharpInstance.webp({ quality });
        break;
    }

    return await sharpInstance.toBuffer();
  } catch (error) {
    console.error("Optimize image error:", error);
    throw error;
  }
}

// ファイル形式の検証
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
  const maxSize = 50 * 1024 * 1024; // 50MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "JPG、PNG、またはPDFファイルのみアップロード可能です",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "ファイルサイズは50MB以下である必要があります",
    };
  }

  return { isValid: true };
}

// プリセット画像サイズ
export const IMAGE_PRESETS = {
  thumbnail: { width: 300, height: 200, quality: 80, format: "jpeg" as const },
  medium: { width: 800, height: 600, quality: 85, format: "jpeg" as const },
  large: { width: 1920, height: 1080, quality: 90, format: "png" as const },
  blackboard: {
    width: 1920,
    height: 1080,
    quality: 95,
    format: "png" as const,
  },
};
