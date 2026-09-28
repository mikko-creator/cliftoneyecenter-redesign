// make-preview.mjs — turn dist/ into a GitHub Pages review copy.
//   node tools/make-preview.mjs [--out preview]
// The build's links are relative, so it works under https://<user>.github.io/<repo>/ as-is. This copies
// dist/ into --out (everything in --out except .git/ is replaced), marks EVERY page
// `noindex, nofollow` (the preview must never compete with the live site in search), adds .nojekyll
// (Pages would otherwise run Jekyll over the files), and fails if any root-absolute reference is left -
// under a Pages subpath those 404. The preview is derived: re-run this after every rebuild.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const DIST = path.join(ROOT, 'dist');
const OUT = path.resolve(ROOT, arg('out', 'preview'));
if (OUT === ROOT || OUT === DIST || DIST.startsWith(OUT + path.sep) || OUT.startsWith(DIST + path.sep)) throw new Error('--out must not be the project, dist/ or contain/sit inside dist/: ' + OUT);
if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('no dist/index.html - run node src/build.mjs first');

fs.mkdirSync(OUT, { recursive: true });
for (const e of fs.readdirSync(OUT)) if (e !== '.git') fs.rmSync(path.join(OUT, e), { recursive: true, force: true });

const ROBOTS = '<meta name="robots" content="noindex, nofollow">';
const BAD = /\b(?:href|src|action|poster|srcset|data-[a-z-]+)\s*=\s*"\/(?!\/)[^"]*"|url\(\s*['"]?\/(?!\/)/gi;
let files = 0, pages = 0, replaced = 0, inserted = 0;
const bad = [];
(function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name), b = path.join(to, e.name);
    if (e.isDirectory()) { copy(a, b); continue; }
    files++;
    if (/\.html?$/i.test(e.name)) {
      pages++;
      let html = fs.readFileSync(a, 'utf8');
      if (/<meta\s+name="robots"[^>]*>/i.test(html)) { html = html.replace(/<meta\s+name="robots"[^>]*>/gi, ROBOTS); replaced++; }
      else { html = html.replace(/<head([^>]*)>/i, '<head$1>' + ROBOTS); inserted++; }
      for (const m of html.match(BAD) || []) bad.push(path.relative(DIST, a) + ': ' + m.slice(0, 80));
      fs.writeFileSync(b, html);
    } else {
      if (/\.(css|js)$/i.test(e.name)) for (const m of fs.readFileSync(a, 'utf8').match(BAD) || []) bad.push(path.relative(DIST, a) + ': ' + m.slice(0, 80));
      fs.copyFileSync(a, b);
    }
  }
})(DIST, OUT);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
const noindex = (function count(dir) { let n = 0; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { if (e.name === '.git') continue; const p = path.join(dir, e.name); if (e.isDirectory()) n += count(p); else if (/\.html?$/i.test(e.name) && fs.readFileSync(p, 'utf8').includes(ROBOTS)) n++; } return n; })(OUT);
console.log('preview        ', OUT);
console.log('files          ', files, '| pages', pages, '| noindex', noindex, '(replaced', replaced, '/ inserted', inserted + ')');
console.log('root-absolute  ', bad.length);
if (bad.length) { for (const b of bad.slice(0, 20)) console.log('   ', b); process.exit(1); }
if (noindex !== pages) { console.log('NOT every page carries noindex'); process.exit(1); }
