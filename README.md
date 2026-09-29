# Clifton Eye Center — "Daylight Canopy" redesign

A platform-free rebuild and total redesign of https://www.cliftoneyecenter.com/ (site-reforge, REFORGE lane):
349 pages at their live URLs plus a 404 page, rebuilt from the live site's own content in a glass-and-depth design
on the practice's green brand.

- **Review preview:** https://mikko-creator.github.io/cliftoneyecenter-redesign/ — every page is
  `noindex, nofollow` and `robots.txt` disallows everything (its `sitemap.xml` lists only live-site URLs), so the preview does not compete
  with the live site in search. Its canonical tags point at the live site.
- **Second design, for comparison — Neoclassical ("Temple"):**
  https://mikko-creator.github.io/cliftoneyecenter-redesign/neoclassical/ — the same 349 pages and content in a
  neoclassical style (pediment and columns, busts and reliefs crossing section seams, marble grounds, serif display
  type) on the same brand colours; also `noindex, nofollow` on every page. Build it with
  `CEC_THEME=neo node src/build.mjs` into `dist-neo/` (sources `src/themes/neo/`, design and verification in
  `docs/NEO-SPEC.md` and `docs/NEO-BUILD-NOTES.md`). Building it never changes `dist/`.
- **The built site:** `dist/` (static; serve its folder at a domain root). The preview on the `gh-pages` branch is
  `dist/` with every page switched to noindex and the 404 page prefixed for the `/cliftoneyecenter-redesign/` path.
- **Everything else:** start at [`docs/README.md`](docs/README.md) (verification record, gate verdict and why),
  then [`docs/DEPLOY.md`](docs/DEPLOY.md), [`docs/CHANGE-LOG.md`](docs/CHANGE-LOG.md) and
  [`docs/OPEN-DECISIONS.md`](docs/OPEN-DECISIONS.md).

Not in this repository, on purpose: `audit/raw/` (the untouched crawl — it embeds the former agency's Google Maps
API key on 338 pages), `tmp/` and the handoff zip. Without `audit/raw/` a fresh clone cannot re-run
`node src/build.mjs`; re-crawl with the site-reforge skill first, or use the built `dist/`.

Generated imagery (15 fal.ai images and a favicon derived from the supplied logo) is illustrative, labelled as
AI-generated in each file's metadata, and never stands in for the practice, its staff or its patients.
The forms are rebuilt but not connected to any endpoint yet (see `docs/DEPLOY.md`).
