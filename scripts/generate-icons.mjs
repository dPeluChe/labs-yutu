// Generates icons/icon{16,48,128}.png (no deps): purple rounded square with a white "play" triangle.
import { deflateSync } from 'zlib';
import { mkdir, writeFile } from 'fs/promises';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'icons');

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const body = Buffer.concat([Buffer.from(type), data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
};

function render(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const r = size * 0.22;
  const inTriangle = (x, y) => {
    const ax = size * 0.38, ay = size * 0.28, bx = size * 0.38, by = size * 0.72, cx = size * 0.74, cy = size * 0.5;
    const d = (px, py, qx, qy) => (x - qx) * (py - qy) - (px - qx) * (y - qy);
    const d1 = d(ax, ay, bx, by), d2 = d(bx, by, cx, cy), d3 = d(cx, cy, ax, ay);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };
  const inRounded = (x, y) => {
    const dx = Math.max(r - x, 0, x - (size - r)), dy = Math.max(r - y, 0, y - (size - r));
    return dx * dx + dy * dy <= r * r;
  };
  for (let y = 0; y < size; y++) {
    const row = y * (size * 4 + 1);
    for (let x = 0; x < size; x++) {
      const px = x + 0.5, py = y + 0.5;
      const o = row + 1 + x * 4;
      if (!inRounded(px, py)) continue;
      const [rr, g, b] = inTriangle(px, py) ? [255, 255, 255] : [99, 102, 241];
      raw[o] = rr; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

await mkdir(outDir, { recursive: true });
for (const size of [16, 48, 128]) {
  await writeFile(resolve(outDir, `icon${size}.png`), render(size));
}
console.log('Icons generated');
