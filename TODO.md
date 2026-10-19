# Steer Lab build checklist

## 1. App shell and brand system

- Create a responsive dashboard-style workspace for Steer’s paper-to-Instagram pipeline.
- Use the supplied Steer palette: cream `#F5EBDF`, rust `#C04E2A`, deep maroon `#661414`, ink `#351D1D`, clay `#B58777`, blush `#E6CBBD` and soft paper `#F8F2EB`.
- Use a warm editorial treatment with serif headlines, clean sans-serif body text, generous spacing and clear approval states.

## 2. Research intake and simulated pipeline

- Support a paper PDF upload affordance and pasted paper URL.
- Seed a demo batch covering weight regain, lean mass versus muscle mass, and protein plus resistance exercise.
- Show stages for ingest, extract, translate, create and safety check.
- Make the demo runnable without external API keys by simulating processing in the browser.

## 3. Evidence and traceability

- Show paper metadata, key findings, claim IDs, source pointers and visible paper links.
- Keep the source claim attached to each generated content item.
- Show safety notes for percentage points, lean mass versus muscle mass and individualised protein guidance.

## 4. Content pack preview

- Provide one carousel preview with slide navigation.
- Provide one static post preview with exact on-image copy.
- Provide one AI-reel storyboard with scene timing, voiceover and production notes.
- Show caption and hashtags for the selected format.

## 5. Doctor review queue

- Show claim-level approve, edit and reject actions.
- Preserve the citation and safety flag for each claim.
- Display a live review completion count and a clear publish-readiness state.

## 6. Preview and handoff

- Serve `GET /manus-routes.json` with the app route set.
- Run the app on the configured Preview port.
- Check responsive layout and interactive flow before checkpointing.
