// logo-alpha.mjs - derive transparent versions of the practice logo from the only file the site has (a 317x221 JPEG on
// a white ground; docs/BRAND-SYSTEM.md section 2). Nothing is redrawn: every pixel keeps one of the logo's two measured
// inks (grey #727170 eye + wordmark, green #90c04c "e" + "EYE CENTER") and only its OPACITY is computed, from how far the
// pixel sits between white and that ink - so anti-aliased edges stay smooth and the white ground becomes transparent.
//   node tools/logo-alpha.mjs
// Writes assets/brand/logo-clifton.png (original inks, for light surfaces) and assets/brand/logo-clifton-light.png
// (grey ink -> paper white, green unchanged: the reversed lockup for dark surfaces), both trimmed to the ink box.
// PROOF: the dark-ink version composited back over white is compared with the original JPEG pixel by pixel.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'assets/source/666ec49d-clifton_eye_center_medium-e1478229278850.jpg');
const OUT = path.join(ROOT, 'assets/brand');
const W = 317, H = 221;
const GREY = [0x72, 0x71, 0x70], GREEN = [0x90, 0xc0, 0x4c], PAPER = [0xf6, 0xf8, 0xf1];
const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], { maxBuffer: 1 << 24 });
if (raw.length !== W * H * 3) throw new Error('unexpected decode size ' + raw.length);

const alpha = new Float64Array(W * H), isGreen = new Uint8Array(W * H);
for (let p = 0; p < W * H; p++) {
  const r = raw[p * 3], g = raw[p * 3 + 1], b = raw[p * 3 + 2];
  // Model the pixel as white mixed with ONE ink: p = a*ink + (1-a)*255. For each ink the least-squares coverage is
  // a = (d.e)/(e.e) with d = 255 - p and e = 255 - ink; keep the ink whose fit leaves the smaller residual. (A plain
  // chroma threshold mislabelled the light anti-aliased edges of the green letters as grey: a grey fringe, max error 71.)
  const d = [255 - r, 255 - g, 255 - b];
  const fit = (ink) => {
    const e = [255 - ink[0], 255 - ink[1], 255 - ink[2]];
    const a = Math.max(0, Math.min(1, (d[0] * e[0] + d[1] * e[1] + d[2] * e[2]) / (e[0] * e[0] + e[1] * e[1] + e[2] * e[2])));
    return { a, res: Math.hypot(d[0] - a * e[0], d[1] - a * e[1], d[2] - a * e[2]) };
  };
  const fg = fit(GREEN), fk = fit(GREY);
  const green = fg.res < fk.res;
  isGreen[p] = green ? 1 : 0;
  const a = green ? fg.a : fk.a;
  alpha[p] = a < 0.035 ? 0 : a;                        // JPEG ringing on the white ground (<= 3.5% ink) is ground
}
// ink bounding box (BRAND-SYSTEM measured x 16-303, y 16-207) re-measured from the alpha, then 2px transparent margin
// SHAPE-LEVEL CLASSIFICATION (replaces the per-pixel choice above for the light variant): the JPEG stores colour at
// half resolution (4:2:0), so thin green strokes carry washed-out, nearly grey pixels that a per-pixel test turned
// into white slivers inside "EYE CENTER" and specks inside the "e". Each connected ink shape (letter, eye stroke, the
// "e", a dash) is classified ONCE from its alpha-weighted mean greenness, g - (r + b) / 2, of the recovered colours
// (grey ink ~0, "EYE CENTER" green ~82, the "e" ~120), and every anti-aliased edge pixel takes the class of the
// nearest shape pixel.
const CORE = 0.3;
const label = new Int32Array(W * H).fill(-1);
const comps = [];
const recov = (q, c) => (raw[q * 3 + c] - (1 - alpha[q]) * 255) / alpha[q];
for (let s = 0; s < W * H; s++) {
  if (alpha[s] < CORE || label[s] !== -1) continue;
  const id = comps.length, stack = [s];
  label[s] = id;
  let n = 0, wsum = 0, chroma = 0, strong = 0, neutral = 0, bx0 = W, by0 = H, bx1 = 0, by1 = 0;
  while (stack.length) {
    const q = stack.pop(), qx = q % W, qy = (q / W) | 0, a = alpha[q];
    const gch = recov(q, 1) - (recov(q, 0) + recov(q, 2)) / 2;
    chroma += a * gch; wsum += a; n++;
    if (gch > 40) strong++; else if (gch < 12) neutral++;
    bx0 = Math.min(bx0, qx); by0 = Math.min(by0, qy); bx1 = Math.max(bx1, qx); by1 = Math.max(by1, qy);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = qx + dx, ny = qy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const nq = ny * W + nx;
      if (alpha[nq] >= CORE && label[nq] === -1) { label[nq] = id; stack.push(nq); }
    }
  }
  comps.push({ id, n, chroma: chroma / wsum, strong, neutral, bbox: [bx0, by0, bx1, by1] });
}
const compGreen = comps.map((c) => c.chroma > 30);
const cls = new Int8Array(W * H).fill(-1);
const queue = [];
for (let p = 0; p < W * H; p++) if (label[p] >= 0) { cls[p] = compGreen[label[p]] ? 1 : 0; queue.push(p); }
for (let h = 0; h < queue.length; h++) {
  const q = queue[h], qx = q % W, qy = (q / W) | 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = qx + dx, ny = qy + dy;
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
    const nq = ny * W + nx;
    if (alpha[nq] > 0 && cls[nq] === -1) { cls[nq] = cls[q]; queue.push(nq); }
  }
}
for (let p = 0; p < W * H; p++) isGreen[p] = cls[p] === 1 ? 1 : 0;
const big = comps.filter((c) => c.n >= 40).sort((a, b) => a.bbox[1] - b.bbox[1] || a.bbox[0] - b.bbox[0]);
console.log('shapes', comps.length, '(>= 40 px:', big.length + ') | green shapes', big.filter((c) => compGreen[c.id]).length);
for (const c of big) console.log('  shape', String(c.n).padStart(5), 'px bbox', c.bbox.join(','), 'mean g-(r+b)/2', c.chroma.toFixed(0).padStart(4), compGreen[c.id] ? 'GREEN' : 'grey ', '| strong-green', (100 * c.strong / c.n).toFixed(0) + '%', 'neutral', (100 * c.neutral / c.n).toFixed(0) + '%');

