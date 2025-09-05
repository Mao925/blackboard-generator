import OpenAI from "openai";
import { getSubjectLabel, getGradeLabel, getLayoutTypeLabel } from "./utils";
import type { Subject, Grade, LayoutType } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AIAnalysisRequest {
  ocrText: string;
  subject: Subject;
  grade: Grade;
  layoutType: LayoutType;
  keyPoints?: string;
  unitName?: string;
}

export interface AIAnalysisResponse {
  title: string;
  mainContent: string[];
  subContent: string[];
  suggestedLayout: {
    sections: LayoutSection[];
    visualElements: VisualElement[];
  };
  teachingPoints: string[];
  expectedDuration: number;
  difficulty: "basic" | "intermediate" | "advanced";
}

export interface LayoutSection {
  type: "title" | "main" | "sub" | "example" | "summary";
  content: string;
  position: { x: number; y: number; width: number; height: number };
  style: {
    fontSize: number;
    color: string;
    backgroundColor?: string;
    border?: boolean;
  };
}

export interface VisualElement {
  type: "diagram" | "table" | "graph" | "image" | "formula";
  description: string;
  position: { x: number; y: number; width: number; height: number };
  data?: any;
}

// プロンプト生成関数
const generateAnalysisPrompt = (request: AIAnalysisRequest): string => {
  const subjectLabel = getSubjectLabel(request.subject);
  const gradeLabel = getGradeLabel(request.grade);
  const layoutLabel = getLayoutTypeLabel(request.layoutType);

  return `あなたは経験豊富な${subjectLabel}の塾講師です。
以下の教材内容から、${gradeLabel}向けの効果的な板書案を作成してください。

【教材内容】
${request.ocrText}

【単元名】
${request.unitName || "未指定"}

【レイアウト指定】
${layoutLabel}

【重点ポイント】
${request.keyPoints || "なし"}

【要求】
以下のJSON形式で、教育効果の高い板書案を提案してください：

{
  "title": "板書のタイトル（簡潔で分かりやすく）",
  "mainContent": [
    "メインコンテンツ1（核となる概念や公式）",
    "メインコンテンツ2（重要な解法や考え方）"
  ],
  "subContent": [
    "補足説明1（理解を深める情報）",
    "補足説明2（注意点や応用）"
  ],
  "suggestedLayout": {
    "sections": [
      {
        "type": "title",
        "content": "タイトル内容",
        "position": {"x": 10, "y": 10, "width": 780, "height": 60},
        "style": {"fontSize": 32, "color": "#2563eb", "border": true}
      }
    ],
    "visualElements": [
      {
        "type": "diagram",
        "description": "図解の説明",
        "position": {"x": 50, "y": 100, "width": 300, "height": 200}
      }
    ]
  },
  "teachingPoints": [
    "指導ポイント1（生徒の理解を促すコツ）",
    "指導ポイント2（よくある間違いと対策）"
  ],
  "expectedDuration": 授業時間（分）,
  "difficulty": "basic" | "intermediate" | "advanced"
}

【注意点】
- 生徒の学年に適した内容にする
- 視覚的に分かりやすいレイアウトを提案する
- 実際の板書で実現可能な構成にする
- 教育的価値の高い内容を優先する`;
};

// AI分析実行
export async function analyzeWithAI(
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  try {
    const prompt = generateAnalysisPrompt(request);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "あなたは教育のプロフェッショナルです。効果的な板書案を作成することに特化しています。必ずJSON形式で回答してください。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error("AI分析の応答が空です");
    }

    // JSONパース（エラーハンドリング付き）
    try {
      const analysis = JSON.parse(responseText) as AIAnalysisResponse;

      // 必須フィールドの検証
      if (!analysis.title || !analysis.mainContent) {
        throw new Error("AI分析の応答形式が不正です");
      }

      return analysis;
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("AI分析の応答をパースできませんでした");
    }
  } catch (error) {
    console.error("OpenAI API error:", error);

    // フォールバック応答
    return {
      title: `${getSubjectLabel(request.subject)}の学習内容`,
      mainContent: ["教材内容の要点整理", "重要なポイントの説明"],
      subContent: ["補足説明や詳細", "練習問題や応用例"],
      suggestedLayout: {
        sections: [
          {
            type: "title",
            content: `${getSubjectLabel(request.subject)}の学習内容`,
            position: { x: 10, y: 10, width: 780, height: 60 },
            style: { fontSize: 32, color: "#2563eb", border: true },
          },
          {
            type: "main",
            content: "教材内容の要点整理",
            position: { x: 50, y: 100, width: 700, height: 200 },
            style: { fontSize: 18, color: "#1f2937" },
          },
        ],
        visualElements: [],
      },
      teachingPoints: [
        "生徒の理解度を確認しながら進める",
        "具体例を交えて説明する",
      ],
      expectedDuration: 60,
      difficulty: "intermediate",
    };
  }
}

// 板書生成用のプロンプト
export async function generateBlackboardInstructions(
  analysis: AIAnalysisResponse,
  subject: Subject,
  grade: Grade
): Promise<string> {
  const instructions = `
## 板書生成指示書

### 基本情報
- 科目: ${getSubjectLabel(subject)}
- 学年: ${getGradeLabel(grade)}
- 難易度: ${analysis.difficulty}
- 想定時間: ${analysis.expectedDuration}分

### タイトル
${analysis.title}

### メインコンテンツ
${analysis.mainContent
  .map((content, index) => `${index + 1}. ${content}`)
  .join("\n")}

### 補足コンテンツ
${analysis.subContent.map((content, index) => `・ ${content}`).join("\n")}

### 指導ポイント
${analysis.teachingPoints
  .map((point, index) => `${index + 1}. ${point}`)
  .join("\n")}

### レイアウト指示
${analysis.suggestedLayout.sections
  .map(
    (section) =>
      `- ${section.type}: ${section.content} (位置: x:${section.position.x}, y:${section.position.y})`
  )
  .join("\n")}
`;

  return instructions;
}
