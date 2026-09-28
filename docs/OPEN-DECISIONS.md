# Open decisions for the practice

Items only the practice (or its agency) can settle. Each one is also named in the handoff README.

1. **Licence of the patient-education library and blog.** About 120 pages under
   `/eye-care-services/your-eye-health/`, the eyewear/contact-lens explainers and ~90 dated blog posts carry
   the generic article structure the EyeCarePro platform syndicates to its member practices. The rebuild
   keeps every page at its own URL, unchanged, because the brief is a faithful structural clone. Whether the
   practice may keep publishing those articles after leaving the platform depends on its contract with the
   vendor. Confirm before launch; if the licence does not survive, the affected pages can be removed with
   301s to their section hub (one ledger decision per page).
2. **Forms** (appointment request, contact, patient forms) are rebuilt field-for-field but send nothing
   until a form endpoint is wired (see DEPLOY.md once written).
3. **Generated imagery** is illustrative, AI-generated (fal.ai), labelled as such in each file's metadata,
   and never depicts Dr. Clifton, the staff, the office or a patient. Replace any of it with real
   photography of the practice whenever that is available.
