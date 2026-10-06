// Chọn màu key có khoảng cách nhỏ nhất tới pixel thật là lớn nhất.
// Việc này tránh trường hợp màu key magenta bị gif.js gộp vào màu đỏ/hồng.
export function chooseGifTransparencyKey(frames) {
  const candidates = [
    0x00FF00, // lime
    0x00FFFF, // cyan
    0xFF00FF, // magenta
    0x0000FF, // blue
    0xFFFF00, // yellow
    0xFF8000, // orange
  ];
  let bestKey = candidates[0];
  let bestMinDistance = -1;

  for (const key of candidates) {
    const kr = (key >> 16) & 255;
    const kg = (key >> 8) & 255;
    const kb = key & 255;
    let minDistance = Infinity;

    for (const frame of frames) {
      const data = frame.imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        const dr = data[i] - kr;
        const dg = data[i + 1] - kg;
        const db = data[i + 2] - kb;
        const distance = dr * dr + dg * dg + db * db;
        if (distance < minDistance) minDistance = distance;
        if (minDistance === 0) break;
      }
      if (minDistance === 0) break;
    }

    if (minDistance > bestMinDistance) {
      bestMinDistance = minDistance;
      bestKey = key;
    }
  }

  return bestKey;
}

export function applyGifTransparencyKey(data, key) {
  const kr = (key >> 16) & 255;
  const kg = (key >> 8) & 255;
  const kb = key & 255;

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) {
      data[i] = kr;
      data[i + 1] = kg;
      data[i + 2] = kb;
    }
    data[i + 3] = 255;
  }
}
