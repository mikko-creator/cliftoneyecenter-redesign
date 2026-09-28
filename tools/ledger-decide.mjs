// ledger-decide.mjs — one change-control decision per source section, named by the component that
// rebuilt it. Every row goes through the skill's own CLIs: decision / slot / why via `sr-plan --set`,
// preset via `sr-match --answer` (validated against the preset index by the CLI itself).
// The rule that decided each row, and every matcher pick the answers override, are written to
// audit/ledger-rules.json.   node tools/ledger-decide.mjs [--dry] [--presets-only]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILL = path.join(os.homedir(), '.claude', 'skills', 'site-reforge', 'scripts');
const DRY = process.argv.includes('--dry');
const PRESETS_ONLY = process.argv.includes('--presets-only');
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/change-control.json'), 'utf8'));
const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/preset-index.json'), 'utf8'));
const known = new Set(index.libraries.flatMap((l) => (l.presets || []).map((p) => p.id)));

const P = {
  heroDepth: '00-top12-12-ambient-depth-behind-the-hero-glow-blobs-duotone-wash',
  floating: '01-transitions-hero-motion-11-your-product-floating',
  parallax: '01-transitions-hero-motion-20-parallax',
  frosted: '04-signatures-tokens-16-frosted-panel',
  team: '10-sections-8-team-gallery',
  proof: '10-sections-5-proof',
  split: 'feature-split',
  cardGrid: 'card-grid',
  cardLift: '00-top12-3-soft-large-blur-ink-tinted-card-shadow-lift-on-hover',
  cardsFloat: '11-theming-2-cards-float-on-surface',
  form: '10-sections-11-forms-lead-gen',
  footer: '10-sections-10-footers',
  utility: '13-utility-pages-1-sgen-living-styleguide-13-utility-system-pages-404-500-no-results-maintenance-loading-1',
};
for (const [k, v] of Object.entries(P)) if (!known.has(v)) throw new Error('preset not in index: ' + k + ' = ' + v);

