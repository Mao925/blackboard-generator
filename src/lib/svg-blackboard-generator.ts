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
  width: 1200,
  height: 800,
  backgroundColor: "#f8fafc",
  textColor: "#1f2937",
  accentColor: "#3b82f6",
  borderColor: "#e5e7eb",
  fontSize: {
    title: 32,
    main: 20,
    sub: 16,
    small: 14,
  },
  padding: {
    top: 60,
    right: 60,
    bottom: 60,
    left: 60,
  },
  spacing: {
    section: 40,
    line: 28,
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
};

class SVGBlackboardGenerator {
  private config: BlackboardConfig;
  private svgElements: string[] = [];

  constructor(config: Partial<BlackboardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // メイン生成関数
  async generateBlackboard(
    analysis: AIAnalysisResponse,
    options: GenerationOptions
  ): Promise<Buffer> {
    try {
      // カラースキーム適用
      this.applyColorScheme(options.colorScheme);

      // フォントサイズ調整
      this.adjustFontSizes(options.textSize);

      // SVG開始
      this.initializeSVG();

      // レイアウトに応じた描画
      await this.renderLayout(analysis, options);

      // SVG終了
      const svgString = this.finalizeSVG();

      // SVGをPNGに変換
      return await this.convertSVGToPNG(svgString);
    } catch (error) {
      console.error("SVG Blackboard generation error:", error);
      throw new Error("板書生成に失敗しました");
    }
  }

  // カラースキーム適用
  private applyColorScheme(colorScheme: ColorScheme) {
    const colors = COLOR_SCHEMES[colorScheme];
    this.config.backgroundColor = colors.background;
    this.config.textColor = colors.text;
    this.config.accentColor = colors.accent;
    this.config.borderColor = colors.border;
  }

  // フォントサイズ調整
  private adjustFontSizes(textSize: TextSize) {
    const multipliers = {
      small: 0.8,
      medium: 1.0,
      large: 1.2,
    };

    const multiplier = multipliers[textSize];
    this.config.fontSize.title *= multiplier;
    this.config.fontSize.main *= multiplier;
    this.config.fontSize.sub *= multiplier;
    this.config.fontSize.small *= multiplier;
  }

  // SVG初期化
  private initializeSVG() {
    this.svgElements = [];
    this.svgElements.push(`
      <svg width="${this.config.width}" height="${this.config.height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <style>
            .title-text { font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif; font-weight: bold; font-size: ${this.config.fontSize.title}px; fill: ${this.config.accentColor}; }
            .main-text { font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif; font-weight: normal; font-size: ${this.config.fontSize.main}px; fill: ${this.config.textColor}; }
            .sub-text { font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif; font-weight: bold; font-size: ${this.config.fontSize.sub}px; fill: ${this.config.accentColor}; }
            .small-text { font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif; font-weight: normal; font-size: ${this.config.fontSize.small}px; fill: #92400e; }
            .accent-box { fill: #fef3c7; stroke: #f59e0b; stroke-width: 2; }
            .answer-box { fill: #dcfce7; stroke: #059669; stroke-width: 3; }
          </style>
        </defs>
        <rect width="${this.config.width}" height="${this.config.height}" fill="${this.config.backgroundColor}"/>
    `);
  }

  // レイアウト描画
  private async renderLayout(analysis: AIAnalysisResponse, options: GenerationOptions) {
    let currentY = this.config.padding.top;

    // タイトル描画
    currentY = this.drawTitle(analysis.title, currentY);
    currentY += this.config.spacing.section;

    // レイアウトタイプに応じた描画
    switch (options.layoutType) {
      case "problem_solving":
        currentY = this.renderProblemSolvingLayout(analysis, currentY);
        break;
      case "formula_explanation":
        currentY = this.renderFormulaExplanationLayout(analysis, currentY);
        break;
      case "step_by_step":
        currentY = this.renderStepByStepLayout(analysis, currentY);
        break;
      default:
        currentY = this.renderDefaultLayout(analysis, currentY);
    }

    // フッター描画
    this.drawFooter();
  }

  // タイトル描画
  private drawTitle(title: string, y: number): number {
    const x = this.config.width / 2;
    this.svgElements.push(`
      <text x="${x}" y="${y + this.config.fontSize.title}" text-anchor="middle" class="title-text">
        ${this.escapeXML(title)}
      </text>
      <line x1="${x - 150}" y1="${y + this.config.fontSize.title + 10}" x2="${x + 150}" y2="${y + this.config.fontSize.title + 10}" stroke="${this.config.accentColor}" stroke-width="4"/>
    `);
    return y + this.config.fontSize.title + 30;
  }

  // デフォルトレイアウト
  private renderDefaultLayout(analysis: AIAnalysisResponse, startY: number): number {
    let currentY = startY;

    // メインコンテンツ
    currentY = this.drawSection("重要ポイント", analysis.mainContent, this.config.padding.left, currentY);
    currentY += this.config.spacing.section;

    // サブコンテンツ
    currentY = this.drawSection("詳細・補足", analysis.subContent, this.config.padding.left, currentY);
    currentY += this.config.spacing.section;

    // 指導ポイント
    currentY = this.drawTeachingPoints(analysis.teachingPoints, currentY);

    return currentY;
  }

  // 問題解法型レイアウト
  private renderProblemSolvingLayout(analysis: AIAnalysisResponse, startY: number): number {
    let currentY = startY;
    const leftColumn = this.config.padding.left;
    const rightColumn = this.config.width / 2 + 20;
    const columnWidth = this.config.width / 2 - this.config.padding.right - 20;

    // 左側：問題・公式
    currentY = this.drawSection("問題・ポイント", analysis.mainContent, leftColumn, currentY, columnWidth);

    // 右側：解法・説明
    this.drawSection("解法・説明", analysis.subContent, rightColumn, startY, columnWidth);

    // 下部：指導ポイント
    currentY += this.config.spacing.section;
    currentY = this.drawTeachingPoints(analysis.teachingPoints, currentY);

    return currentY;
  }

  // 公式説明型レイアウト
  private renderFormulaExplanationLayout(analysis: AIAnalysisResponse, startY: number): number {
    let currentY = startY;

    // 公式エリア（中央配置）
    currentY = this.drawFormulaBox(analysis.mainContent[0] || "", currentY);
    currentY += this.config.spacing.section;

    // 説明エリア
    currentY = this.drawSection("公式の説明", analysis.subContent, this.config.padding.left, currentY);
    currentY += this.config.spacing.section;

    // 指導ポイント
    currentY = this.drawTeachingPoints(analysis.teachingPoints, currentY);

    return currentY;
  }

  // ステップバイステップレイアウト
  private renderStepByStepLayout(analysis: AIAnalysisResponse, startY: number): number {
    let currentY = startY;

    // 手順描画
    currentY = this.drawSteps(analysis.mainContent, currentY);
    currentY += this.config.spacing.section;

    // 答え
    if (analysis.subContent.length > 0) {
      currentY = this.drawAnswerBox(analysis.subContent[0], currentY);
    }

    return currentY;
  }

  // セクション描画
  private drawSection(title: string, content: string[], x: number, y: number, maxWidth?: number): number {
    let currentY = y;

    // セクションタイトル
    this.svgElements.push(`
      <text x="${x}" y="${currentY + this.config.fontSize.sub}" class="sub-text">
        ${this.escapeXML(title)}
      </text>
    `);
    currentY += this.config.fontSize.sub + 20;

    // コンテンツ
    content.forEach((item, index) => {
      const wrappedLines = this.wrapText(item, maxWidth || 600);
      wrappedLines.forEach((line, lineIndex) => {
        this.svgElements.push(`
          <text x="${x + 20}" y="${currentY + this.config.fontSize.main}" class="main-text">
            ${lineIndex === 0 ? `${index + 1}. ` : '    '}${this.escapeXML(line)}
          </text>
        `);
        currentY += this.config.spacing.line;
      });
    });

    return currentY;
  }

  // 指導ポイント描画
  private drawTeachingPoints(points: string[], y: number): number {
    if (points.length === 0) return y;

    let currentY = y;
    const boxHeight = points.length * this.config.spacing.line + 60;
    const boxWidth = this.config.width - this.config.padding.left - this.config.padding.right;

    // 背景ボックス
    this.svgElements.push(`
      <rect x="${this.config.padding.left}" y="${currentY}" width="${boxWidth}" height="${boxHeight}" class="accent-box"/>
    `);

    currentY += 30;

    // タイトル
    this.svgElements.push(`
      <text x="${this.config.padding.left + 20}" y="${currentY}" class="sub-text">
        💡 指導ポイント
      </text>
    `);
    currentY += this.config.fontSize.sub + 15;

    // ポイント
    points.forEach((point) => {
      this.svgElements.push(`
        <text x="${this.config.padding.left + 40}" y="${currentY}" class="small-text">
          • ${this.escapeXML(point)}
        </text>
      `);
      currentY += this.config.spacing.line;
    });

    return currentY + 20;
  }

  // 公式ボックス描画
  private drawFormulaBox(formula: string, y: number): number {
    const boxHeight = 80;
    const boxWidth = 600;
    const x = (this.config.width - boxWidth) / 2;

    this.svgElements.push(`
      <rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" fill="#e0f2fe" stroke="#0891b2" stroke-width="3"/>
      <text x="${x + boxWidth / 2}" y="${y + boxHeight / 2 + 8}" text-anchor="middle" class="title-text">
        ${this.escapeXML(formula)}
      </text>
    `);

    return y + boxHeight + 20;
  }

  // ステップ描画
  private drawSteps(steps: string[], y: number): number {
    let currentY = y;

    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      const circleRadius = 20;
      const circleX = this.config.padding.left + circleRadius;
      const circleY = currentY + circleRadius;

      // ステップ番号の円
      this.svgElements.push(`
        <circle cx="${circleX}" cy="${circleY}" r="${circleRadius}" fill="${this.config.accentColor}"/>
        <text x="${circleX}" y="${circleY + 6}" text-anchor="middle" fill="white" font-size="${this.config.fontSize.small}" font-weight="bold">
          ${stepNumber}
        </text>
      `);

      // ステップ内容
      const textX = circleX + circleRadius + 20;
      const wrappedText = this.wrapText(step, this.config.width - textX - this.config.padding.right);

      wrappedText.forEach((line, lineIndex) => {
        this.svgElements.push(`
          <text x="${textX}" y="${currentY + 30 + lineIndex * this.config.spacing.line}" class="main-text">
            ${this.escapeXML(line)}
          </text>
        `);
      });

      currentY += Math.max(50, wrappedText.length * this.config.spacing.line + 20);
    });

