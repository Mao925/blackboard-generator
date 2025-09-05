const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

// サンプル板書画像を生成
function generateSampleBlackboard() {
  const width = 1920;
  const height = 1080;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // タイトル
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.fillStyle = '#2563eb';
  ctx.textAlign = 'center';
  ctx.fillText('二次関数のグラフ', width / 2, 100);

  // 下線
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 200, 120);
  ctx.lineTo(width / 2 + 200, 120);
  ctx.stroke();

  // メインコンテンツ
  ctx.font = '32px Arial, sans-serif';
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'left';

  const mainContent = [
    '1. 二次関数 y = ax² + bx + c の基本形',
    '2. 頂点の座標：(-b/2a, f(-b/2a))',
    '3. 軸の方程式：x = -b/2a'
  ];

  let y = 200;
  mainContent.forEach((content, index) => {
    ctx.fillText(content, 100, y);
    y += 60;
  });

  // 公式ボックス
  const boxY = 400;
  const boxHeight = 100;
  const boxWidth = width - 200;

  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(100, boxY, boxWidth, boxHeight);

  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 3;
  ctx.strokeRect(100, boxY, boxWidth, boxHeight);

  ctx.font = 'bold 36px Arial, sans-serif';
  ctx.fillStyle = '#2563eb';
  ctx.textAlign = 'center';
  ctx.fillText('y = a(x - p)² + q', width / 2, boxY + 65);

  // 説明エリア
  ctx.font = '28px Arial, sans-serif';
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'left';

  const explanations = [
    '• a > 0 のとき：下に凸',
    '• a < 0 のとき：上に凸',
    '• 頂点：(p, q)',
    '• |a|が大きいほど、グラフは細くなる'
  ];

  y = 550;
  explanations.forEach(explanation => {
    ctx.fillText(explanation, 150, y);
    y += 50;
  });

  // 図解エリア（プレースホルダー）
  const diagramX = width - 500;
  const diagramY = 200;
  const diagramWidth = 400;
  const diagramHeight = 300;

  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(diagramX, diagramY, diagramWidth, diagramHeight);

  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.strokeRect(diagramX, diagramY, diagramWidth, diagramHeight);

  ctx.font = '24px Arial, sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.textAlign = 'center';
  ctx.fillText('グラフ表示エリア', diagramX + diagramWidth / 2, diagramY + diagramHeight / 2);

  // 指導ポイント
  const pointsY = 800;
  const pointsHeight = 150;

  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(100, pointsY, width - 200, pointsHeight);

  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(100, pointsY, width - 200, pointsHeight);

  ctx.font = 'bold 28px Arial, sans-serif';
  ctx.fillStyle = '#f59e0b';
  ctx.textAlign = 'left';
  ctx.fillText('💡 指導ポイント', 130, pointsY + 40);

  ctx.font = '24px Arial, sans-serif';
  ctx.fillStyle = '#92400e';
  ctx.fillText('• 頂点の座標から逆算して式を求める練習を重点的に', 160, pointsY + 80);
  ctx.fillText('• グラフの形状と係数aの関係を視覚的に説明する', 160, pointsY + 110);

  // フッター
  ctx.font = '18px Arial, sans-serif';
  ctx.fillStyle = '#9ca3af';
  ctx.textAlign = 'right';
  const now = new Date();
  const dateStr = now.toLocaleDateString('ja-JP');
  ctx.fillText(`作成日: ${dateStr} | 板書ジェネレーター`, width - 60, height - 30);

  // PNG保存
  const buffer = canvas.toBuffer('image/png');
  const outputPath = path.join(__dirname, '../public/sample-generated-blackboard.png');
  fs.writeFileSync(outputPath, buffer);
  
  console.log('Sample blackboard generated:', outputPath);
}

generateSampleBlackboard();
