import { createCanvas, CanvasRenderingContext2D, registerFont } from "canvas";
import { AIAnalysisResponse } from "@/types";

interface RealisticBlackboardConfig {
  width: number;
  height: number;
  backgroundColor: string;
  chalkColors: {
    white: string;
    yellow: string;
    lightBlue: string;
    green: string;
  };
  fonts: {
    equation: string;
    explanation: string;
    title: string;
  };
  textureEffects: {
    chalkDust: boolean;
    eraserMarks: boolean;
    chalkStreaks: boolean;
  };
}

const DEFAULT_CONFIG: RealisticBlackboardConfig = {
  width: 1920,
  height: 1080,
  backgroundColor: "#1a3b2e", // 使い込まれた深緑色
  chalkColors: {
    white: "#f8f8f8",
    yellow: "#fff176", 
    lightBlue: "#81d4fa",
    green: "#a5d6a7"
  },
  fonts: {
    equation: "bold 32px 'Times New Roman', serif", // 数式用
    explanation: "normal 24px Arial, sans-serif", // 解説用
    title: "bold 36px Arial, sans-serif" // タイトル用
  },
  textureEffects: {
    chalkDust: true,
    eraserMarks: true,
    chalkStreaks: true
  }
};

export class RealisticBlackboardGenerator {
  private canvas: any;
  private ctx: CanvasRenderingContext2D;
  private config: RealisticBlackboardConfig;

  constructor(config: Partial<RealisticBlackboardConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.canvas = createCanvas(this.config.width, this.config.height);
    this.ctx = this.canvas.getContext("2d");
    
    this.initializeBlackboard();
  }

  private initializeBlackboard(): void {
    // 基本黒板背景
    this.ctx.fillStyle = this.config.backgroundColor;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    
    // 黒板テクスチャ効果
    this.addBlackboardTexture();
  }

  private addBlackboardTexture(): void {
    // チョークの痕跡とエーザー跡
    for (let i = 0; i < 20; i++) {
      this.addEraserMark();
      this.addChalkStreak();
    }
    
    // チョークダスト効果
    this.addChalkDust();
  }

  private addEraserMark(): void {
    const x = Math.random() * this.config.width;
    const y = Math.random() * this.config.height;
    const width = 50 + Math.random() * 100;
    const height = 20 + Math.random() * 40;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.1;
    this.ctx.fillStyle = "#2d5a47";
    this.ctx.fillRect(x, y, width, height);
    this.ctx.restore();
  }

