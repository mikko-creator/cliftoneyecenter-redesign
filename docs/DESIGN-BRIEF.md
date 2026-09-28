# Design brief — Clifton Eye Center redesign (site-reforge, REFORGE lane)

Source: https://www.cliftoneyecenter.com/ (WordPress on the EyeCarePro / ecpmarketer platform, Beaver Builder
layouts, Gravity Forms). Crawl: 349 HTML pages. Workspace: `C:\Users\Dell\cliftoneyecenter-reforge`.

## What the operator asked for (verbatim intent, 2026-09-28)

1. Clone the site and capture its exact **structure and architecture** (every page at its own URL, same
   menus and hierarchy).
2. A **complete overhaul of the design**, i.e. a total redesign, while **keeping the existing branding and
   brand tone** of the practice.
3. **Keep the existing imagery**, and **add fal-generated images** related to eye care / optometry.
4. **Multiple layers and depth**: the redesign must not look flat. Some **images protrude into
   neighbouring sections or break outside their frames** to create a depth illusion.
5. **Glassmorphism** as the design style, kept **clean and modern**.
6. **Scroll-driven animations** and **hover effects**.

## Brand to preserve (observed on the live site, 2026-09-28; exact values come from audit/capture)

- Name and logo: "Clifton Eye Center" wordmark, grey eye outline with a green "e" in the iris. The logo
  file is used as-is and is never redrawn.
- Colour: an olive/leaf **green** (top bar, section bands, footer), white, greys and a slate/teal heading
  colour. Green stays the lead brand colour.
- Tone: warm, local, personal ("Your Community Eye Care Clinic, We Know You!", "#HappyPatients",
  "#HeretoHelp", "Ask Dr. Deana Clifton a Question..."). The redesign stays friendly and neighbourly, not
  corporate or luxury.
- Practice facts come ONLY from the live site (audit/) or facts/client-facts.json: Bossier City LA, 1000
  Chinaberry Drive Suite 302, 318-550-5815, Mon-Fri 8:30 AM-4:30 PM, Dr. Deana Clifton, OD.

## Hard rules (site-reforge bylaws, apply to every agent)

- Never rewrite, invent or drop copy. Text comes out of `audit/raw/*.html` unchanged. A dropped section
  needs a REMOVE row with a reason in the change-control ledger.
- Never invent claims, reviews, statistics, awards, prices or credentials (B3). Real testimonials only.
- Generated images are illustrative industry imagery: never a stand-in for Dr. Clifton, her staff, the
  office, a patient, a result or a brand. No brand marks, no text in generated pictures. Every generated
  image is labelled as AI-generated in its file metadata and in the handoff docs.
- No platform survives: no `wp-content`, `fl-` (Beaver Builder), `gform`, EyeCarePro/ecpmarketer markup,
  scripts, trackers or icon fonts.
- No runtime dependencies. Node builtins for the build. Hand-written CSS and vanilla JS.
- `prefers-reduced-motion` is honoured. Hover effects have keyboard-focus equivalents. WCAG AA contrast
  on glass (measure over the busiest background, not a flat colour).
- The fal key never enters the project tree (`tools/fal-gen.mjs --key-file <outside>`).

## Motion and depth, learned the hard way on earlier builds (read the linked memory notes)

- IntersectionObserver reveals: threshold 0, rootMargin '0px', release `data-reveal` after the entrance
  so hover transforms are not outranked, fail-safe only if the observer never delivered.
- Scroll-timeline reveals: never `cover N%` ranges; fixed-length entry ranges plus an at-load exemption.
- Protruding images need `overflow: visible` on the path up to the section and must not create
  horizontal page scroll at 390 px. Measure `scrollWidth === innerWidth` at every breakpoint.
- `backdrop-filter` needs a `-webkit-` prefix for Safari and a solid fallback under
  `@supports not (backdrop-filter: blur(1px))`.