    return currentY;
  }

  // 答えボックス描画
  private drawAnswerBox(answer: string, y: number): number {
    const boxHeight = 60;
    const boxWidth = 400;
    const x = this.config.width - this.config.padding.right - boxWidth;

    this.svgElements.push(`
      <rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" class="answer-box"/>
      <text x="${x + boxWidth / 2}" y="${y + boxHeight / 2 + 8}" text-anchor="middle" class="main-text" font-weight="bold">
        答え: ${this.escapeXML(answer)}
      </text>
    `);

    return y + boxHeight;
  }

  // フッター描画
  private drawFooter() {
    const footerY = this.config.height - this.config.padding.bottom + 30;
    const now = new Date();
    const dateStr = now.toLocaleDateString("ja-JP");

    this.svgElements.push(`
      <text x="${this.config.width - this.config.padding.right}" y="${footerY}" text-anchor="end" class="small-text" fill="#9ca3af">
        作成日: ${dateStr} | 板書ジェネレーター
      </text>
    `);
  }

  // テキストラップ
  private wrapText(text: string, maxWidth: number): string[] {
    // 簡易的な実装 - より正確にはSVG text要素のサイズを計算
    const charactersPerLine = Math.floor(maxWidth / (this.config.fontSize.main * 0.6));
    const lines: string[] = [];
    let currentLine = "";
    
    for (let i = 0; i < text.length; i++) {
      currentLine += text[i];
      if (currentLine.length >= charactersPerLine || text[i] === '\n') {
        lines.push(currentLine.trim());
        currentLine = "";
      }
    }
    
    if (currentLine.trim()) {
      lines.push(currentLine.trim());
    }
    
    return lines;
  }

  // XML エスケープ
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  // SVG終了
  private finalizeSVG(): string {
    this.svgElements.push("</svg>");
    return this.svgElements.join("");
  }

  // SVGをPNGに変換
  private async convertSVGToPNG(svgString: string): Promise<Buffer> {
    // シンプルな実装：SVGをBase64エンコードしてからCanvasで変換
    const { createCanvas, loadImage } = await import("canvas");
    
    // SVGをData URLに変換
    const svgDataUrl = `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`;
    
    // Canvasに描画
    const canvas = createCanvas(this.config.width, this.config.height);
    const ctx = canvas.getContext("2d");
    
    try {
      const img = await loadImage(svgDataUrl);
      ctx.drawImage(img, 0, 0);
      return canvas.toBuffer("image/png");
    } catch (error) {
      console.error("SVG to PNG conversion failed:", error);
      // フォールバック: シンプルなPNG生成
      ctx.fillStyle = this.config.backgroundColor;
      ctx.fillRect(0, 0, this.config.width, this.config.height);
      ctx.fillStyle = this.config.textColor;
      ctx.font = `${this.config.fontSize.title}px Arial`;
      ctx.fillText("板書生成中...", 100, 100);
      return canvas.toBuffer("image/png");
    }
  }
}

// メイン生成関数
export async function generateSVGBlackboard(
  analysis: AIAnalysisResponse,
  options: GenerationOptions,
  customConfig?: Partial<BlackboardConfig>
): Promise<Buffer> {
  const generator = new SVGBlackboardGenerator(customConfig);
  return await generator.generateBlackboard(analysis, options);
}
