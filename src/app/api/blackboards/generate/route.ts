import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, checkUsageLimits, recordUsage } from "@/lib/auth";
import { extractTextFromImage } from "@/lib/vision";
import { analyzeWithAI } from "@/lib/openai";
import { generateBlackboard } from "@/lib/blackboard-generator";
import { uploadImageBuffer, resizeAndUploadImage } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // MVP版: 認証チェックを一時的にスキップ
    let user = { id: "demo-user", email: "demo@example.com" };
    let profile = { plan_type: "pro" }; // 制限なしでテスト

    // 本格版では以下のコードを有効化
    // const authResult = await getCurrentUser();
    // if (!authResult) {
    //   return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    // }
    // const { user, profile } = authResult;

    // 使用制限チェックもスキップ（MVP版）
    // const usageLimits = await checkUsageLimits(user.id);
    // if (!usageLimits.canGenerate) {
    //   return NextResponse.json(
    //     {
    //       error: "今月の生成制限に達しました。プランをアップグレードしてください。",
    //       currentUsage: usageLimits.currentUsage,
    //       limits: usageLimits.limits,
    //     },
    //     { status: 429 }
    //   );
    // }

    // リクエストデータの解析
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const subject = formData.get("subject") as string;
    const grade = formData.get("grade") as string;
    const layoutType = formData.get("layoutType") as string;
    const textSize = formData.get("textSize") as string;
    const colorScheme = formData.get("colorScheme") as string;
    const diagramRatio = formData.get("diagramRatio") as string;
    const unitName = formData.get("unitName") as string | null;
    const keyPoints = formData.get("keyPoints") as string | null;
    const classDuration = formData.get("classDuration") as string | null;

    if (!file || !subject || !grade || !layoutType) {
      return NextResponse.json(
        { error: "必須パラメータが不足しています" },
        { status: 400 }
      );
    }

    // MVP版: データベース処理をスキップして直接生成
    const blackboardId = uuidv4();
    
    // 本格版では以下のデータベース処理を有効化
    // const { error: insertError } = await supabaseAdmin
    //   .from("blackboards")
    //   .insert({
    //     id: blackboardId,
    //     user_id: user.id,
    //     title: `${subject} - ${new Date().toLocaleDateString("ja-JP")}`,
    //     subject,
    //     grade,
    //     unit_name: unitName,
    //     class_duration: classDuration ? parseInt(classDuration) : null,
    //     key_points: keyPoints,
    //     layout_type: layoutType,
    //     text_size: textSize,
    //     color_scheme: colorScheme,
    //     diagram_ratio: diagramRatio,
    //     generation_status: "processing",
    //   });
    // if (insertError) {
    //   console.error("Database insert error:", insertError);
    //   return NextResponse.json(
    //     { error: "データベースエラーが発生しました" },
    //     { status: 500 }
    //   );
    // }

    // MVPでは同期処理（簡単にするため）
    const result = await processBlackboardGeneration(file, blackboardId, user.id, {
      subject,
      grade,
      layoutType,
      textSize,
      colorScheme,
      diagramRatio,
      unitName,
      keyPoints,
      classDuration: classDuration ? parseInt(classDuration) : null,
    });

    if (result.success) {
      return NextResponse.json({
        blackboardId,
        imageUrl: result.imageUrl,
        status: "completed",
        message: "板書生成が完了しました",
      });
    } else {
      return NextResponse.json(
        { error: result.error || "板書生成に失敗しました" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Blackboard generation error:", error);
    return NextResponse.json(
      { error: "板書生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}

// 非同期処理関数
async function processBlackboardGeneration(
  file: File,
  blackboardId: string,
  userId: string,
  params: {
    subject: string;
    grade: string;
    layoutType: string;
    textSize: string;
    colorScheme: string;
    diagramRatio: string;
    unitName: string | null;
    keyPoints: string | null;
    classDuration: number | null;
  }
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    // MVP版: シンプルな板書生成のみ
    console.log("Starting blackboard generation for MVP");

    // 2. OCR処理
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    console.log("Processing OCR...");
    const ocrResult = await extractTextFromImage(imageBuffer);

    // 3. AI分析
    console.log("Analyzing with AI...");
    const aiAnalysis = await analyzeWithAI({
      ocrText: ocrResult.text,
      subject: params.subject as any,
      grade: params.grade as any,
      layoutType: params.layoutType as any,
      keyPoints: params.keyPoints || undefined,
      unitName: params.unitName || undefined,
    });

    // 4. 板書生成
    console.log("Generating blackboard...");
    const blackboardBuffer = await generateBlackboard(aiAnalysis, {
      subject: params.subject as any,
      grade: params.grade as any,
      layoutType: params.layoutType as any,
      textSize: params.textSize as any,
      colorScheme: params.colorScheme as any,
      diagramRatio: params.diagramRatio as any,
    });

    // MVP版: 一時的にBase64データURLとして返す（ファイルアップロードスキップ）
    const base64Image = `data:image/png;base64,${blackboardBuffer.toString('base64')}`;
    
    // 本格版では以下のファイルアップロード処理を有効化
    // const originalImageResult = await uploadImageBuffer(
    //   Buffer.from(await file.arrayBuffer()),
    //   `original_${blackboardId}.${file.name.split(".").pop()}`,
    //   userId,
    //   "originals"
    // );
    // const generatedImageResult = await uploadImageBuffer(
    //   blackboardBuffer,
    //   `generated_${blackboardId}.png`,
    //   userId,
    //   "generated"
    // );

    console.log("Blackboard generation completed successfully!");
    
    return {
      success: true,
      imageUrl: base64Image,
    };
  } catch (error) {
    console.error(`Blackboard generation failed: ${blackboardId}`, error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "板書生成に失敗しました",
    };
  }
}
