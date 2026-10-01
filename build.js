const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

console.log('📦 Bắt đầu build dự án GIF Background Remover & Video Studio...');

// 1. Dọn dẹp thư mục dist cũ nếu tồn tại
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Danh sách các file tĩnh cốt lõi cần copy
const filesToCopy = [
  'index.html',
  'app.js',
  'style.css',
  'gif.js',
  'README.md'
];

for (const file of filesToCopy) {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`  ✓ Đã đóng gói: ${file}`);
  }
}

// 3. Đóng gói thư mục ffmpeg (WebAssembly core & scripts)
const ffmpegSrc = path.join(__dirname, 'ffmpeg');
const ffmpegDest = path.join(distDir, 'ffmpeg');
if (fs.existsSync(ffmpegSrc)) {
  fs.cpSync(ffmpegSrc, ffmpegDest, { recursive: true });
  console.log(`  ✓ Đã đóng gói thư mục: ffmpeg/ (WebAssembly Core & Workers)`);
}

console.log('\n✅ Build hoàn tất thành công!');
console.log(`📁 Thư mục xuất bản: ${distDir}\n`);
