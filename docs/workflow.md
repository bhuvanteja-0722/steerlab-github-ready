# Steer Lab workflow (prototype)

1. **Ingest** — user selects a PDF or supplies a paper URL. The app validates the file extension/size or URL format.
2. **Extract** — represented in the demo only. No PDF parsing, OCR, PubMed API, or full-text extraction is implemented.
3. **Translate** — sample claims and caveats are shown in plain language; no live LLM call is made.
4. **Create** — previews a carousel, a static post, and a reel storyboard.
5. **Safety check** — a human reviewer can edit, approve, or reject each claim. Rejected or pending claims prevent the readiness indicator from becoming publish-ready.
6. **Export** — download a JSON content pack and CSV claim/source sheet. Export is a handoff artifact; no Instagram publishing integration is implemented.

## Human-time estimate (planning estimate, not measured)

For a single paper, budget **30–60 minutes of human review** for source verification, checking the claim against the original paper, rewriting, and clinical sign-off. This is an unvalidated planning estimate and should be replaced by a timed pilot. The prototype does not yet automate the evidence extraction stages, so do not claim measured time savings.
