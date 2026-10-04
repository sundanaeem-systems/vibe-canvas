# Vibe Canvas — Interactive AI Spatial Content Studio

Next.js 15 (App Router) + Sanity Studio v3 project for the Sanity Challenge,
Path 2 (Vibe-Code Something Strange / Custom Studio).

```bash
npm install
cp .env.local.example .env.local   # fill in your Sanity project values
npm run dev
```

- Site: http://localhost:3000
- Studio: http://localhost:3000/studio

Full setup, environment variables, CORS steps, verification checklist and the
challenge write-up live in [`DEV_SUBMISSION_TEMPLATE.md`](./DEV_SUBMISSION_TEMPLATE.md).

## Layout

```
app/
  (main)/        site layout + RSC home page (draft-mode aware)
  (studio)/      embedded Sanity Studio at /studio
  api/           draft, disable-draft, revalidate route handlers
  globals.css    theme variables + vibe utilities
components/      SpatialCanvas, VibeController, VisualEditing
sanity/
  schemas/       vibeCanvas document
  components/    ColorPalettePicker (WCAG contrast engine)
  actions/       deployVibeAction (publish + cache purge + toasts)
  lib/           client, queries, token
sanity.config.ts Studio config (Presentation tool + action resolver)
```
