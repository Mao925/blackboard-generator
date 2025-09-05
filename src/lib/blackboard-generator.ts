import { createCanvas, registerFont, CanvasRenderingContext2D } from "canvas";
import type {
  AIAnalysisResponse,
  LayoutSection,
  VisualElement,
} from "./openai";
import type {
  Subject,
  Grade,
  LayoutType,
  TextSize,
  ColorScheme,
  DiagramRatio,
} from "@/types";

export interface BlackboardConfig {
  width: number;
  height: number;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  borderColor: string;
  fontSize: {
    title: number;
    main: number;
    sub: number;
    small: number;
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  spacing: {
    section: number;
    line: number;
  };
}

export interface GenerationOptions {
  subject: Subject;
  grade: Grade;
  layoutType: LayoutType;
  textSize: TextSize;
  colorScheme: ColorScheme;
  diagramRatio: DiagramRatio;
}

// デフォルト設定
const DEFAULT_CONFIG: BlackboardConfig = {
  width: 1920,
  height: 1080,
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  accentColor: "#2563eb",
  borderColor: "#e5e7eb",
  fontSize: {
    title: 48,
    main: 32,
    sub: 24,
    small: 18,
  },
  padding: {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60,
  },
  spacing: {
    section: 40,
    line: 32,
  },
};

// カラースキーム定義
const COLOR_SCHEMES = {
  classic: {
    background: "#f8fafc",
    text: "#1f2937",
    accent: "#3b82f6",
    border: "#e5e7eb",
  },
  dark: {
    background: "#1f2937",
    text: "#f9fafb",
    accent: "#60a5fa",
    border: "#374151",
  },
  warm: {
    background: "#fef7ed",
    text: "#9a3412",
    accent: "#ea580c",
    border: "#fed7aa",
  },
  cool: {
    background: "#f0f9ff",
    text: "#164e63",
    accent: "#0891b2",
    border: "#e0f2fe",
  },
  colorful: {
    background: "#ffffff",
    text: "#1f2937",
    accent: "#2563eb",
    border: "#e5e7eb",
  },
  monochrome: {
    background: "#ffffff",
    text: "#1f2937",
    accent: "#374151",
    border: "#e5e7eb",
  },
  two_color: {
    background: "#ffffff",
    text: "#1f2937",
    accent: "#2563eb",
    border: "#e5e7eb",
  },
};

class BlackboardGenerator {
  private canvas: any;
  private ctx: CanvasRenderingContext2D;
  private config: BlackboardConfig;

  constructor(config: Partial<BlackboardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.canvas = createCanvas(this.config.width, this.config.height);
    this.ctx = this.canvas.getContext("2d");

    // 日本語フォント登録（可能であれば）
    this.initializeFonts();

    // 背景色設定
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
  }

  // フォント初期化
  private initializeFonts(): void {
    try {
      // macOS固有の日本語フォント登録を試行
      const fs = require('fs');
      
      // macOSでよく利用可能な日本語フォントパス
      const macFontPaths = [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W0.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W1.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W2.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W4.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W5.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W7.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W8.ttc',
        '/System/Library/Fonts/ヒラギノ角ゴシック W9.ttc',
        '/Library/Fonts/Arial Unicode MS.ttf'
      ];

      for (const fontPath of macFontPaths) {
        try {
          if (fs.existsSync(fontPath)) {
            const fontName = fontPath.includes('ヒラギノ') ? 'Hiragino Sans' : 
                           fontPath.includes('Arial Unicode') ? 'Arial Unicode MS' : 'Helvetica';
            registerFont(fontPath, { family: fontName });
            console.log(`Successfully registered font: ${fontName} from ${fontPath}`);
            break; // 最初に見つかったフォントを使用
          }
        } catch (fontError) {
          console.warn(`Failed to register ${fontPath}:`, fontError);
        }
      }
      
      console.log("Font initialization completed");
    } catch (error) {
      console.warn("Font registration failed, using fallback fonts:", error);
    }
  }

