const ZIP_CRC_TABLE = Uint32Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let i = 0; i < 8; i++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function zipCrc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = ZIP_CRC_TABLE[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export function makeZip(entries) {
  const encoder = new TextEncoder();
  const parts = [], central = [];
  let offset = 0, centralSize = 0;
  for (const entry of entries) {
    const name = encoder.encode(entry.name);
    const data = entry.data;
    const crc = zipCrc32(data);
    const local = new Uint8Array(30 + name.length);
    const l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true);
    l.setUint16(6, 0x800, true); l.setUint32(14, crc, true);
    l.setUint32(18, data.length, true); l.setUint32(22, data.length, true);
    l.setUint16(26, name.length, true); local.set(name, 30);
    parts.push(local, data);
    const dir = new Uint8Array(46 + name.length);
    const d = new DataView(dir.buffer);
    d.setUint32(0, 0x02014b50, true); d.setUint16(4, 20, true); d.setUint16(6, 20, true);
    d.setUint16(8, 0x800, true); d.setUint32(16, crc, true);
    d.setUint32(20, data.length, true); d.setUint32(24, data.length, true);
    d.setUint16(28, name.length, true); d.setUint32(42, offset, true); dir.set(name, 46);
    central.push(dir); centralSize += dir.length;
    offset += local.length + data.length;
  }
  const end = new Uint8Array(22);
  const e = new DataView(end.buffer);
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, entries.length, true); e.setUint16(10, entries.length, true);
  e.setUint32(12, centralSize, true); e.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
