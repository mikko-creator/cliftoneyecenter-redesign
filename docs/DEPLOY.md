# Deployment: Clifton Eye Center, "Daylight Canopy" redesign

Written 2026-09-29 from the files in `dist/` and the records in `audit/` and `docs/`. Every count below names the
command or file it came from. Anything that could not be checked on this machine says **UNVERIFIED**.

**Gate status: NOT-READY.** The latest `sr-gate.mjs --project .` run reads 22 PASS, 7 FAIL, 0 UNPROVEN of 29
(`audit/gate.json`). The failing checks are C03, C06, C07, C17, C19, C22 and C23. The gate blocks sign-off, and
this project is **not signed off for launch**. `docs/README.md` ("Verification record") classifies each FAIL. One of
them is a real functional gap: C19, the 2 inert forms (section 6).

## 1. Target

- **What ships:** the contents of `dist/`, a fully static site of 663 files (`node tmp/orch/hashdir.mjs dist` →
  aggregate `75ed34ed4301846e3f1c0b69b07bf3b44fcee03f7c68e905700a4c8af1f2ddcd`, 663 files — the final build, after the
  map-corner fix of 2026-09-29). There is no server code,
  no database and no build step on the host.
- **Where:** a static host serving the **domain root** of `https://www.cliftoneyecenter.com/`. Every canonical URL,
  `og:url`, sitemap entry and `robots.txt` line points at that origin (all 350 pages carry
  `<link rel="canonical" href="https://www.cliftoneyecenter.com/...">`, counted with `grep` over `dist/`).
- **Which host:** not decided in this project. `dist/` carries configuration for two families: a `_redirects` file
  (Netlify / Cloudflare Pages syntax) and an `.htaccess` (Apache). Nginx, IIS or any other server needs the same
  rules written by hand (section 4).
- Who controls the DNS and the hosting account for `cliftoneyecenter.com` today is **not recorded** in this project.
  The live site runs on the EyeCarePro platform (`docs/DESIGN-BRIEF.md`).

## 2. Build

```bash
node src/build.mjs            # rebuilds dist/ from scratch; exit 1 if any build failure is recorded
```

Or ship `dist/` exactly as it is. Needs Node (v24.19.0 on this machine) plus `cwebp`, `webpmux` and
`ffmpeg`/`ffprobe` on PATH, or `$CWEBP` / `$WEBPMUX` / `$FFMPEG` (`docs/BUILD-NOTES.md` section 1). Two builds of the
same sources gave byte-identical trees (`tmp/final/chain/00-repro.log`: `tmp/final/a`, `tmp/final/b` and `dist`
IDENTICAL, control fired). That build used a warm image cache; a cold-cache rebuild was not compared (**UNVERIFIED**).