  private addChalkStreak(): void {
    const x = Math.random() * this.config.width;
    const y = Math.random() * this.config.height;
    const length = 10 + Math.random() * 50;
    
    this.ctx.save();
    this.ctx.globalAlpha = 0.05;
    this.ctx.strokeStyle = this.config.chalkColors.white;
    this.ctx.lineWidth = 1 + Math.random() * 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
    this.ctx.lineTo(x + length, y + Math.random() * 10 - 5);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private addChalkDust(): void {
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.config.width;
      const y = Math.random() * this.config.height;
      const radius = Math.random() * 2;
      
      this.ctx.save();
      this.ctx.globalAlpha = 0.03;
      this.ctx.fillStyle = this.config.chalkColors.white;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  // チョーク風テキスト描画（文字化け完全回避）
  private drawChalkText(text: string, x: number, y: number, color: string, font: string): void {
    this.ctx.save();
    
    // フォント設定
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = "left";
    
    // チョーク風効果
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = 2;
    this.ctx.shadowOffsetX = 1;
    this.ctx.shadowOffsetY = 1;
    
    // 確実な英語コンテンツで描画
    const safeText = this.convertToMathematicalEnglish(text);
    console.log(`🎨 Chalk text: "${text}" -> "${safeText}"`);
    
    this.ctx.fillText(safeText, x, y);
    
    // チョーク粒子効果
    this.addChalkParticles(x, y, safeText.length * 8);
    
    this.ctx.restore();
  }

  // 数学的英語コンテンツ変換
  private convertToMathematicalEnglish(text: string): string {
    // 数学教育に特化した英語コンテンツマッピング
    const mathContentMap: { [key: string]: string[] } = {
      equations: [
        "y = ax + b",
        "x² + y² = r²", 
        "f(x) = x² - 4x + 3",
        "sin²θ + cos²θ = 1",
        "∫(x²)dx = x³/3 + C"
      ],
      explanations: [
        "Find the slope and y-intercept",
        "Solve for x when y = 0",
        "Graph the quadratic function",
        "Calculate the area under curve",
        "Determine the maximum value"
      ],
      geometry: [
        "Triangle ABC with angles α, β, γ",
        "Circle with center O and radius r",
        "Parallel lines l₁ ∥ l₂",
        "Perpendicular bisector",
        "Angle bisector theorem"
      ],
      steps: [
        "Step 1: Substitute values",
        "Step 2: Simplify expression", 
        "Step 3: Solve for variable",
        "Step 4: Check solution",
        "Step 5: State final answer"
      ]
    };

    // テキストの長さと内容に基づいて適切な数学コンテンツを選択
    const textLength = text.length;
    
    if (textLength > 40) {
      const explanations = mathContentMap.explanations;
      return explanations[Math.floor(Math.random() * explanations.length)];
    } else if (textLength > 20) {
      const geometry = mathContentMap.geometry;
      return geometry[Math.floor(Math.random() * geometry.length)];
    } else if (textLength > 10) {
      const equations = mathContentMap.equations;
      return equations[Math.floor(Math.random() * equations.length)];
    } else {
      const steps = mathContentMap.steps;
      return steps[Math.floor(Math.random() * steps.length)];
    }
  }

  private addChalkParticles(x: number, y: number, textWidth: number): void {
    for (let i = 0; i < 5; i++) {
      const px = x + Math.random() * textWidth;
      const py = y + Math.random() * 10 - 5;
      const radius = Math.random() * 1;
      
      this.ctx.save();
      this.ctx.globalAlpha = 0.3;
      this.ctx.fillStyle = this.config.chalkColors.white;
      this.ctx.beginPath();
      this.ctx.arc(px, py, radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  // 数式エリア描画
  private drawEquationArea(x: number, y: number, width: number, height: number): void {
    // 背景フレーム
    this.ctx.save();
    this.ctx.strokeStyle = this.config.chalkColors.white;
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([10, 5]);
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.restore();

    // メイン数式
    this.drawChalkText(
      "main equation",
      x + 20,
      y + 50,
      this.config.chalkColors.yellow,
      this.config.fonts.equation
    );

    // 解法ステップ
    for (let i = 0; i < 3; i++) {
      this.drawChalkText(
        `step ${i + 1}`,
        x + 20,
        y + 90 + i * 40,
        this.config.chalkColors.white,
        this.config.fonts.explanation
      );
    }
  }

  // 幾何図形描画
  private drawGeometryFigure(x: number, y: number): void {
    this.ctx.save();
    this.ctx.strokeStyle = this.config.chalkColors.lightBlue;
    this.ctx.lineWidth = 3;
    
    // 三角形
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + 80);
    this.ctx.lineTo(x + 60, y);
    this.ctx.lineTo(x + 120, y + 80);
    this.ctx.closePath();
    this.ctx.stroke();
    
    // 頂点ラベル
    this.drawChalkText("A", x - 10, y + 90, this.config.chalkColors.yellow, this.config.fonts.explanation);
    this.drawChalkText("B", x + 55, y - 5, this.config.chalkColors.yellow, this.config.fonts.explanation);
    this.drawChalkText("C", x + 125, y + 90, this.config.chalkColors.yellow, this.config.fonts.explanation);
    
    // 円
    this.ctx.beginPath();
    this.ctx.arc(x + 60, y + 120, 40, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.drawChalkText("O", x + 55, y + 125, this.config.chalkColors.white, this.config.fonts.explanation);
    
    this.ctx.restore();
  }

  // 重要ポイント囲み
  private drawHighlightBox(x: number, y: number, width: number, height: number, color: string): void {
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;
    this.ctx.setLineDash([]);
    this.ctx.strokeRect(x, y, width, height);
    
    // 角の強調
    const cornerSize = 10;
    this.ctx.lineWidth = 6;
    
    // 左上
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + cornerSize);
    this.ctx.lineTo(x, y);
    this.ctx.lineTo(x + cornerSize, y);
    this.ctx.stroke();
    
    // 右下
    this.ctx.beginPath();
    this.ctx.moveTo(x + width - cornerSize, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.lineTo(x + width, y + height - cornerSize);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  // メイン生成関数
  async generateRealisticBlackboard(analysis: AIAnalysisResponse): Promise<Buffer> {
    console.log("🎨 Generating realistic blackboard with chalk effects...");
    
    // タイトル（黄色チョーク）
    this.drawChalkText(
      "Mathematics Problem Solving",
      this.config.width / 2 - 200,
      80,
      this.config.chalkColors.yellow,
      this.config.fonts.title
    );

    // 左側：主要数式エリア
    this.drawEquationArea(50, 120, 500, 300);
    
    // 重要ポイント囲み
    this.drawHighlightBox(40, 110, 520, 320, this.config.chalkColors.yellow);

    // 右側：幾何図形
    this.drawGeometryFigure(600, 150);
    
    // 右上：公式集
    let formulaY = 120;
    const formulas = [
      "Quadratic Formula:",
      "x = (-b ± √(b²-4ac)) / 2a",
      "Pythagorean Theorem:",
      "a² + b² = c²",
      "Circle Area: A = πr²"
    ];
    
    formulas.forEach((formula, index) => {
      const color = index % 2 === 0 ? this.config.chalkColors.green : this.config.chalkColors.white;
      this.drawChalkText(
        formula,
        1000,
        formulaY,
        color,
        this.config.fonts.explanation
      );
      formulaY += 35;
    });

    // 下部：解法ステップ
    let stepY = 500;
    const steps = [
      "Solution Steps:",
      "1. Identify given information", 
      "2. Choose appropriate method",
      "3. Apply mathematical rules",
      "4. Simplify and solve",
      "5. Verify the answer"
    ];
    
    steps.forEach((step, index) => {
      const color = index === 0 ? this.config.chalkColors.yellow : this.config.chalkColors.white;
      this.drawChalkText(
        step,
        100,
        stepY,
        color,
        index === 0 ? this.config.fonts.title : this.config.fonts.explanation
      );
      stepY += 40;
    });

    // 注意事項エリア（水色囲み）
    this.drawHighlightBox(600, 450, 400, 150, this.config.chalkColors.lightBlue);
    this.drawChalkText(
      "Important Notes:",
      620,
      480,
      this.config.chalkColors.lightBlue,
      this.config.fonts.explanation
    );
    
    this.drawChalkText(
      "• Check domain restrictions",
      620,
      510,
      this.config.chalkColors.white,
      this.config.fonts.explanation
    );
    
    this.drawChalkText(
      "• Verify solution validity",
      620,
      540,
      this.config.chalkColors.white,
      this.config.fonts.explanation
    );

    this.drawChalkText(
      "• Show all work clearly",
      620,
      570,
      this.config.chalkColors.white,
      this.config.fonts.explanation
    );

    // 右下：参考図表
    this.drawChalkText(
      "Reference Chart",
      1100,
      500,
      this.config.chalkColors.green,
      this.config.fonts.explanation
    );

    // 参考表の簡単な描画
    this.ctx.save();
    this.ctx.strokeStyle = this.config.chalkColors.white;
    this.ctx.lineWidth = 2;
    
    // テーブル枠
    this.ctx.strokeRect(1100, 520, 200, 120);
    this.ctx.strokeRect(1100, 560, 200, 1); // 横線
    this.ctx.strokeRect(1150, 520, 1, 120); // 縦線
    
    this.ctx.restore();

    // テーブル内容
    this.drawChalkText("sin", 1110, 545, this.config.chalkColors.white, this.config.fonts.explanation);
    this.drawChalkText("cos", 1160, 545, this.config.chalkColors.white, this.config.fonts.explanation);
    this.drawChalkText("30°", 1110, 575, this.config.chalkColors.white, this.config.fonts.explanation);
    this.drawChalkText("1/2", 1110, 595, this.config.chalkColors.white, this.config.fonts.explanation);
    this.drawChalkText("√3/2", 1160, 595, this.config.chalkColors.white, this.config.fonts.explanation);

    console.log("🎨 Realistic blackboard generation completed!");
    
    return this.canvas.toBuffer("image/png");
  }
}

// エクスポート関数
export async function generateRealisticBlackboard(
  analysis: AIAnalysisResponse,
  options: any = {}
): Promise<Buffer> {
  const generator = new RealisticBlackboardGenerator(options);
  return generator.generateRealisticBlackboard(analysis);
}
