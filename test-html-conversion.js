const { convertHtmlToImage } = require("./src/lib/html-to-image.ts");

const simpleHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            margin: 0;
            padding: 40px;
            background: #1a3b2e;
            color: white;
            font-family: 'Arial', sans-serif;
            font-size: 24px;
        }
        .title {
            font-size: 48px;
            text-align: center;
            color: #fff176;
            margin-bottom: 40px;
        }
        .content {
            background: rgba(255,255,255,0.1);
            padding: 30px;
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="title">数学の授業</div>
    <div class="content">
        <h2>📚 学習のポイント</h2>
        <p>基本概念の理解を深める</p>
        <p>具体例を通して実践的な解法を学ぶ</p>
        <p>生徒の理解度を確認しながら進める</p>
        
        <h2>🔍 問題解決のステップ</h2>
        <p>与えられた条件を整理する</p>
        <p>適切な解法を選択する</p>
        <p>計算を正確に行う</p>
        <p>答えを検証する</p>
    </div>
</body>
</html>
`;

async function test() {
  try {
    console.log("🧪 HTML→PNG変換テスト開始...");
    const imageBuffer = await convertHtmlToImage(simpleHtml);
    console.log("✅ 変換成功! 画像サイズ:", imageBuffer.length, "bytes");

    // ファイルに保存
    require("fs").writeFileSync("test-output.png", imageBuffer);
    console.log("📁 test-output.pngに保存しました");
  } catch (error) {
    console.error("❌ 変換失敗:", error);
  }
}

test();
