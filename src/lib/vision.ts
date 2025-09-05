import { ImageAnnotatorClient } from "@google-cloud/vision";

// Google Cloud Vision API クライアント（遅延初期化）
let visionClient: ImageAnnotatorClient | null = null;

const getVisionClient = () => {
  if (visionClient) {
    return visionClient;
  }

  // Vercel環境では環境変数からサービスアカウントキーを読み込み
  if (process.env.GOOGLE_CLOUD_CREDENTIALS_JSON) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS_JSON);
      visionClient = new ImageAnnotatorClient({
        credentials,
        projectId: credentials.project_id,
      });
      return visionClient;
    } catch (error) {
      console.error("Failed to parse Google Cloud credentials:", error);
      throw new Error("Google Cloud認証情報の解析に失敗しました");
    }
  }
  
  // ローカル環境では従来通りファイルパス指定
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    visionClient = new ImageAnnotatorClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    });
    return visionClient;
  }

  // APIキーを使用する場合（シンプルな認証）
  if (process.env.GOOGLE_CLOUD_VISION_API_KEY) {
    visionClient = new ImageAnnotatorClient({
      apiKey: process.env.GOOGLE_CLOUD_VISION_API_KEY,
    });
    return visionClient;
  }

  throw new Error("Google Cloud認証情報が設定されていません");
};

export interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes: BoundingBox[];
  language: string;
}

export interface BoundingBox {
  text: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

// 画像からテキストを抽出
export async function extractTextFromImage(
  imageBuffer: Buffer
): Promise<OCRResult> {
  try {
    const vision = getVisionClient();
    const [result] = await vision.textDetection({
      image: { content: imageBuffer },
      imageContext: {
        languageHints: ["ja", "en"], // 日本語と英語を優先
      },
    });

    const detections = result.textAnnotations || [];

    if (detections.length === 0) {
      return {
        text: "",
        confidence: 0,
        boundingBoxes: [],
        language: "unknown",
      };
    }

    // 最初の要素は全体のテキスト
    const fullText = detections[0]?.description || "";
    const confidence = calculateAverageConfidence(detections);

    // 個別の文字・単語のバウンディングボックス
    const boundingBoxes: BoundingBox[] = detections
      .slice(1)
      .map((detection) => {
        const vertices = detection.boundingPoly?.vertices || [];
        const bounds = calculateBounds(vertices);

        return {
          text: detection.description || "",
          bounds,
          confidence: detection.confidence || 0,
        };
      });

    // 言語検出
    const language = detectLanguage(fullText);

    return {
      text: fullText,
      confidence,
      boundingBoxes,
      language,
    };
  } catch (error) {
    console.error("Vision API error:", error);
    throw new Error(`OCR処理に失敗しました: ${error}`);
  }
}

// URL指定でのOCR（Supabase Storageの画像用）
export async function extractTextFromImageUrl(
  imageUrl: string
): Promise<OCRResult> {
  try {
    const vision = getVisionClient();
    const [result] = await vision.textDetection({
      image: { source: { imageUri: imageUrl } },
      imageContext: {
        languageHints: ["ja", "en"],
      },
    });

    const detections = result.textAnnotations || [];

    if (detections.length === 0) {
      return {
        text: "",
        confidence: 0,
        boundingBoxes: [],
        language: "unknown",
      };
    }

    const fullText = detections[0]?.description || "";
    const confidence = calculateAverageConfidence(detections);

    const boundingBoxes: BoundingBox[] = detections
      .slice(1)
      .map((detection) => {
        const vertices = detection.boundingPoly?.vertices || [];
        const bounds = calculateBounds(vertices);

        return {
          text: detection.description || "",
          bounds,
          confidence: detection.confidence || 0,
        };
      });

    const language = detectLanguage(fullText);

    return {
      text: fullText,
      confidence,
      boundingBoxes,
      language,
    };
  } catch (error) {
    console.error("Vision API error:", error);
    throw new Error(`OCR処理に失敗しました: ${error}`);
  }
}

// バウンディングボックスの計算
function calculateBounds(vertices: any[]): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  if (vertices.length < 4) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const xs = vertices.map((v) => v.x || 0);
  const ys = vertices.map((v) => v.y || 0);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// 平均信頼度の計算
function calculateAverageConfidence(detections: any[]): number {
  if (detections.length === 0) return 0;

  const confidences = detections
    .map((d) => d.confidence || 0)
    .filter((c) => c > 0);

  if (confidences.length === 0) return 0;

  return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
}

// 言語検出（簡易版）
function detectLanguage(text: string): string {
  // 日本語文字が含まれているかチェック
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  if (japaneseRegex.test(text)) {
    return "ja";
  }

  // 英語文字のみの場合
  const englishRegex = /^[A-Za-z0-9\s\.,!?'"()-]+$/;
  if (englishRegex.test(text.trim())) {
    return "en";
  }

  return "unknown";
}

// テキストの前処理（ノイズ除去）
export function preprocessOCRText(text: string): string {
  return (
    text
      // 連続する空白を単一の空白に変換
      .replace(/\s+/g, " ")
      // 先頭と末尾の空白を削除
      .trim()
      // 明らかな誤認識文字を修正（数学記号など）
      .replace(/[|]/g, "1") // パイプを1に修正
      .replace(/[O]/g, "0") // 大文字Oを0に修正（数式の場合）
      // 改行の正規化
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
  );
}

// 数学的内容の検出
export function detectMathContent(text: string): boolean {
  const mathPatterns = [
    /[+\-*/=]/, // 基本的な数学記号
    /\d+[xy]/, // 変数を含む式
    /\([^)]*\)/, // 括弧
    /\d+\/\d+/, // 分数
    /\d+\^\d+/, // 指数
    /[∫∑∏√]/, // 高度な数学記号
    /sin|cos|tan|log/, // 数学関数
  ];

  return mathPatterns.some((pattern) => pattern.test(text));
}

// 科学的内容の検出
export function detectScienceContent(text: string): boolean {
  const sciencePatterns = [
    /[A-Z][a-z]*\d*/, // 化学式っぽい
    /\d+\.?\d*\s*[a-zA-Z]+/, // 単位付きの数値
    /°C|°F|K/, // 温度単位
    /mol|atom|ion/, // 化学用語
    /DNA|RNA/, // 生物学用語
  ];

  return sciencePatterns.some((pattern) => pattern.test(text));
}
