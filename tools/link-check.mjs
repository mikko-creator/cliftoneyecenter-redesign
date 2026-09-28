// link-check.mjs — every LOCAL reference in the built site resolves to a file.
// Walks $CEC_DIST (default dist/): every href / src / srcset / poster / action value in each .html
// file, every url(...) and @import in each .css file. External schemes (http:, https:, mailto:,
// tel:, data:, javascript:) are skipped and counted. A local reference is resolved against the
// referring file's directory (page-relative URLs are the contract: the site must work from any
// directory or subpath), its ?query and #fragment are dropped, and the target must be an existing
// file (a directory resolves to its index.html). Root-absolute references ("/x") are findings on
// their own: they break a subpath deploy.
// Same-page fragments (href="#id") must name an element id on that page.
// Positive controls: a planted missing file, a planted root-absolute href and a planted dead
// fragment must each be reported; the run exits 1 if any control does not fire.
//   node tools/link-check.mjs  -> audit/link-check.json (exit 1 on any broken reference)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.resolve(process.env.CEC_DIST || path.join(ROOT, 'dist'));
const EXTERNAL = /^(https?:|mailto:|tel:|data:|javascript:|about:|blob:)/i;

function listFiles(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listFiles(p, base, out); else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}
const decodeAttr = (s) => String(s).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

function refsOfHtml(html) {
  const out = [];
  const body = html.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (m) => m.replace(/>[\s\S]*<\/script>$/i, '></script>'));
  for (const m of body.matchAll(/\s(href|src|poster|action|data-src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) out.push({ attr: m[1].toLowerCase(), value: decodeAttr(m[2] !== undefined ? m[2] : m[3]) });
  for (const m of body.matchAll(/\s(srcset|imagesrcset)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    for (const part of decodeAttr(m[2] !== undefined ? m[2] : m[3]).split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) out.push({ attr: m[1].toLowerCase(), value: u }); }
  }
  for (const m of body.matchAll(/style\s*=\s*"([^"]*)"/gi)) for (const u of m[1].matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) out.push({ attr: 'style-url', value: decodeAttr(u[1]) });
  return out;
}
function refsOfCss(css) {
  const out = [];
  const c = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const m of c.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) out.push({ attr: 'css-url', value: m[1].trim() });
  for (const m of c.matchAll(/@import\s+['"]([^'"]+)['"]/gi)) out.push({ attr: 'css-import', value: m[1].trim() });
  return out;
}
const idsOf = (html) => new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/gi)].map((m) => m[1]));

function checkFile(rel, text, exists) {
  const problems = [];
  let local = 0, external = 0;
  const isHtml = /\.html?$/i.test(rel);
  const refs = isHtml ? refsOfHtml(text) : refsOfCss(text);
  const ids = isHtml ? idsOf(text) : null;
  for (const r of refs) {
    const v = r.value.trim();
    if (!v) { if (r.attr === 'href' || r.attr === 'src') problems.push({ kind: 'empty', attr: r.attr, value: v }); continue; }
    if (EXTERNAL.test(v)) { external++; continue; }
    if (/^\/\//.test(v)) { external++; continue; }
    if (v.startsWith('#')) {
      if (isHtml && r.attr === 'href' && v.length > 1 && !ids.has(decodeURIComponent(v.slice(1)))) problems.push({ kind: 'dead-fragment', attr: r.attr, value: v });
      continue;
    }
    local++;
    if (v.startsWith('/')) { problems.push({ kind: 'root-absolute', attr: r.attr, value: v }); continue; }
    const clean = decodeURIComponent(v.split('#')[0].split('?')[0]);
    if (!clean) continue;
    const target = path.posix.normalize(path.posix.join(path.posix.dirname(rel), clean));
    if (target.startsWith('..')) { problems.push({ kind: 'escapes-root', attr: r.attr, value: v }); continue; }
    const candidates = clean.endsWith('/') ? [target.replace(/\/?$/, '/index.html')] : [target, target + '/index.html'];
    if (!candidates.some((c) => exists(c))) problems.push({ kind: 'missing', attr: r.attr, value: v, resolved: target });
  }
  return { problems, local, external };
}

const files = listFiles(DIST);
const fileSet = new Set(files);
const exists = (p) => fileSet.has(p.replace(/^\.\//, ''));
let local = 0, external = 0, checked = 0;
const broken = [];
for (const rel of files) {
  if (!/\.(html?|css)$/i.test(rel)) continue;
  checked++;
  const r = checkFile(rel, fs.readFileSync(path.join(DIST, rel), 'utf8'), exists);
  local += r.local; external += r.external;
  for (const p of r.problems) broken.push({ file: rel, ...p });
}

/* positive controls, in memory */
const ctlHtml = '<a href="nope/index.html">x</a><a href="/abs/">y</a><a href="#missing-id">z</a><img src="img/nothing.webp" alt="">';
const ctl = checkFile('ctl/index.html', ctlHtml, exists).problems;
const fired = ctl.some((p) => p.kind === 'missing' && p.value === 'nope/index.html') && ctl.some((p) => p.kind === 'root-absolute') && ctl.some((p) => p.kind === 'dead-fragment') && ctl.some((p) => p.kind === 'missing' && p.attr === 'src');

const byKind = broken.reduce((a, b) => { a[b.kind] = (a[b.kind] || 0) + 1; return a; }, {});
const out = { schema: 'cec/link-check@1', generated: new Date().toISOString(), dist: DIST, filesChecked: checked, localRefs: local, externalRefsSkipped: external, broken: broken.length, byKind, control: { planted: ctlHtml, reported: ctl, fired }, findings: broken.slice(0, 2000) };
if (!process.env.CEC_DIST) fs.writeFileSync(path.join(ROOT, 'audit/link-check.json'), JSON.stringify(out, null, 1));
console.log('files', checked, '· local refs', local, '· external skipped', external, '· broken', broken.length, JSON.stringify(byKind), '· control', fired ? 'fired' : 'DID NOT FIRE');
for (const b of broken.slice(0, 15)) console.log('  ' + b.file + '  ' + b.kind + ' ' + b.attr + '=' + b.value);
if (broken.length || !fired) process.exit(1);
