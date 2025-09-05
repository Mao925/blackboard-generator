import puppeteer from "puppeteer";

export interface HtmlToImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "png" | "jpeg";
}

export async function convertHtmlToImage(
  html: string,
  options: HtmlToImageOptions = {}
): Promise<Buffer> {
  const {
    width = 1920,
    height = 1080,
    quality = 100,
    format = "png",
  } = options;

  console.log("🎨 Starting HTML to image conversion...");

  let browser;

  try {
    // Puppeteer起動（本番環境では軽量化オプション）
    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-extensions",
      ],
    });

    const page = await browser.newPage();

    // ビューポート設定
    await page.setViewport({
      width,
      height,
      deviceScaleFactor: 2, // 高解像度対応
    });

    // HTMLコンテンツ設定
    await page.setContent(html, {
      waitUntil: ["networkidle0", "load"],
    });

    // Google Fontsの読み込み完了を待つ
    await page.evaluateHandle("document.fonts.ready");

    // 追加で少し待機（フォント完全読み込み保証）
    await page.waitForTimeout(2000);

    console.log("📸 Taking screenshot...");

    // スクリーンショット撮影
    const imageBuffer = await page.screenshot({
      type: format,
      quality: format === "jpeg" ? quality : undefined,
      fullPage: false, // ビューポートサイズに合わせる
      encoding: "binary",
    });

    console.log("✅ HTML to image conversion completed!");

    return Buffer.from(imageBuffer);
  } catch (error) {
    console.error("❌ HTML to image conversion failed:", error);
    throw new Error(`HTML画像変換エラー: ${error}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// バッチ変換（複数HTML→画像）
export async function convertMultipleHtmlToImages(
  htmlContents: string[],
  options: HtmlToImageOptions = {}
): Promise<Buffer[]> {
  console.log(
    `🎨 Converting ${htmlContents.length} HTML contents to images...`
  );

  const results: Buffer[] = [];

  for (let i = 0; i < htmlContents.length; i++) {
    console.log(`📸 Converting ${i + 1}/${htmlContents.length}...`);
    const imageBuffer = await convertHtmlToImage(htmlContents[i], options);
    results.push(imageBuffer);
  }

  console.log("✅ All HTML to image conversions completed!");
  return results;
}

// プリセット変換関数
export async function convertBlackboardHtmlToImage(
  html: string
): Promise<Buffer> {
  return convertHtmlToImage(html, {
    width: 1920,
    height: 1080,
    quality: 100,
    format: "png",
  });
}