  // 日本語対応フォント設定
  private setFont(size: number, weight: string = "normal"): void {
    try {
      // 登録済みフォントを優先した日本語対応フォント設定
      const fontFamilies = [
        '"Hiragino Sans"',           // 登録したmacOSフォント
        '"Arial Unicode MS"',        // Unicode対応フォント
        '"Helvetica"',               // macOS標準
        '"Liberation Sans"',         // Linux標準
        '"DejaVu Sans"',            // 汎用
        'Arial',                     // Windows/汎用
        'sans-serif'                 // 最終フォールバック
      ];
      
      const fontFamily = fontFamilies.join(', ');
      this.ctx.font = `${weight} ${size}px ${fontFamily}`;
      
      // テキストレンダリング設定の最適化
      this.ctx.textBaseline = "alphabetic";
      this.ctx.textRenderingOptimization = "optimizeLegibility";
      this.ctx.fillStyle = this.ctx.fillStyle || "#000000";
      
      // 日本語テキストでフォント動作確認
      const testTexts = ["Test", "ABC123", "Hello"];
      testTexts.forEach(text => {
        const metrics = this.ctx.measureText(text);
        console.log(`Font test - "${text}": width=${metrics.width}, font=${this.ctx.font}`);
      });
      
    } catch (error) {
      console.warn("Font setting failed, using basic fallback:", error);
      this.ctx.font = `${weight} ${size}px Arial, sans-serif`;
    }
  }

  // 日本語テキストを確実に表示するためのヘルパー関数
  private drawSafeText(text: string, x: number, y: number): void {
    try {
      // まず日本語テキストをそのまま試行
      this.ctx.fillText(text, x, y);
      
      // 文字幅をチェックして四角形化を検出
      const metrics = this.ctx.measureText(text);
      if (metrics.width < text.length * 2) {
        // 四角形化している可能性が高い場合、ローマ字表記に変換
        const romanizedText = this.romanizeJapanese(text);
        console.warn(`Japanese text may be corrupted, using romanized: ${text} -> ${romanizedText}`);
        this.ctx.fillText(romanizedText, x, y);
      }
    } catch (error) {
      console.error("Text rendering failed:", error);
      this.ctx.fillText("(Text Error)", x, y);
    }
  }

  // 簡易的な日本語→ローマ字変換
  private romanizeJapanese(text: string): string {
    const kanjiMap: { [key: string]: string } = {
      '数学': 'Suugaku (Math)',
      '問題': 'Mondai (Problem)', 
      '解法': 'Kaihou (Solution)',
      '説明': 'Setsumei (Explanation)',
      '重要': 'Juuyou (Important)',
      'ポイント': 'Point',
      '指導': 'Shidou (Teaching)',
      '詳細': 'Shousai (Detail)',
      '補足': 'Hosoku (Supplement)',
      '学習': 'Gakushuu (Learning)',
      '内容': 'Naiyou (Content)',
      '板書': 'Bansho (Blackboard)',
      '生成': 'Seisei (Generation)',
      '完了': 'Kanryou (Complete)',
      '作成': 'Sakusei (Creation)',
      '日': 'Date'
    };

    let result = text;
    Object.entries(kanjiMap).forEach(([japanese, roman]) => {
      result = result.replace(new RegExp(japanese, 'g'), roman);
    });

    return result;
  }

  // メイン生成関数
  async generateBlackboard(
    analysis: AIAnalysisResponse,
    options: GenerationOptions
  ): Promise<Buffer> {
    try {
      console.log("Starting blackboard generation with:", {
        title: analysis.title,
        layoutType: options.layoutType,
        canvasSize: `${this.config.width}x${this.config.height}`
      });

      // カラースキーム適用
      this.applyColorScheme(options.colorScheme);

      // フォントサイズ調整
      this.adjustFontSizes(options.textSize);

      // レイアウトに応じた描画
      await this.renderLayout(analysis, options);

      console.log("Blackboard generation completed successfully");

      // Bufferとして出力
      return this.canvas.toBuffer("image/png");
    } catch (error) {
      console.error("Blackboard generation error details:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        analysis: {
          title: analysis?.title,
          mainContentLength: analysis?.mainContent?.length,
          subContentLength: analysis?.subContent?.length
        }
      });
      
