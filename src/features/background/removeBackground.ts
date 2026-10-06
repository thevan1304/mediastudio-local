// ─── Background Removal Algorithm v2 ──────────────────────────────────────────
// Flood-fill từ viền ảnh với khoảng cách màu Redmean (perceptual).
// Viền được làm mượt bằng Gaussian blur thay vì box blur.
export function removeBackground(data, r0, g0, b0, tolerance, feather, w, h, seeds = []) {
  // Redmean range ≈ 9 × 255² = 585 225. Map slider (0-128) đến cùng tỉ lệ.
  const tol2 = tolerance * tolerance * 9;
  const n    = w * h;
  const mask    = new Uint8Array(n); // 255 = nền (xóa), 0 = vật thể (giữ)
  const visited = new Uint8Array(n);
  const queue   = [];

  // ── Flood-fill từ 4 viền ảnh ──────────────────────────────────────────────
  function tryEnqueue(x, y) {
    const idx = y * w + x;
    if (visited[idx]) return;
    visited[idx] = 1;
    const b = idx * 4;
    if (data[b + 3] < 10 || colorDistance2(data[b], data[b + 1], data[b + 2], r0, g0, b0) <= tol2)
      queue.push(idx);
  }

  for (let x = 0; x < w; x++) { tryEnqueue(x, 0); tryEnqueue(x, h - 1); }
  for (let y = 1; y < h - 1; y++) { tryEnqueue(0, y); tryEnqueue(w - 1, y); }

  // BFS 8 hướng
  while (queue.length) {
    const idx = queue.pop();
    mask[idx] = 255;
    const x = idx % w, y = (idx / w) | 0;
    if (x > 0)         tryEnqueue(x - 1, y);
    if (x < w - 1)     tryEnqueue(x + 1, y);
    if (y > 0)         tryEnqueue(x, y - 1);
    if (y < h - 1)     tryEnqueue(x, y + 1);
    if (x > 0     && y > 0)     tryEnqueue(x - 1, y - 1);
    if (x < w - 1 && y > 0)     tryEnqueue(x + 1, y - 1);
    if (x > 0     && y < h - 1) tryEnqueue(x - 1, y + 1);
    if (x < w - 1 && y < h - 1) tryEnqueue(x + 1, y + 1);
  }

  // ── Seed thủ công (click xóa vùng nền kẹt) ────────────────────────────────
  for (const p of seeds) {
    if (p.x < 0 || p.x >= w || p.y < 0 || p.y >= h) continue;
    const [sr, sg, sb] = p.color;
    const qM = [], vM = new Uint8Array(n);

    const enqM = (x, y) => {
      const idx = y * w + x;
      if (vM[idx] || mask[idx] === 255) return;
      vM[idx] = 1;
      const b = idx * 4;
      if (data[b + 3] < 10 || colorDistance2(data[b], data[b + 1], data[b + 2], sr, sg, sb) <= tol2)
        qM.push(idx);
    };

    enqM(p.x, p.y);
    while (qM.length) {
      const idx = qM.pop();
      mask[idx] = 255;
      const x = idx % w, y = (idx / w) | 0;
      if (x > 0)         enqM(x - 1, y);
      if (x < w - 1)     enqM(x + 1, y);
      if (y > 0)         enqM(x, y - 1);
      if (y < h - 1)     enqM(x, y + 1);
      if (x > 0     && y > 0)     enqM(x - 1, y - 1);
      if (x < w - 1 && y > 0)     enqM(x + 1, y - 1);
      if (x > 0     && y < h - 1) enqM(x - 1, y + 1);
      if (x < w - 1 && y < h - 1) enqM(x + 1, y + 1);
    }
  }

  // ── Áp mask với Gaussian smooth edges ─────────────────────────────────────
  // feather = 0  → sigma 0.5 (chỉ anti-alias sub-pixel, không xóa mất viền)
  // feather > 0  → sigma = feather (viền mềm tùy chỉnh)
  const sigma   = feather > 0 ? feather : 0.5;
  const blurred = gaussianBlur(mask, w, h, sigma);
  for (let i = 0; i < n; i++) {
    data[i * 4 + 3] = Math.round(data[i * 4 + 3] * (1 - blurred[i] / 255));
  }
}


// Redmean perceptual colour distance – https://www.compuphase.com/cmetric.htm
// Range: 0 to ≈ 585 225 (vs plain RGB Euclidean 0-195 075).
// Much better at distinguishing reds, greens, blues from similar-lightness neighbours.
function colorDistance2(r1, g1, b1, r2, g2, b2) {
  const rmean = (r1 + r2) >> 1;
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return (2 + (rmean >> 8)) * dr * dr + 4 * dg * dg + (2 + ((255 - rmean) >> 8)) * db * db;
}

// Separable 2-pass Gaussian blur – produces smooth bell-curve feather
// (much better than box blur which creates rectangular, boxy edges).
function gaussianBlur(mask, w, h, sigma) {
  const radius = Math.ceil(sigma * 3);
  const ksize  = radius * 2 + 1;
  const kernel = new Float32Array(ksize);
  let ksum = 0;
  for (let i = 0; i < ksize; i++) {
    const x = i - radius;
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    ksum += kernel[i];
  }
  for (let i = 0; i < ksize; i++) kernel[i] /= ksum;

  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);

  // Horizontal pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = 0; k < ksize; k++) {
        const nx = Math.min(w - 1, Math.max(0, x + k - radius));
        v += mask[y * w + nx] * kernel[k];
      }
      tmp[y * w + x] = v;
    }
  }

  // Vertical pass
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 0;
      for (let k = 0; k < ksize; k++) {
        const ny = Math.min(h - 1, Math.max(0, y + k - radius));
        v += tmp[ny * w + x] * kernel[k];
      }
      out[y * w + x] = v;
    }
  }
  return out;
}
