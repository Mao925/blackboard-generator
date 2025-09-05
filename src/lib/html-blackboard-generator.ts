import { AIAnalysisResponse } from "@/types";

interface HTMLBlackboardConfig {
  width: number;
  height: number;
  backgroundColor: string;
  chalkColors: {
    white: string;
    yellow: string;
    lightBlue: string;
    green: string;
  };
}

const DEFAULT_CONFIG: HTMLBlackboardConfig = {
  width: 1920,
  height: 1080,
  backgroundColor: "#1a3b2e", // 深緑色の黒板
  chalkColors: {
    white: "#f8f8f8",
    yellow: "#fff176",
    lightBlue: "#81d4fa",
    green: "#a5d6a7",
  },
};

export async function generateHTMLBlackboard(
  aiAnalysis: AIAnalysisResponse,
  options: any = {}
): Promise<string> {
  const config = { ...DEFAULT_CONFIG, ...options };

  console.log("🎨 Generating HTML blackboard template...");

  const htmlTemplate = `
  <!DOCTYPE html>
  <html lang="ja">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>学習塾の黒板</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Kalam:wght@400;700&display=swap');
      
      body, html {
        margin: 0;
        padding: 0;
        width: ${config.width}px;
        height: ${config.height}px;
        background: linear-gradient(145deg, #1a3b2e 0%, #0f2922 50%, #1a3b2e 100%);
        font-family: 'Noto Sans JP', sans-serif;
        color: ${config.chalkColors.white};
        overflow: hidden;
        position: relative;
      }
      
      /* チョーク質感のテクスチャ */
      .blackboard {
        width: 100%;
        height: 100%;
        position: relative;
        background-image: 
          radial-gradient(circle at 20% 30%, rgba(255,255,255,0.03) 1px, transparent 1px),
          radial-gradient(circle at 80% 70%, rgba(255,255,255,0.02) 1px, transparent 1px),
          radial-gradient(circle at 40% 80%, rgba(255,255,255,0.025) 1px, transparent 1px);
        background-size: 50px 50px, 75px 75px, 100px 100px;
      }
      
      /* 消しムラ効果 */
      .blackboard::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: 
          linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.01) 41%, rgba(255,255,255,0.01) 42%, transparent 43%),
          linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.015) 41%, rgba(255,255,255,0.015) 42%, transparent 43%);
        background-size: 80px 80px, 120px 120px;
      }
      
      .content {
        position: relative;
        z-index: 2;
        padding: 60px;
        height: calc(100% - 120px);
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto 1fr auto;
        gap: 40px;
      }
      
      .title {
        grid-column: 1 / -1;
        text-align: center;
        font-size: 48px;
        font-weight: 900;
        color: ${config.chalkColors.yellow};
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        font-family: 'Kalam', 'Noto Sans JP', cursive;
        margin-bottom: 30px;
        transform: rotate(-0.5deg);
      }
      
      .section {
        background: rgba(255,255,255,0.02);
        border-radius: 15px;
        padding: 30px;
        border: 3px solid ${config.chalkColors.white};
        position: relative;
      }
      
      .section-title {
        font-size: 32px;
        font-weight: 700;
        color: ${config.chalkColors.lightBlue};
        margin-bottom: 25px;
        text-decoration: underline;
        text-decoration-color: ${config.chalkColors.yellow};
        font-family: 'Kalam', 'Noto Sans JP', cursive;
      }
      
      .math-equation {
        font-size: 36px;
        color: ${config.chalkColors.yellow};
        text-align: center;
        margin: 20px 0;
        font-family: 'Times New Roman', serif;
        font-weight: bold;
        background: rgba(255,255,255,0.05);
        padding: 15px;
        border-radius: 10px;
        border: 2px dashed ${config.chalkColors.lightBlue};
      }
      
      .step {
        font-size: 24px;
        margin: 15px 0;
        padding-left: 20px;
        position: relative;
      }
      
      .step::before {
        content: "✓";
        position: absolute;
        left: 0;
        color: ${config.chalkColors.green};
        font-weight: bold;
      }
      
      .highlight {
        background: rgba(255, 241, 118, 0.15);
        padding: 2px 8px;
        border-radius: 5px;
        color: ${config.chalkColors.yellow};
        font-weight: bold;
      }
      
      .diagram-area {
        grid-column: 1 / -1;
        height: 200px;
        border: 3px dashed ${config.chalkColors.white};
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255,255,255,0.02);
        position: relative;
      }
      
      .diagram-placeholder {
        font-size: 28px;
        color: ${config.chalkColors.lightBlue};
        font-family: 'Kalam', cursive;
      }
      
      /* 手書き風図形 */
      .geometry {
        position: absolute;
        right: 100px;
        top: 50%;
        transform: translateY(-50%);
      }
      
      .triangle {
        width: 0;
        height: 0;
        border-left: 60px solid transparent;
        border-right: 60px solid transparent;
        border-bottom: 100px solid ${config.chalkColors.lightBlue};
        opacity: 0.7;
        position: relative;
      }
      
      .circle-diagram {
        width: 120px;
        height: 120px;
        border: 4px solid ${config.chalkColors.green};
        border-radius: 50%;
        position: absolute;
        top: -150px;
        left: -30px;
        opacity: 0.6;
      }
      
      /* チョーク飛び散り効果 */
      .chalk-dust {
        position: absolute;
        width: 2px;
        height: 2px;
        background: rgba(255,255,255,0.3);
        border-radius: 50%;
      }
      
      .dust-1 { top: 20%; left: 15%; }
      .dust-2 { top: 60%; left: 85%; }
      .dust-3 { top: 30%; left: 70%; }
      .dust-4 { top: 80%; left: 25%; }
      .dust-5 { top: 45%; left: 90%; }
    </style>
  </head>
  <body>
    <div class="blackboard">
      <!-- チョーク飛び散り -->
      <div class="chalk-dust dust-1"></div>
      <div class="chalk-dust dust-2"></div>
      <div class="chalk-dust dust-3"></div>
      <div class="chalk-dust dust-4"></div>
      <div class="chalk-dust dust-5"></div>
      
      <div class="content">
        <div class="title">
          数学の授業 - ${aiAnalysis.title || "二次方程式の解法"}
        </div>
        
        <div class="section">
          <div class="section-title">📚 学習のポイント</div>
          <div class="step">基本概念の理解を深める</div>
          <div class="step">具体例を通して<span class="highlight">実践的な解法</span>を学ぶ</div>
          <div class="step">生徒の理解度を確認しながら進める</div>
          <div class="step">重要な公式を<span class="highlight">確実に覚える</span></div>
        </div>
        
        <div class="section">
          <div class="section-title">🔍 問題解決のステップ</div>
          <div class="math-equation">x² + 3x - 4 = 0</div>
          <div class="step">与えられた条件を整理する</div>
          <div class="step">適切な<span class="highlight">解法を選択</span>する</div>
          <div class="step">計算を正確に行う</div>
          <div class="step">答えを<span class="highlight">検証</span>する</div>
          
          <!-- 手書き風図形 -->
          <div class="geometry">
            <div class="circle-diagram"></div>
            <div class="triangle"></div>
          </div>
        </div>
        
        <div class="diagram-area">
          <div class="diagram-placeholder">
            📐 グラフ・図解エリア 📊
          </div>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  console.log("✅ HTML blackboard template generated successfully!");
  return htmlTemplate;
}
