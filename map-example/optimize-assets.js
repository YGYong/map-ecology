import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const ASSETS_DIR = path.resolve(__dirname, 'src/assets');
const MAX_WIDTH = 1920; // 限制最大宽度
const QUALITY = 75; // 压缩质量

// 统计
let successCount = 0;
let failCount = 0;
let savedBytes = 0;

async function processDirectory(directory) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      await processDirectory(filePath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        await compressImage(filePath, ext, stats.size);
      }
    }
  }
}

async function compressImage(filePath, ext, originalSize) {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // 如果图片已经很小，跳过
    if (originalSize < 200 * 1024) { // 小于 200KB 跳过
        console.log(`Skipping small image: ${path.basename(filePath)} (${(originalSize / 1024).toFixed(2)} KB)`);
        return;
    }

    let pipeline = image;

    // 调整尺寸
    if (metadata.width > MAX_WIDTH) {
      pipeline = pipeline.resize(MAX_WIDTH);
    }

    // 压缩
    let buffer;
    if (ext === '.png') {
      buffer = await pipeline.png({ quality: QUALITY, compressionLevel: 9 }).toBuffer();
    } else {
      buffer = await pipeline.jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    }

    // 如果压缩后更小，则覆盖
    if (buffer.length < originalSize) {
      fs.writeFileSync(filePath, buffer);
      const saved = originalSize - buffer.length;
      savedBytes += saved;
      successCount++;
      console.log(`✅ Optimized: ${path.basename(filePath)} | ${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);
    } else {
      console.log(`Skipping (optimization larger): ${path.basename(filePath)}`);
    }
  } catch (error) {
    failCount++;
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

console.log('🚀 Starting image optimization...');
await processDirectory(ASSETS_DIR);
console.log('-----------------------------------');
console.log(`🎉 Optimization complete!`);
console.log(`✅ Processed: ${successCount} images`);
console.log(`❌ Failed: ${failCount} images`);
console.log(`💾 Total space saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
