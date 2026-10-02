// Generates icons/icon{16,48,128}.png (no deps). Vector reference: icons/icon.svg
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

// Design on a 128 grid: brand-gradient rounded square, a translucent back window and a
// white front "floating" window with a gradient play triangle. 4x4 supersampling for AA.
const C1 = [102, 126, 234];
const C2 = [118, 75, 162];
const SS = 4;

const inRRect = (x, y, rx, ry, w, h, r) => {
  const dx = Math.max(rx + r - x, 0, x - (rx + w - r));
  const dy = Math.max(ry + r - y, 0, y - (ry + h - r));
  return x >= rx && x <= rx + w && y >= ry && y <= ry + h && dx * dx + dy * dy <= r * r;
};

const inTriangle = (x, y) => {
  const pts = [[70, 66], [70, 100], [98, 83]];
  const sign = (a, b) => (x - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (y - b[1]);
  const d = [sign(pts[0], pts[1]), sign(pts[1], pts[2]), sign(pts[2], pts[0])];
  return !(d.some((v) => v < 0) && d.some((v) => v > 0));
};

// returns [r, g, b, a] (0-1 alpha) for a point on the 128 grid
function shade(x, y) {
  if (!inRRect(x, y, 4, 4, 120, 120, 28)) return [0, 0, 0, 0];
  const t = (x + y) / 256;
  const bg = C1.map((c, i) => c + (C2[i] - c) * t);
  if (inTriangle(x, y) && inRRect(x, y, 52, 48, 64, 62, 10)) return [...bg, 1];
  if (inRRect(x, y, 52, 48, 64, 62, 10)) return [255, 255, 255, 1];
  if (inRRect(x, y, 14, 18, 64, 62, 10) && !inRRect(x, y, 18, 22, 56, 54, 7)) return [255, 255, 255, 0.55];
  return [...bg, 1];
}

function render(size) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  const scale = 128 / size;
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const [pr, pg, pb, pa] = shade((x + (sx + 0.5) / SS) * scale, (y + (sy + 0.5) / SS) * scale);
          r += pr * pa; g += pg * pa; b += pb * pa; a += pa;
        }
      }
      const o = y * (size * 4 + 1) + 1 + x * 4;
      const n = SS * SS;
      raw[o] = a ? Math.round(r / a) : 0;
      raw[o + 1] = a ? Math.round(g / a) : 0;
      raw[o + 2] = a ? Math.round(b / a) : 0;
      raw[o + 3] = Math.round((a / n) * 255);
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
