const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;

app.use(cors());

// Hỗ trợ Cross-Origin headers cho WebAssembly và SharedArrayBuffer
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
});

// - npm run dev: phục vụ trực tiếp từ thư mục gốc (D:\gif-bg-remover)
// - npm run start: phục vụ từ thư mục đóng gói (D:\gif-bg-remover\dist)
const distPath = path.join(__dirname, 'dist');
const rootPath = path.join(__dirname);

const isStartMode = process.argv.includes('--dist') || 
                    process.env.npm_lifecycle_event === 'start' || 
                    process.env.NODE_ENV === 'production';

let publicDir;
if (isStartMode) {
  if (!fs.existsSync(path.join(distPath, 'index.html'))) {
    console.warn('⚠️ Thư mục dist/ chưa được build. Đang tự động build...');
    require('./build.js');
  }
  publicDir = distPath;
} else {
  publicDir = rootPath;
}

console.log(`📂 Đang phục vụ static files từ: ${publicDir}`);
app.use(express.static(publicDir));

// Fallback tất cả route về index.html (tương thích Express 5)
app.use((req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n🎉 Server đang chạy thành công tại: http://localhost:${port}`);
    console.log(`   - Nhấn Ctrl + C để dừng server\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`⚠️ Cổng ${port} đang bận, tự động chuyển sang cổng ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Lỗi khởi động server:', err);
    }
  });
}

startServer(DEFAULT_PORT);
