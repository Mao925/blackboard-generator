'use client';

import React from 'react';

interface SVGBlackboardProps {
  title: string;
  mainContent: string;
  sections: Array<{
    title: string;
    content: string[];
  }>;
  teachingPoints: string[];
}

export function SVGBlackboard({ 
  title, 
  mainContent, 
  sections, 
  teachingPoints 
}: SVGBlackboardProps) {
  
  const downloadSVG = () => {
    const svgElement = document.getElementById('blackboard-svg');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `blackboard-${Date.now()}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const downloadPNG = () => {
    const svgElement = document.getElementById('blackboard-svg');
    if (!svgElement) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 1920;
    canvas.height = 1080;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `blackboard-${Date.now()}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      });
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* ダウンロードボタン */}
      <div className="mb-4 flex gap-4">
        <button
          onClick={downloadSVG}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          SVGダウンロード
        </button>
        <button
          onClick={downloadPNG}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          PNGダウンロード
        </button>
      </div>

      {/* SVG黒板 */}
      <svg
        id="blackboard-svg"
        width="100%"
        height="auto"
        viewBox="0 0 1920 1080"
        xmlns="http://www.w3.org/2000/svg"
        className="border border-gray-300 shadow-lg"
      >
        <defs>
          <style>
            {`
              @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
              
              .blackboard-bg {
                fill: #1a3b2e;
              }
              
              .title-text {
                font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif;
                font-size: 48px;
                font-weight: 900;
                fill: #fff176;
                text-anchor: middle;
              }
              
              .section-title {
                font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
                font-size: 32px;
                font-weight: 700;
                fill: #81d4fa;
              }
              
              .content-text {
                font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
                font-size: 24px;
                font-weight: 400;
                fill: white;
              }
              
              .bullet-text {
                font-family: 'Noto Sans JP', 'Hiragino Sans', sans-serif;
                font-size: 20px;
                fill: #f8f8f8;
              }
              
              .section-box {
                fill: rgba(255,255,255,0.05);
                stroke: white;
                stroke-width: 2;
                rx: 10;
              }
            `}
          </style>
        </defs>

        {/* 背景 */}
        <rect width="1920" height="1080" className="blackboard-bg" />
        
        {/* チョーク質感のテクスチャ */}
        <circle cx="200" cy="150" r="1" fill="rgba(255,255,255,0.1)" />
        <circle cx="1700" cy="200" r="1" fill="rgba(255,255,255,0.08)" />
        <circle cx="300" cy="800" r="1" fill="rgba(255,255,255,0.12)" />
        <circle cx="1600" cy="900" r="1" fill="rgba(255,255,255,0.09)" />

        {/* タイトル */}
        <text x="960" y="100" className="title-text">
          {title}
        </text>

        {/* セクション1 */}
        <rect x="80" y="180" width="800" height="360" className="section-box" />
        <text x="100" y="220" className="section-title">
          {sections[0]?.title || "学習のポイント"}
        </text>
        {sections[0]?.content?.map((item, index) => (
          <text key={index} x="120" y={260 + index * 35} className="bullet-text">
            • {item}
          </text>
        ))}

        {/* セクション2 */}
        <rect x="1040" y="180" width="800" height="360" className="section-box" />
        <text x="1060" y="220" className="section-title">
          {sections[1]?.title || "解法のステップ"}
        </text>
        {sections[1]?.content?.map((item, index) => (
          <text key={index} x="1080" y={260 + index * 35} className="bullet-text">
            {index + 1}. {item}
          </text>
        ))}

        {/* 指導ポイント */}
        <rect x="80" y="600" width="1760" height="400" className="section-box" />
        <text x="100" y="640" className="section-title">
          📚 指導ポイント
        </text>
        {teachingPoints?.map((point, index) => (
          <text key={index} x="120" y={680 + index * 40} className="content-text">
            ✓ {point}
          </text>
        ))}

        {/* 装飾的な数式 */}
        <text x="1500" y="500" className="content-text" fill="#a5d6a7">
          y = ax + b
        </text>
        <text x="200" y="500" className="content-text" fill="#fff176">
          a² + b² = c²
        </text>
      </svg>
    </div>
  );
}
