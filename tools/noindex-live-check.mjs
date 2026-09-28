// noindex-live-check.mjs - fetch every page of a deployed preview (the list comes from the local preview copy) and
// confirm the SERVED html carries exactly one robots meta and that it is noindex, nofollow. Also checks the host's
// 404 at a nested missing path. Paced: 2 workers, --delay ms between requests.
//   node tools/noindex-live-check.mjs --base https://<user>.github.io/<repo>/ [--from preview] [--delay 300]
import fs from 'node:fs';
import path from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const BASE = String(arg('base')).replace(/\/?$/, '/');
const FROM = path.resolve(arg('from', 'preview'));
const DELAY = Number(arg('delay', 300));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === '.git') continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p); else if (e.name.endsWith('.html')) pages.push(path.relative(FROM, p).split(path.sep).join('/'));
  }
})(FROM);
const urlFor = (rel) => BASE + (rel === 'index.html' ? '' : rel.replace(/(^|\/)index\.html$/, '$1'));
const bad = [];
let ok = 0, i = 0;
async function worker() {
  while (i < pages.length) {
    const rel = pages[i++];
    const u = urlFor(rel);
    let r;
    for (let t = 0; t < 4; t++) { r = await fetch(u); if (r.status !== 429) break; await sleep(2000 * (t + 1)); }
    const html = await r.text();
    const metas = html.match(/<meta\s+name="robots"[^>]*>/gi) || [];
    const good = (r.status === 200 || rel === '404.html') && metas.length === 1 && /content="noindex, nofollow"/i.test(metas[0]);
    if (good) ok++; else bad.push(`${r.status} ${u} robots=${JSON.stringify(metas)}`);
    await sleep(DELAY);
  }
}
await Promise.all([worker(), worker()]);
// the host's 404 for a missing NESTED path must be the styled page (prefixed assets), not a bare error
const miss = await fetch(BASE + 'no/such/page-' + Date.now() + '/');
const missHtml = await miss.text();
const prefix = new URL(BASE).pathname;
const styled = missHtml.includes(`href="${prefix}styles/site.css"`);
const missNoindex = /<meta\s+name="robots"\s+content="noindex, nofollow"/i.test(missHtml);
console.log('pages checked', pages.length, '| served with exactly one noindex,nofollow robots meta:', ok, '| bad:', bad.length);
for (const b of bad.slice(0, 10)) console.log('  BAD', b);
console.log('missing nested path -> status', miss.status, '| styled 404 (prefixed site.css):', styled, '| noindex:', missNoindex);
process.exit(bad.length || miss.status !== 404 || !styled || !missNoindex ? 1 : 0);