const STRIP = /^Located in the same building as Wayback Burgers/;
const NOINDEX = /\/(slideshow|template|tag|category|author)\/|\/404-page-not-found#/;
const home = (r) => r.pageType === 'home';
const RULES = [
  // ---- homepage: matched by row index + label (labels come from the source's own headings)
  { id: 'home-hero', test: (r) => home(r) && r.index === 1, decision: 'IMPROVE', slot: 'value-proposition', preset: P.heroDepth, why: 'Homepage article rebuilt as a night stage with ambient light pools, lens rings and a scroll-drawn eye-arc: H1 on a glass panel, the source hero photos in lens and circle frames at different depths, a fal cut-out of eyeglasses breaking the frame, the first real review as a floating glass note, and the source CTA badges as an overlapping glass dock. Copy verbatim.' },
  { id: 'home-doctor', test: (r) => home(r) && r.index === 2, decision: 'IMPROVE', slot: 'trust-positioning', preset: P.team, why: 'Doctor block rebuilt as an arched portrait (the real photo, 480x640) with a ghost frame and a reading-glasses cut-out breaking its edge, bio on a glass card. Copy verbatim.' },
  { id: 'home-reviews', test: (r) => home(r) && r.index === 3, decision: 'IMPROVE', slot: 'social-proof', preset: P.proof, why: 'The 7 real patient reviews from the source carousel rebuilt as a stacked 3D glass deck with prev/next, swipe and a pausable auto-advance. Every comment, name and star rating verbatim; the frozen relative times ("3 weeks ago") are a declared removal.' },
  { id: 'home-doctor-name', test: (r) => home(r) && r.index === 4, decision: 'IMPROVE', slot: 'trust-positioning', preset: P.split, why: 'Name heading and bio kept inside the doctor split (portrait | glass bio card).' },
  { id: 'home-repeat', test: (r) => home(r) && [5, 6, 9].includes(r.index), decision: 'REMOVE', slot: '', preset: P.frosted, why: 'Verbatim repeat: the source homepage prints the doctor block and the family-exams block twice (widget + content). Rendered once; every word still appears on the page (parity scores it as repetition).' },
  { id: 'home-shop', test: (r) => home(r) && r.index === 7, decision: 'IMPROVE', slot: 'benefits-solution', preset: P.cardGrid, why: 'Designer optical shop rebuilt as staggered glass brand tiles at different parallax depths over a faint frames-shelf field, with a tortoiseshell cut-out. The four real brand images and captions kept.' },
  { id: 'home-family', test: (r) => home(r) && r.index === 8, decision: 'IMPROVE', slot: 'benefits-solution', preset: P.parallax, why: 'Family eye exams rebuilt as a parallax photo band (the source image) with a dark glass card and a kids-eyeglasses cut-out crossing its edge. Copy and link verbatim.' },
  { id: 'home-emergency', test: (r) => home(r) && r.index === 10, decision: 'IMPROVE', slot: 'objection-handling', preset: P.cardsFloat, why: 'Eye emergencies rebuilt as an alert glass card with a red edge; the Red Cross emblem (legally protected) replaced by an authored alert glyph. Copy and links verbatim.' },
  // ---- chrome on every page
  { id: 'sidebar-nap', test: (r) => /^Eye Source [–-] Carey Brooks, OD$/.test(r.label), decision: 'IMPROVE', slot: 'footer', preset: P.footer, why: 'The sidebar NAP widget is rebuilt as the footer contact block (address, phone, fax, email, socials, hours) plus the sticky aside cards on every interior page. Every value from the source.' },
  // ---- page types
  { id: 'noindex-artifact', test: (r) => NOINDEX.test(r.id), decision: 'PRESERVE', slot: '', preset: P.frosted, why: 'WordPress artifact with zero inbound links (empty archive, slideshow stub, raw template, 404 body): kept at the same URL for parity, marked noindex,follow and left out of sitemap.xml.' },
  { id: 'forms', test: (r) => /\/contact-us\//.test(r.url + '/') && r.index === 1, decision: 'IMPROVE', slot: 'strategic-cta', preset: P.form, why: 'Form page rebuilt with the form re-created from the labels, options and required markers the source printed, in a glass card; stamped data-needs-backend (no backend in a static build) and honest about it on submit.' },
  { id: 'doctor-page', test: (r) => /\/(our-eye-doctor|team\/)/.test(r.url), decision: 'IMPROVE', slot: 'trust-positioning', preset: P.split, why: 'Doctor page rebuilt under the night hero with the portrait in an arched frame. Copy verbatim.' },
  { id: 'testimonial', test: (r) => /\/testimonial\//.test(r.url), decision: 'IMPROVE', slot: 'social-proof', preset: P.proof, why: 'Real patient testimonial page kept (orphaned at source, still real content), rebuilt as a glass quote sheet.' },
  { id: 'page-article', test: (r) => r.index === 1, decision: 'IMPROVE', slot: 'benefits-solution', preset: P.frosted, why: 'Page content rebuilt as frosted glass sheets under a night hero carrying a topic scene and a fal cut-out that breaks the hero edge; large photos break out of their sheet. Copy verbatim.' },
  { id: 'article-section', test: (r) => r.pageType === 'article' || r.pageType === 'blog-index', decision: 'IMPROVE', slot: 'benefits-solution', preset: P.frosted, why: 'Article section rebuilt as a glass sheet with display headings, framed figures and scroll reveals. Copy verbatim.' },
  { id: 'default', test: () => true, decision: 'IMPROVE', slot: 'benefits-solution', preset: P.cardLift, why: 'Section rebuilt as a glass sheet in the page body; copy verbatim.' },
];

const plan = ledger.rows.map((r) => { const rule = RULES.find((x) => x.test(r)); return { id: r.id, rule: rule.id, decision: rule.decision, slot: rule.slot, preset: rule.preset, why: rule.why }; });
const tally = {}; for (const p of plan) tally[p.rule] = (tally[p.rule] || 0) + 1;
const rulesFile = path.join(ROOT, 'audit/ledger-rules.json');
fs.writeFileSync(rulesFile, JSON.stringify({ schema: 'fes/ledger-rules@1', presets: P, rules: RULES.map(({ test, ...r }) => r), tally, plan }, null, 1));
console.log('rows', plan.length, JSON.stringify(tally));
if (DRY) process.exit(0);

let n = 0;
if (!PRESETS_ONLY) for (const p of plan) {
  const argv = [path.join(SKILL, 'sr-plan.mjs'), '--project', ROOT, '--set', p.id, '--decision', p.decision, '--why', p.why];
  if (p.slot) argv.push('--slot', p.slot);
  execFileSync(process.execPath, argv, { stdio: 'pipe' });
  if (++n % 200 === 0) console.log('  decisions set', n);
}

/* presets through sr-match --answer in batches under the Windows command-line limit. sr-match exits 1
   while any row is still undecided, so every batch but the last exits 1 BY DESIGN: a batch is accepted
   only when its own stdout confirms every answer and reports the remaining count; the LAST must exit 0. */
const baseline = JSON.parse(fs.readFileSync(path.join(ROOT, 'audit/preset-match.matcher-verdict.json'), 'utf8'));
const matcherPick = new Map((baseline.rows || []).filter((r) => r.status === 'MATCHED').map((r) => [r.rowId, r.chosen || (r.candidates && r.candidates[0] && r.candidates[0].presetId)]));
const batches = []; let cur = [], len = 0;
for (const p of plan) { const s = p.id + '=' + p.preset; if (len + s.length > 20000) { batches.push(cur); cur = []; len = 0; } cur.push(s); len += s.length + 12; }
if (cur.length) batches.push(cur);
let done = 0, remaining = null;
batches.forEach((b, i) => {
  const r = spawnSync(process.execPath, [path.join(SKILL, 'sr-match.mjs'), '--project', ROOT, ...b.flatMap((x) => ['--answer', x])], { encoding: 'utf8' });
  const ok = (r.stdout.match(/^\s*answered /gm) || []).length;
  const m = r.stdout.match(/remaining undecided: (\d+)/);
  if (ok !== b.length || !m) throw new Error('sr-match batch ' + (i + 1) + ': ' + ok + '/' + b.length + ' answered · ' + (r.stderr || r.stdout).slice(-600));
  remaining = Number(m[1]);
  const last = i === batches.length - 1;
  if (last ? r.status !== 0 : r.status > 1) throw new Error('sr-match batch ' + (i + 1) + ' exit ' + r.status + ' with ' + remaining + ' undecided');
  done += ok;
});
const overridden = plan.filter((p) => matcherPick.has(p.id) && matcherPick.get(p.id) !== p.preset).map((p) => ({ id: p.id, matcher: matcherPick.get(p.id), answered: p.preset }));
const rules = JSON.parse(fs.readFileSync(rulesFile, 'utf8'));
rules.matcherOverrides = { note: 'Rows the layout matcher had MATCHED on its own whose preset was replaced by the one the redesign actually built with (matcher verdict kept in audit/preset-match.matcher-verdict.json).', count: overridden.length, rows: overridden };
fs.writeFileSync(rulesFile, JSON.stringify(rules, null, 1));
console.log('decisions set', n, '· presets answered', done, 'in', batches.length, 'batches · undecided now', remaining, '· matcher picks overridden', overridden.length);
process.exit(0);
