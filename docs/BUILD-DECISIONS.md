# Build decisions (orchestrator, 2026-09-28) — answers to docs/PORT-NOTES.md §4

The operator said "go ahead, pick the winner and build it", so these defaults are decided here and each one
is recorded as a change-control row by the build. Any of them can be reversed by the practice later.

| # | Question | Decision | Why |
|---|---|---|---|
| 1 | Source `noindex` on 217 pages | **Keep all of it.** Merge every robots meta in the raw head, most restrictive wins; noindex pages stay out of sitemap.xml | Preserves the live indexing state; changing it is an SEO decision for the practice |
| 2 | Favicon (source has none) | **Derive one from the logo's eye mark** (crop of the supplied logo file, no redraw), declared as a derived asset in docs | A UI asset, not a claim; tabs without an icon look broken |
| 3 | Empty title/h1 on `/testimonial/*` (3) and `/category/our-doctors/` | Heading = the neutral UI label **"Testimonial"** / **"Our Doctors"** (the post-type / category slug the URL already carries); title follows it | No invented copy; the label restates the URL |
| 4 | Forms without a backend | **Inert, field-for-field**, with a short honest notice on submit ("This form is not connected yet — please call 318-550-5815"). No mailto fallback (a personal webmail address must not receive patient data). No authored PHI note | Honest, safe; wiring is a launch task (DEPLOY.md) |
| 5 | Footer "Sitemap" (404 on the source) | Point it to `/sitemap.xml` | Frisco precedent; the source link is dead |
| 6 | Top-bar "Make an Appointment" (dead `href=""`) | Link to `/contact-us/appointment-request-form/` | Obvious intent; recorded as a behaviour change |
| 7 | Desktop-only home rows (reviews, Q&A, designer brands) | **Show them on phones too** | Real content hidden by a platform visibility toggle; recorded as a UX change |
| 8 | 6 content images with no usable file | Generic alt → decorative generated stand-in (declared in image-plan `fillFor`); alt naming a specific person/pet/event → drop the `<img>` (declared removal) | Bylaw B3; memory note on fabricated brand marks |
| 9 | Patient-form PDFs on the platform CDN | **Harvested**: `assets/docs/new-pt-paperwork.pdf` (7 pp), `assets/docs/established-pt-paperwork.pdf` (6 pp); served locally | They die with the platform account |
| 10 | Keyless Google Maps embed | Keep the embed with the practice's full address as the query; verify it resolves in browser QA; fall back to a plain "Open in Google Maps" link if not | Embed with no local alternative stays (skill default) |

## Secrets found in the harvest

- `audit/raw/*.html` carries the former agency's Google Maps API key (`AIza…`, 338 pages). The rebuild never
  ships it: maps use the keyless embed. `audit/raw/` must never be published (a public repo or preview must
  exclude it), and every publish runs a secret scan for `AIza` and the fal key id with a positive control.
