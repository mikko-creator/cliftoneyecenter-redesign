# Open decisions for the practice

Items only the practice (or its agency) can settle. Each one is also named in the handoff README.

1. **Licence of the patient-education library and blog.** 101 library pages under
   `/eye-care-services/your-eye-health/` (119 pages under `/eye-care-services/` in all), the eyewear/contact-lens
   explainers and 151 blog posts (counts: `src/content/site-map.json` families `library-article` and `blog-post`)
   carry the generic article structure the EyeCarePro platform syndicates to its member practices. Whether every one
   of the 151 posts is syndicated is UNVERIFIED (62 have no year in their URL). The rebuild keeps every page at its
   own URL, unchanged, because the brief is a faithful structural clone. Whether the practice may keep publishing
   those articles after leaving the platform depends on its contract with the vendor. Confirm before launch; if the
   licence does not survive, the affected pages can be removed with 301s to their section hub (one ledger decision
   per page).
2. **Forms** (appointment request, contact) are rebuilt field-for-field, including the contact form's conditional
   fields, but send nothing until a form endpoint is wired (`docs/DEPLOY.md`). This is the gate's C19 FAIL and the
   sweep's one blocker (`form-no-action`), and it is a launch blocker.
3. **Generated imagery** (15 fal.ai images + a favicon derived from the supplied logo) is illustrative, labelled as
   AI-generated in each shipped file's metadata (IPTC `trainedAlgorithmicMedia`), and never stands in for Dr. Clifton,
   the staff, the office, a patient, a result or a brand. Two service images show generic illustrative models (a man
   at an exam instrument, a smiling child in glasses); nothing on the page presents them as the practice's patients.
   Replace any of it with real photography of the practice whenever that is available.
   **Neoclassical theme only:** the home's #HeretoHelp shows Dr. Deana Clifton's own photograph, upscaled 4x with AI
   because the live site holds only a 225 x 397 copy (operator request, 2026-09-29). It is labelled as an AI-enhanced
   photograph (IPTC `compositeWithTrainedAlgorithmicMedia`), not as generated. An upscaler invents fine detail such as
   hair, skin texture and jewellery, so Dr. Clifton should approve the image before launch, or the practice should
   supply an original high-resolution photo to use instead.
4. **The former agency's Google Maps API key** is embedded in the live site's HTML (so it is already public) and in
   this workspace's untouched crawl (`audit/raw/`, never to be published). The rebuild ships a keyless map embed and
   no copy of the key; the agency should still rotate or restrict that key once the old site is retired.
