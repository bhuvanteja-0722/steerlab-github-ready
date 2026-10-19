# Steer Lab — research to Instagram

Steer Lab is a front-end prototype demonstrating a research-to-social-content workflow for health communication. It includes a simulated pipeline, carousel/static/reel previews, a claim-level review queue, and exportable JSON/CSV files.

## Current capabilities

- Responsive dashboard with navigation to Workspace, Evidence, Content pack, and Review queue.
- Demo pipeline that animates the five workflow stages without external API keys.
- URL validation for research links and PDF file selection/size validation.
- Carousel slide navigation and format switching between carousel, static post, and reel storyboard.
- Claim-level edit, approve, and reject actions.
- Download a content pack as JSON and claim/source sheet as CSV.
- Relative Vite asset paths and GitHub Actions deployment to GitHub Pages.

## Important limitations

This is a prototype, not a production evidence-extraction service. PDF selection does **not** parse the PDF, and a pasted URL is saved as metadata only. The demo pipeline animates sample data; it does not call an LLM, fetch papers, OCR documents, verify medical claims, or publish to Instagram. Some source links open PubMed search results rather than a uniquely identified article. Verify each claim against the original paper and obtain qualified clinical review before publishing.

## Run locally

Requires Node.js 20+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

Open the local URL printed by Vite (usually `http://localhost:3000`).

To test a production build:

```bash
pnpm build
pnpm preview
```

## Deploy to GitHub Pages

1. Create a GitHub repository (for example, `steer-lab`).
2. Push this project to the repository's `main` branch.
3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment → Source**, select **GitHub Actions**.
5. Open the **Actions** tab and wait for **Deploy Steer Lab to GitHub Pages** to finish successfully.
6. The live URL will be shown in the deployment job and under **Settings → Pages**. For a project repository, it usually looks like `https://YOUR-USERNAME.github.io/steer-lab/`.

The workflow in `.github/workflows/deploy.yml` installs dependencies with pnpm, builds the Vite app, and deploys `dist/`. `base: './'` is configured for project subpaths.

## Submission deliverables to add before the hackathon hand-in

- Three finished post assets (carousel, static image, reel video/storyboard) exported from the previews.
- A research sheet mapping each claim to a specific paper URL and exact page/section/table/figure.
- Workflow documentation and clearly labelled estimates for human time per paper.
- Contributor, AI-tool, and external-asset disclosures.