Upload **everything** in `dist/`, including the two dotfile/underscore files (`.htaccess`, `_redirects`) that some
upload tools skip. **Upload `dist/` only, never the project folder.** The former agency's Google Maps API key is in
340 files of the working copy: the 338 raw pages in `audit/raw/` (`docs/BUILD-DECISIONS.md`, "Secrets found in the
harvest"), `assets/source/57a2e231-clipart-010.jpg` and `tmp/lab/neighborhood/work/main.txt`. **It is no longer in git
history:** the one commit that carried it (via `assets/source/57a2e231-clipart-010.jpg`) was rewritten on 2026-09-29
and 0 commits now contain the key, so the repository can be pushed — but `tmp/` (including the pre-rewrite backup
bundle) and `audit/raw/` must never be published. `dist/` has 0 files with the key. The
evidence is in `docs/README.md` ("The old Maps API key") and `tmp/final/docs-fix/key-scan.log`.

## 3. URL shape and the 404 page

- Every page is a directory index: `/eye-care-services/` is served from `dist/eye-care-services/index.html`, and the
  home page from `dist/index.html`. The host must serve `index.html` for a directory request.
- **Trailing slash.** On the live site, every URL without its trailing slash answers `301` to the slash form: the
  crawl records 355 such hops and no other kind (`audit/site-inventory.json` `redirectChain`, counted with a node
  one-liner). The new host should do the same, and no page should answer `200` at both forms. Check the chosen host's
  directory-index and trailing-slash settings; this was not tested on any host (**UNVERIFIED**).
- **404 page.** `dist/404.html` is the source's `/404-page-not-found/` content. It is `noindex` and left out of the
  sitemap. Every URL in it is **root-relative** (`/styles/site.css`, `/img/...`, `/`), because a host serves it at
  whatever path failed, at any depth. Consequences:
  - it renders correctly only when the site is deployed at the **domain root**. The rest of `dist/` uses
    page-relative URLs and also works from a subpath or a local folder, but 404.html does not;
  - **Apache:** `dist/.htaccess` starts with `ErrorDocument 404 /404.html` (1 line, `grep -c ErrorDocument
    dist/.htaccess`). There is no Apache on this machine, so the rule was never exercised on a real server
    (**UNVERIFIED**, `tmp/final/verify/results.json` CS-R2-04);
  - **Netlify / Cloudflare Pages:** both serve a root `404.html` by convention, so `_redirects` has no 404 line
    (BUILD-NOTES section 4 item 15; not tested here);
  - **nginx:** `error_page 404 /404.html;` has to be added by hand;
  - the local preview server (`tools/serve.mjs`) answers a missing path with a plain-text 404, not with 404.html.
  So the preview cannot test the 404 page's behaviour on a host.

## 4. Redirects

The source's redirects are carried forward as 9 permanent redirects (`audit/redirects.json`). `dist/_redirects` has
18 lines, the slash and no-slash form of each. `dist/.htaccess` has 9 `RedirectMatch 301` rules with an optional
trailing slash. The same 9 rules also appear in `tmp/final/chain/02c-seo-migration-crosscheck.log`.

| from | to | why (`audit/redirects.json`) |
|---|---|---|
| `/eye-care-services/dry-eye-disease-and-treatment/` | `/eye-care-services/eye-conditions/dry-eye-disease-and-treatment/` | source 301 (live site) |
| `/eye-care-services/pediatric-eye-exams/` | `/eye-care-services/eye-exams/pediatric-eye-exams/` | source 301 (live site) |
| `/eyeglasses-contacts/designer-frames/` | `/eyeglasses-contacts/eyeglasses/designer-frames/` | source 301 (live site) |
| `/eyeglasses/designer-frames/` | `/eyeglasses-contacts/eyeglasses/designer-frames/` | source 301 (live site) |
| `/your-eye-health/eye-conditions/` | `/eye-care-services/eye-conditions/` | source 301 (live site) |
| `/your-eye-health/eye-diseases/` | `/eye-care-services/your-eye-health/eye-diseases/` | source 301 (live site) |
| `/your-eye-health/eye-diseases/cataracts/` | `/eye-care-services/your-eye-health/eye-diseases/cataracts/` | the source links here and it 404s; the content lives at the target |
| `/your-eye-health/eye-diseases/macular-degeneration/` | `/eye-care-services/your-eye-health/eye-diseases/macular-degeneration/` | the source links here and it 404s; the content lives at the target |
| `/your-eye-health/protecting-your-eyes/` | `/eye-care-services/your-eye-health/protecting-your-eyes/` | source 301 (live site) |

Internal links inside the site already point straight at the targets (ledger row L09). The redirects only serve old
bookmarks, inbound links and search engines. The crawl recorded 7 URLs that 404 on the live site
(`audit/site-inventory.json`, all 7 accepted as source-side items in `audit/failures.json`). Two of them,
`/your-eye-health/eye-diseases/cataracts` and `/your-eye-health/eye-diseases/macular-degeneration`, get a redirect
above. The other 5 have no replacement page and stay 404:
- `/sitemap`: the footer link now goes to `/sitemap.xml` (BUILD-DECISIONS #5);
- `/eyeglasses-contacts/prescription-eyeglasses/consider-a-second-pair-of-glasses`;
- `/your-eye-health/eye-diseases/cataracts/cataracts-video`;
- `/your-eye-health/protecting-your-eyes/protecting-your-eyes-from-glare`;
- `/your-eye-health/protecting-your-eyes/protecting-your-eyes-from-uv-rays`.

## 5. Headers

These are recommended, **not tested on any host** (**UNVERIFIED**):

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-up6jwUdgWF71vbP7iQXGNlIrrLO1BqO3fFkQNy8v1t4='; style-src 'self'; img-src 'self'; font-src 'self'; frame-src https://www.google.com https://www.youtube.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'
```

The CSP comes from a static scan of `dist/` made on 2026-09-29. No page loads an external script, stylesheet, font or
image. There are 0 `<style>` elements and 0 `style=""` attributes (`site.js` writes styles only through the CSSOM). The
only frames are the Google Maps embed (337 pages) and 2 YouTube embeds. The one inline script, the head script that
sets the `js` class, is byte-identical on all 350 pages (350 of 350 inline blocks equal), and its sha256 is the hash
above. **If that script changes, the hash must be recomputed.** The JSON-LD block is data, not script. Wiring a form
endpoint on another origin means adding it to `form-action`. The policy was never served with the header set and
checked in a browser console, so test it with `Content-Security-Policy-Report-Only` first.

## 6. Forms (inert until an endpoint is wired)

Two forms are rebuilt field for field from the source Gravity Forms (ledger L23, BUILD-DECISIONS #4). Neither has an
`action` or a `mailto:`. When a visitor submits a valid form, `site.js` stops the submission and shows *"This form is
not connected yet — please call 318-550-5815"*. **Nothing is sent anywhere.** The fields below come from the rendered
`dist/` pages (`<label>`/`<legend>` text and control names, read with `node tmp/final/docs/form-fields.mjs` on
2026-09-29):

**`/contact-us/contact-form/`** (form 10; 9 controls, 7 names)

| field | control | name | required |
|---|---|---|---|
| Your Name: First / Last | text x2 | `f10-8-3`, `f10-8-6` | no |
| Subject | text | `f10-2` | yes |
| Message | textarea | `f10-3` | no |
| Should we reply? (Yes, Email Me / Yes, Call Me / No) | radio | `f10-4` | yes |
| Email | email | `f10-9` | no; shown only when "Yes, Email Me" is chosen (`data-show-if="f10-4=Email"`, QA CS-04) |
| Phone | tel | `f10-10` | no; shown only when "Yes, Call Me" is chosen (`data-show-if="f10-4=Call"`) |

**`/contact-us/appointment-request-form/`** (form 9; 12 controls, 11 names)

| field | control | name | required |
|---|---|---|---|
| Reason for Appointment | textarea | `f9-1` | no |
| Preferred Date & Times | textarea | `f9-2` | yes |
| Patient Type (New patient / Returning patient) | radio | `f9-3` | yes |
| Name: First / Last | text x2 | `f9-11-3`, `f9-11-6` | yes |
| Phone | tel | `f9-12` | yes |
| Email | email | `f9-13` | yes |
| Best Time to be Reached for Confirmation: Hours / Minutes / AM-PM | number x2 + select | `f9-14-1`, `f9-14-2`, `f9-14-3` | yes |
| Comments | textarea | `f9-9` | no |

To wire them:
1. Choose an endpoint that is acceptable for patient contact data. No choice has been made here. BUILD-DECISIONS #4
   rules out a personal webmail `mailto:` fallback.
2. Add `action` (and `method="post"`, which is already present) to the two `<form>` elements in the build
   (`src/lib/forms.mjs` renders them). In `src/scripts/site.js`, the submit handler (the "forms: inert" block) calls
   `preventDefault()` on every valid submit. Change it to send the data, and keep its validation.
3. The appointment form carries the source's own sentence *"Details are stored securely and not sent by email."*
   (BUILD-NOTES section 4 item 16). It is only true if the chosen backend makes it true.
4. The source's anti-spam honeypot was dropped (ledger L23 REMOVE), so spam protection comes from the new endpoint.
5. The source's phone input masks (`(999) 999-9999`, a jQuery plugin) were not carried. The inputs are `type=tel`
   with `autocomplete=tel` (BUILD-NOTES section 6).

The patient paperwork PDFs no longer depend on the platform. They are served locally from
`dist/docs/new-pt-paperwork.pdf` and `dist/docs/established-pt-paperwork.pdf` (BUILD-DECISIONS #9).

## 7. Google Maps embed (keyless)

337 pages embed `https://www.google.com/maps?q=Clifton%20Eye%20Center%2C%201000%20Chinaberry%20Drive%2C%20Suite%20302%2C%20Bossier%20City%2C%20LA%2071111&output=embed`
(counted with `grep` over `dist/`). It needs no API key, and the former agency's keyed embed is never shipped (ledger
L22, BUILD-DECISIONS #10). On 2026-09-28 it rendered the practice pin in headless Chrome
(`tmp/orch/shots/home.1440.png`). Google can withdraw the keyless endpoint at any time. If it does, every map becomes
an empty frame: the styled `map__link` fallback ("Open in Google Maps") exists in the CSS but is **not wired**
(BUILD-NOTES section 6).

## 8. Indexing: noindex kept from the live site, sitemap

- **noindex:** 221 of the 350 HTML files carry `noindex`. 217 of them keep the live site's own robots meta: every
  robots meta in the raw head is merged and the most restrictive wins (BUILD-DECISIONS #1). 3 are the
  `/testimonial/*` singles, set `noindex` by a declared decision (BUILD-NOTES section 4 item 4). That makes 220
  crawled pages. The last one is `dist/404.html`. The count comes from `node tmp/final/docs/noindex-sitemap-scan.mjs`
  on 2026-09-29, which reads every `<meta name="robots">` tag in `dist/` and found 221 noindex and 129 indexable.
  Changing the indexing is an SEO decision for the practice (`docs/OPEN-DECISIONS.md`).
- **sitemap.xml** lists exactly the 129 indexable pages: 129 `<loc>` entries, all on
  `https://www.cliftoneyecenter.com/`, 0 of them noindex, 0 pointing at a missing file, and 0 indexable pages left out.
  This is the same scan, and its control, a planted noindex URL, was detected.
- **robots.txt:** `User-agent: *`, `Allow: /`, `Sitemap: https://www.cliftoneyecenter.com/sitemap.xml`.
- The SEO migration check (`sr-seo.mjs --project . --dir dist --site-url https://www.cliftoneyecenter.com
  --migrating`) reports 0/0/0 migration findings, and an all-page cross-check finds all 349 canonicals present,
  absolute, on the origin and self-referencing or pointing at the source (`tmp/final/chain/02b-seo.log`,
  `02c-seo-migration-crosscheck.log`).

## 9. DNS and HTTPS

1. Keep the canonical host `www.cliftoneyecenter.com`: every URL in the build uses it. Point `www` at the new host
   (usually a CNAME), and send the apex `cliftoneyecenter.com` to `https://www.cliftoneyecenter.com/` with a 301.
2. Issue the TLS certificate for both names before moving DNS. Most static hosts issue one automatically once the
   domain is verified.
3. Lower the DNS TTL a day before the switch so a rollback propagates quickly.
4. Keep the old platform account running until the checks in section 10 pass on the new host. The patient PDFs and
   every image already ship in `dist/`, so nothing in the new site loads from the old platform.
5. Send `http://` to `https://` with a 301 on both names, then turn on HSTS (section 5) once HTTPS is confirmed.

None of this was done or tested from this project. The current DNS records and registrar are not recorded here
(**UNVERIFIED**).

## 10. Launch checklist

- [ ] **The gate reads NOT-READY with 7 FAILs** (C03, C06, C07, C17, C19, C22, C23; `audit/gate.json`). Each FAIL is
      either fixed or explicitly accepted by whoever signs off the launch. `docs/README.md` classifies them. The gate
      blocks sign-off until then.
- [ ] The practice has settled the open decisions (`docs/OPEN-DECISIONS.md`), above all the licence for the syndicated
      patient-education library and blog.
- [ ] A form endpoint is wired and tested with a real submission on both forms (section 6), or the forms stay inert
      and the practice accepts the "please call" notice.
- [ ] `dist/` is uploaded in full, including `.htaccess` / `_redirects`. Nothing else is uploaded: not `audit/raw/`, not
      the other 2 files that hold the old Maps key, and not the git repository, whose history holds it (section 2).
- [ ] Pages resolve at their live URLs, and no-slash URLs 301 to the slash form (section 3).
- [ ] The 9 redirects answer 301 to their targets (section 4): `curl -sI https://www.cliftoneyecenter.com/eyeglasses/designer-frames/`.
- [ ] A made-up URL at depth 0 and at depth 3 returns status 404 **and** the styled 404 page with its CSS and images.
- [ ] `https://www.cliftoneyecenter.com/sitemap.xml` and `/robots.txt` are served. Submit the sitemap in Google
      Search Console.
- [ ] A noindex page still carries its robots meta when served. For example, `/1-eye-allergies-2016/` must show
      `<meta name="robots" content="noindex, max-image-preview:large">`.
- [ ] The map renders on `/` and `/hours-location/`.
- [ ] HTTPS on `www` and the apex, HTTP → HTTPS, apex → www, then HSTS.
- [ ] The CSP has been tested in Report-Only mode, with no violations in the console on the home page, a form page and
      a page with a YouTube embed.
- [ ] **Safari / iOS check** (glass, `backdrop-filter`, scroll-driven parallax fallbacks). It has never run (gate G13,
      README "What is not verified").

## 11. Post-deploy verification

Run from the project root against a mirror of the deployed site (download it into, for example, `tmp/deployed/`):

```bash
CEC_DIST=tmp/deployed node tools/link-check.mjs            # every local href/src resolves; 0 broken expected
CEC_DIST=tmp/deployed node tools/sentence-parity.mjs       # 0 lost sentences expected
node C:/Users/Dell/.claude/skills/site-reforge/scripts/sr-decontaminate.mjs --project . --dir tmp/deployed --strict
node tmp/orch/hashdir.mjs dist tmp/deployed                # see the note below
```

A host does not serve `.htaccess` or `_redirects`, so a downloaded mirror will lack those 2 files and the aggregates
will differ. Any difference in another file means the host changed it (minified it, for example). Compare per file.

The expected values are the ones recorded for `dist/` in `docs/README.md` ("Verification record").