      // より具体的なエラーメッセージ
      const errorMessage = error instanceof Error ? error.message : "不明なエラー";
      throw new Error(`板書生成に失敗しました: ${errorMessage}`);
    }
  }

  // カラースキーム適用
  private applyColorScheme(colorScheme: ColorScheme) {
    try {
      const colors = COLOR_SCHEMES[colorScheme] || COLOR_SCHEMES.classic;

      if (!colors) {
        console.warn(`Color scheme '${colorScheme}' not found, using classic`);
        const fallback = COLOR_SCHEMES.classic;
        this.config.backgroundColor = fallback.background;
        this.config.textColor = fallback.text;
        this.config.accentColor = fallback.accent;
        this.config.borderColor = fallback.border;
      } else {
        this.config.backgroundColor = colors.background;
        this.config.textColor = colors.text;
        this.config.accentColor = colors.accent;
        this.config.borderColor = colors.border;
      }

      // 背景再描画
      this.ctx.fillStyle = this.config.backgroundColor;
      this.ctx.fillRect(0, 0, this.config.width, this.config.height);
      
      console.log(`Color scheme applied: ${colorScheme}`, {
        background: this.config.backgroundColor,
        text: this.config.textColor,
        accent: this.config.accentColor
      });
    } catch (error) {
      console.error("Color scheme application failed:", error);
      // デフォルト色設定
      this.config.backgroundColor = "#f8fafc";
      this.config.textColor = "#1f2937";
      this.config.accentColor = "#3b82f6";
      this.config.borderColor = "#e5e7eb";
    }
  }

  // フォントサイズ調整
  private adjustFontSizes(textSize: TextSize) {
    const multiplier = {
      small: 0.8,
      medium: 1.0,
      large: 1.2,
    }[textSize];

    this.config.fontSize.title *= multiplier;
    this.config.fontSize.main *= multiplier;
    this.config.fontSize.sub *= multiplier;
    this.config.fontSize.small *= multiplier;
  }

  // レイアウト描画
  private async renderLayout(
    analysis: AIAnalysisResponse,
    options: GenerationOptions
  ) {
    let currentY = this.config.padding.top;

    // タイトル描画
    currentY = this.drawTitle(analysis.title, currentY);
    currentY += this.config.spacing.section;

    // レイアウトタイプに応じた描画
    switch (options.layoutType) {
      case "problem_solving":
        currentY = await this.renderProblemSolvingLayout(
          analysis,
          currentY,
          options
        );
        break;
      case "formula_explanation":
        currentY = await this.renderFormulaExplanationLayout(
          analysis,
          currentY,
          options
        );
        break;
      case "diagram_focused":
        currentY = await this.renderDiagramFocusedLayout(
          analysis,
          currentY,
          options
        );
        break;
      case "special_arithmetic":
        currentY = await this.renderSpecialArithmeticLayout(
          analysis,
          currentY,
          options
        );
        break;
      default:
        currentY = await this.renderDefaultLayout(analysis, currentY, options);
    }

    // フッター情報
    this.drawFooter();
  }

  // タイトル描画
  private drawTitle(title: string, y: number): number {
    this.setFont(this.config.fontSize.title, "bold");
    this.ctx.fillStyle = this.config.accentColor;
    this.ctx.textAlign = "center";

    const x = this.config.width / 2;
    this.drawSafeText(title, x, y + this.config.fontSize.title);

    // 下線
    const titleWidth = this.ctx.measureText(title).width;
    this.ctx.strokeStyle = this.config.accentColor;
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.moveTo(x - titleWidth / 2, y + this.config.fontSize.title + 10);
    this.ctx.lineTo(x + titleWidth / 2, y + this.config.fontSize.title + 10);
    this.ctx.stroke();

    return y + this.config.fontSize.title + 30;
  }

  // 問題解法型レイアウト
  private async renderProblemSolvingLayout(
    analysis: AIAnalysisResponse,
    startY: number,
    options: GenerationOptions
  ): Promise<number> {
    let currentY = startY;
    const leftColumn = this.config.padding.left;
    const rightColumn = this.config.width / 2 + 20;
    const columnWidth = this.config.width / 2 - this.config.padding.right - 20;

    // 左側：問題・公式
    this.ctx.textAlign = "left";
    this.setFont(this.config.fontSize.main, "bold");
    this.ctx.fillStyle = this.config.textColor;

    currentY = this.drawSection(
      "問題・ポイント",
      analysis.mainContent,
      leftColumn,
      currentY,
      columnWidth
    );

    // 右側：解法・説明
    this.drawSection(
      "解法・説明",
      analysis.subContent,
      rightColumn,
      startY,
      columnWidth
    );

    // 下部：指導ポイント
    currentY += this.config.spacing.section;
    currentY = this.drawTeachingPoints(analysis.teachingPoints, currentY);

    return currentY;
  }

  // 公式説明型レイアウト
  private async renderFormulaExplanationLayout(
    analysis: AIAnalysisResponse,
    startY: number,
    options: GenerationOptions
  ): Promise<number> {
    let currentY = startY;

    // 公式エリア（中央配置）
    currentY = this.drawFormulaBox(analysis.mainContent[0] || "", currentY);
    currentY += this.config.spacing.section;

    // 説明エリア
    currentY = this.drawSection(
      "公式の説明",
      analysis.subContent,
      this.config.padding.left,
      currentY
    );
    currentY += this.config.spacing.section;

    // 例題エリア
    if (analysis.mainContent.length > 1) {
      currentY = this.drawSection(
        "例題",
        analysis.mainContent.slice(1),
        this.config.padding.left,
        currentY
      );
    }

    return currentY;
  }

  // 図解重視型レイアウト
  private async renderDiagramFocusedLayout(
    analysis: AIAnalysisResponse,
    startY: number,
    options: GenerationOptions
  ): Promise<number> {
    let currentY = startY;
    const diagramArea = {
      x: this.config.padding.left,
      y: currentY,
      width: this.config.width * 0.6,
      height: this.config.height * 0.4,
    };

    // 図解エリア（左側大部分）
    this.drawDiagramPlaceholder(diagramArea);

    // 説明エリア（右側）
    const textArea = {
      x: diagramArea.x + diagramArea.width + 40,
      y: currentY,
      width:
        this.config.width - diagramArea.width - this.config.padding.right - 60,
    };

    this.drawSection(
      "説明",
      analysis.mainContent,
      textArea.x,
      textArea.y,
      textArea.width
    );

    currentY = diagramArea.y + diagramArea.height + this.config.spacing.section;

    // 下部：補足情報
    currentY = this.drawSection(
      "補足・注意点",
      analysis.subContent,
      this.config.padding.left,
      currentY
    );

    return currentY;
  }

  // 中学受験特殊算型レイアウト
  private async renderSpecialArithmeticLayout(
    analysis: AIAnalysisResponse,
    startY: number,
    options: GenerationOptions
  ): Promise<number> {
    let currentY = startY;

    // 問題文エリア
    currentY = this.drawProblemBox(analysis.mainContent[0] || "", currentY);
    currentY += this.config.spacing.section;

    // 解法手順（ステップバイステップ）
    currentY = this.drawStepByStepSolution(analysis.subContent, currentY);
    currentY += this.config.spacing.section;

    // 答えエリア
    if (analysis.mainContent.length > 1) {
      currentY = this.drawAnswerBox(
        analysis.mainContent[analysis.mainContent.length - 1],
        currentY
      );
    }

    return currentY;
  }

  // デフォルトレイアウト
  private async renderDefaultLayout(
    analysis: AIAnalysisResponse,
    startY: number,
    options: GenerationOptions
  ): Promise<number> {
    let currentY = startY;

    // メインコンテンツ
    currentY = this.drawSection(
      "重要ポイント",
      analysis.mainContent,
      this.config.padding.left,
      currentY
    );
    currentY += this.config.spacing.section;

    // サブコンテンツ
    currentY = this.drawSection(
      "詳細・補足",
      analysis.subContent,
      this.config.padding.left,
      currentY
    );
    currentY += this.config.spacing.section;

    // 指導ポイント
    currentY = this.drawTeachingPoints(analysis.teachingPoints, currentY);

    return currentY;
  }

  // セクション描画
  private drawSection(
    title: string,
    content: string[],
    x: number,
    y: number,
    maxWidth?: number
  ): number {
    let currentY = y;
    const width =
      maxWidth ||
      this.config.width - this.config.padding.left - this.config.padding.right;

    // セクションタイトル
    this.setFont(this.config.fontSize.sub, "bold");
    this.ctx.fillStyle = this.config.accentColor;
    this.ctx.fillText(title, x, currentY + this.config.fontSize.sub);
    currentY += this.config.fontSize.sub + 20;

    // コンテンツ
    this.setFont(this.config.fontSize.main);
    this.ctx.fillStyle = this.config.textColor;

    content.forEach((item, index) => {
      const bullet = `${index + 1}. `;
      this.ctx.fillText(bullet, x, currentY + this.config.fontSize.main);

      const bulletWidth = this.ctx.measureText(bullet).width;
      const wrappedText = this.wrapText(item, width - bulletWidth);

      wrappedText.forEach((line, lineIndex) => {
        this.ctx.fillText(
          line,
          x + bulletWidth,
          currentY +
            this.config.fontSize.main +
            lineIndex * this.config.spacing.line
        );
      });

      currentY +=
        this.config.fontSize.main +
        (wrappedText.length - 1) * this.config.spacing.line +
        this.config.spacing.line;
    });

    return currentY;
  }

  // テキストラップ
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    words.forEach((word) => {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const testWidth = this.ctx.measureText(testLine).width;

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  // 公式ボックス描画
  private drawFormulaBox(formula: string, y: number): number {
    const boxHeight = 80;
    const boxWidth =
      this.config.width - this.config.padding.left - this.config.padding.right;
    const x = this.config.padding.left;

    // ボックス背景
    this.ctx.fillStyle = "#f3f4f6";
    this.ctx.fillRect(x, y, boxWidth, boxHeight);

    // ボックス枠線
    this.ctx.strokeStyle = this.config.accentColor;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x, y, boxWidth, boxHeight);

    // 公式テキスト
    this.ctx.font = `bold ${
      this.config.fontSize.title * 0.8
    }px Arial, sans-serif`;
    this.ctx.fillStyle = this.config.accentColor;
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      formula,
      this.config.width / 2,
      y + boxHeight / 2 + this.config.fontSize.title * 0.3
    );

    return y + boxHeight;
  }

  // 図解プレースホルダー描画
  private drawDiagramPlaceholder(area: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    // 背景
    this.ctx.fillStyle = "#f9fafb";
    this.ctx.fillRect(area.x, area.y, area.width, area.height);

    // 枠線
    this.ctx.strokeStyle = this.config.borderColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(area.x, area.y, area.width, area.height);

    // プレースホルダーテキスト
    this.ctx.font = `${this.config.fontSize.main}px Arial, sans-serif`;
    this.ctx.fillStyle = "#9ca3af";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "図解・グラフエリア",
      area.x + area.width / 2,
      area.y + area.height / 2
    );
  }

  // 指導ポイント描画
  private drawTeachingPoints(points: string[], y: number): number {
    if (points.length === 0) return y;

    let currentY = y;

    // 背景ボックス
    const boxHeight =
      points.length * (this.config.fontSize.small + this.config.spacing.line) +
      40;
    const boxWidth =
      this.config.width - this.config.padding.left - this.config.padding.right;

    this.ctx.fillStyle = "#fef3c7";
    this.ctx.fillRect(this.config.padding.left, currentY, boxWidth, boxHeight);

    this.ctx.strokeStyle = "#f59e0b";
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(
      this.config.padding.left,
      currentY,
      boxWidth,
      boxHeight
    );

    currentY += 20;

    // タイトル
    this.setFont(this.config.fontSize.sub, "bold");
    this.ctx.fillStyle = "#f59e0b";
    this.ctx.textAlign = "left";
    // 絵文字と日本語を分けて安全に描画
    this.ctx.fillText(
      "【指導ポイント】",
      this.config.padding.left + 20,
      currentY + this.config.fontSize.sub
    );
    currentY += this.config.fontSize.sub + 15;

    // ポイント
    this.setFont(this.config.fontSize.small);
    this.ctx.fillStyle = "#92400e";

    points.forEach((point) => {
      this.ctx.fillText(
        `• ${point}`,
        this.config.padding.left + 40,
        currentY + this.config.fontSize.small
      );
      currentY += this.config.fontSize.small + this.config.spacing.line;
    });

    return currentY + 20;
  }

  // 問題ボックス描画
  private drawProblemBox(problem: string, y: number): number {
    const boxHeight = 100;
    const boxWidth =
      this.config.width - this.config.padding.left - this.config.padding.right;

    this.ctx.fillStyle = "#eff6ff";
    this.ctx.fillRect(this.config.padding.left, y, boxWidth, boxHeight);

    this.ctx.strokeStyle = this.config.accentColor;
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(this.config.padding.left, y, boxWidth, boxHeight);

    // 問題テキスト
    this.ctx.font = `${this.config.fontSize.main}px Arial, sans-serif`;
    this.ctx.fillStyle = this.config.textColor;
    this.ctx.textAlign = "left";

    const wrappedText = this.wrapText(problem, boxWidth - 40);
    wrappedText.forEach((line, index) => {
      this.ctx.fillText(
        line,
        this.config.padding.left + 20,
        y + 30 + index * this.config.spacing.line
      );
    });

    return y + boxHeight;
  }

  // ステップバイステップ解法描画
  private drawStepByStepSolution(steps: string[], y: number): number {
    let currentY = y;

    steps.forEach((step, index) => {
      // ステップ番号
      const stepNumber = index + 1;
      const circleRadius = 20;
      const circleX = this.config.padding.left + circleRadius;
      const circleY = currentY + circleRadius;

      this.ctx.fillStyle = this.config.accentColor;
      this.ctx.beginPath();
      this.ctx.arc(circleX, circleY, circleRadius, 0, 2 * Math.PI);
      this.ctx.fill();

      this.setFont(this.config.fontSize.small, "bold");
      this.ctx.fillStyle = "#ffffff";
      this.ctx.textAlign = "center";
      this.ctx.fillText(stepNumber.toString(), circleX, circleY + 6);

      // ステップ内容
      this.setFont(this.config.fontSize.main);
      this.ctx.fillStyle = this.config.textColor;
      this.ctx.textAlign = "left";

      const textX = circleX + circleRadius + 20;
      const wrappedText = this.wrapText(
        step,
        this.config.width - textX - this.config.padding.right
      );

      wrappedText.forEach((line, lineIndex) => {
        this.ctx.fillText(
          line,
          textX,
          currentY + 30 + lineIndex * this.config.spacing.line
        );
      });

      currentY += Math.max(
        50,
        wrappedText.length * this.config.spacing.line + 20
      );
    });

    return currentY;
  }

  // 答えボックス描画
  private drawAnswerBox(answer: string, y: number): number {
    const boxHeight = 60;
    const boxWidth = 400;
    const x = this.config.width - this.config.padding.right - boxWidth;

    this.ctx.fillStyle = "#dcfce7";
    this.ctx.fillRect(x, y, boxWidth, boxHeight);

    this.ctx.strokeStyle = "#059669";
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x, y, boxWidth, boxHeight);

    this.setFont(this.config.fontSize.main, "bold");
    this.ctx.fillStyle = "#059669";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      `答え: ${answer}`,
      x + boxWidth / 2,
      y + boxHeight / 2 + 8
    );

    return y + boxHeight;
  }

  // フッター描画
  private drawFooter() {
    const footerY = this.config.height - this.config.padding.bottom + 30;

    this.setFont(this.config.fontSize.small);
    this.ctx.fillStyle = "#9ca3af";
    this.ctx.textAlign = "right";

    const now = new Date();
    const dateStr = now.toLocaleDateString("ja-JP");
    this.ctx.fillText(
      `作成日: ${dateStr} | 板書ジェネレーター`,
      this.config.width - this.config.padding.right,
      footerY
    );
  }
}

// メイン生成関数
export async function generateBlackboard(
  analysis: AIAnalysisResponse,
  options: GenerationOptions,
  customConfig?: Partial<BlackboardConfig>
): Promise<Buffer> {
  const generator = new BlackboardGenerator(customConfig);
  return await generator.generateBlackboard(analysis, options);
}