let x0 = W, y0 = H, x1 = -1, y1 = -1;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (alpha[y * W + x] > 0.2) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
x0 = Math.max(0, x0 - 2); y0 = Math.max(0, y0 - 2); x1 = Math.min(W - 1, x1 + 2); y1 = Math.min(H - 1, y1 + 2);
const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

// Colour per pixel: the pixel's OWN colour with the white it was blended with removed, c = (p - (1-a)*255) / a, so a
// fully inked pixel keeps its exact JPEG colour (the "e" is a more saturated green than "EYE CENTER": one mean ink
// flattened it, max error 71) and every pixel composited back over white reproduces the original. greyInk (the light
// variant) replaces only pixels classified grey; greens always keep their own colour.
function write(name, greyInk) {
  const buf = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const p = (y + y0) * W + (x + x0), o = (y * cw + x) * 4, a = alpha[p];
    let col = [0, 0, 0];
    if (a > 0) col = [0, 1, 2].map((c) => Math.max(0, Math.min(255, Math.round((raw[p * 3 + c] - (1 - a) * 255) / a))));
    if (greyInk && !isGreen[p]) col = greyInk;
    buf[o] = col[0]; buf[o + 1] = col[1]; buf[o + 2] = col[2]; buf[o + 3] = Math.round(a * 255);
  }
  const file = path.join(OUT, name);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', cw + 'x' + ch, '-i', '-', '-frames:v', '1', file], { input: buf });
  return { file, buf };
}
fs.mkdirSync(OUT, { recursive: true });
const dark = write('logo-clifton.png', null);
write('logo-clifton-light.png', PAPER);

// proof: dark version over white vs the original JPEG, over the cropped area
let sum = 0, max = 0, over8 = 0, n = 0;
for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
  const p = (y + y0) * W + (x + x0), o = (y * cw + x) * 4, a = dark.buf[o + 3] / 255;
  for (let c = 0; c < 3; c++) {
    const comp = dark.buf[o + c] * a + 255 * (1 - a), d = Math.abs(comp - raw[p * 3 + c]);
    sum += d; max = Math.max(max, d); if (d > 8) over8++; n++;
  }
}
const greenPx = [...isGreen].filter(Boolean).length, inkPx = [...alpha].filter((a) => a > 0.2).length;
console.log('crop', `${x0},${y0} ${cw}x${ch}`, '| ink px', inkPx, '(green', greenPx + ')');
console.log('over-white vs original: mean abs', (sum / n).toFixed(2), '/255 | max', max.toFixed(1), '| channels > 8/255:', over8, 'of', n, `(${(100 * over8 / n).toFixed(2)}%)`);
for (const f of ['logo-clifton.png', 'logo-clifton-light.png']) console.log('wrote', 'assets/brand/' + f, fs.statSync(path.join(OUT, f)).size, 'bytes');
