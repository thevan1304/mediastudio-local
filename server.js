const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());

// Hỗ trợ Cross-Origin headers cho WebAssembly và SharedArrayBuffer
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  next();
});

// Production server for the Vite build. The dev server is started by Vite.
const distPath = path.join(__dirname, 'dist');
if (!fs.existsSync(path.join(distPath, 'index.html'))) {
  console.error('  No build found. Run npm run build first.');
  process.exit(1);
}

app.use(express.static(distPath));

// Fallback tất cả route về index.html
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

function startServer(port) {
  const server = app.listen(port, () => {
    const color = process.stdout.isTTY && !process.env.NO_COLOR;
    const style = (code, value) => color ? `\x1b[${code}m${value}\x1b[0m` : value;
    const title = style('1;36', 'MediaStudio');
    const mode = style('2', 'Production');
    const url = style('1;32', `http://localhost:${port}`);

    console.log(`\n  ${title}  ${mode}`);
    console.log(`  ${style('2', '────────────────────────────────────────')}`);
    console.log(`  ${style('2', 'Local')}  ${url}`);
    console.log(`  ${style('2', 'Stop')}   Ctrl + C\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`  Port ${port} is in use. Trying ${nextPort}...`);
      startServer(nextPort);
    } else {
      console.error('Failed to start server:', err);
    }
  });
}

startServer(PORT);
