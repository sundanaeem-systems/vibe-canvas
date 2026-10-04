# Vibe Canvas — Interactive AI Spatial Content Studio

**Sanity Challenge submission — Path 2: Vibe-Code Something Strange / Custom Studio**
`#sanitychallenge`

---

## 1. What it is

Vibe Canvas turns a single Sanity document into a living, spatial web experience.
Editors do not fill in a page: they tune a *vibe*. Theme mood, brand hues, spatial
arrangement, ambient sound and a set of free-floating interactive nodes are all
content fields, and the front end re-choreographs itself around them in real time.

The Studio itself is the strange part — it ships a custom colour input with a live
WCAG 2.1 contrast engine, and a custom `Deploy Vibe` document action that publishes
and purges the Next.js cache in one ritual, reporting back with toasts.

---

## 2. Path 2 requirement map

| Requirement | Where it lives |
| --- | --- |
| Custom Studio input component | `sanity/components/ColorPalettePicker.tsx` — presets, hex picker, WCAG AAA/AA/Fail badge |
| Custom document action | `sanity/actions/deployVibeAction.ts` — publish + `/api/revalidate` + Sanity toasts |
| Studio config with Presentation | `sanity.config.ts` — `presentationTool`, action resolver, Vision |
| Draft Mode / Visual Editing | `app/api/draft/route.ts`, `app/api/disable-draft/route.ts`, `components/VisualEditing.tsx` |
| On-demand revalidation | `app/api/revalidate/route.ts` — secret-validated, `revalidateTag('vibeCanvas')` |
| Type-safe GROQ | `sanity/lib/queries.ts` — `VIBE_CANVAS_QUERY` + document interfaces |
| Workflows (content review pipeline) | `sanity/actions/workflowActions.ts`, `reviewStatus`/`reviewHistory` fields, custom desk structure (`sanity/structure.ts`) |
| Spatial front end | `components/SpatialCanvas.tsx`, `components/VibeController.tsx` |

---

## 3. Stack

- Next.js 15 (App Router, RSC) · React 19 · TypeScript 5
- Sanity Studio v3 embedded at `/studio` via `next-sanity`
- `@sanity/ui`, `@sanity/presentation`, `@sanity/visual-editing`
- Tailwind CSS · Framer Motion · lucide-react · canvas-confetti

---

## 4. Setup

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev
```

Open:
- Site — http://localhost:3000
- Studio — http://localhost:3000/studio
- Presentation — Studio → Presentation tab (live preview with clickable fields)

### Environment variables

| Variable | Purpose | Where to get it |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID | sanity.io/manage → project → API |
| `NEXT_PUBLIC_SANITY_DATASET` | Dataset name (`production`) | sanity.io/manage → Datasets |
| `NEXT_PUBLIC_SANITY_API_VERSION` | GROQ API date, e.g. `2024-10-01` | fixed date string |
| `SANITY_API_READ_TOKEN` | Draft Mode / Presentation reads | sanity.io/manage → API → Tokens → **Viewer** |
| `SANITY_REVALIDATE_SECRET` | Validates `/api/draft` + `/api/revalidate` | generate: `openssl rand -hex 32` |
| `NEXT_PUBLIC_SANITY_REVALIDATE_SECRET` | Same value, readable by the Deploy Vibe action | same value as above |
| `NEXT_PUBLIC_SITE_URL` | Absolute site origin for Presentation + metadata | `http://localhost:3000` locally |

### CORS

sanity.io/manage → project → **API → CORS origins** → add:
- `http://localhost:3000` (allow credentials ✅)
- your deployed URL, e.g. `https://vibe-canvas.vercel.app` (allow credentials ✅)

---

## 5. Verification checklist

- [ ] `/studio` loads and shows the **Vibe Canvas** document type
- [ ] `primaryColor` renders the palette picker with presets and a live contrast badge
- [ ] Entering `#121212` shows **Fail – Low Contrast** against black; `#00F0FF` shows **AAA – Passed**
- [ ] The **Deploy Vibe** action appears in the document action menu and shows two toasts
- [ ] `POST /api/revalidate` with the wrong secret returns `401`
- [ ] Presentation tab renders the site and clicking text jumps to the field
- [ ] Changing `spatialLayout` re-animates the nodes between grid, orbit and 3D stack
- [ ] `soundscapeUrl` plays through the controller with working volume
- [ ] Moving reviewStatus through draft -> in-review -> approved -> live works via the document action menu, and reviewHistory records each transition

---

## 6. Content model — `vibeCanvas`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string | required |
| `themeMode` | string | `cyberpunk` · `vaporwave` · `zen-minimal` · `aurora-glitch` |
| `primaryColor` | string | hex, custom `ColorPalettePicker` input |
| `accentColor` | string | hex, custom `ColorPalettePicker` input |
| `spatialLayout` | string | `floating-grid` · `circular-orbit` · `3d-card-stack` |
| `soundscapeUrl` | url | validated as `.mp3/.ogg/.wav/.m4a` |
| `heroHeading` | string | |
| `subheading` | text | |
| `interactiveNodes[]` | object[] | `label`, `description`, `xPos`/`yPos` (−50…50), `nodeTheme` |
| `reviewStatus` | string | `draft` · `in-review` · `approved` · `live`; only `live` renders publicly |
| `reviewNotes` | text | optional note saved with the next transition |
| `reviewHistory[]` | object[] | read-only audit trail: `fromStatus`, `toStatus`, `actor`, `note`, `timestamp` |

---

## Workflow

Every Vibe Canvas moves through a four-stage pipeline stored as data on the document:

`draft` → `in-review` → `approved` → `live`

- **Submit for Review** (draft → in-review) — any editor, or an agent/script patching the same field.
- **Approve** (in-review → approved) or **Send Back to Draft** (in-review → draft) — the reviewer.
- **Go Live** (approved → live) — publishes and calls `/api/revalidate`, exactly like Deploy Vibe.
- **Deploy Vibe** stays visible but is disabled until the document is Approved or Live.

Each action only appears when the document is in its "from" stage. Anything written in **Review Notes** is copied into `reviewHistory` with the actor's name and a timestamp, then cleared. `reviewHistory` is read-only in the Studio — an append-only audit trail. The public query filters on `reviewStatus == "live"`, so documents in draft or review never render on the site. The Studio sidebar groups documents into Needs Review, Approved (not live), Live, All Drafts and All Vibe Canvases.

## 7. The contrast engine

Relative luminance, WCAG 2.1:

L = 0.2126·R + 0.7152·G + 0.0722·B (on linearised channels)

Contrast ratio = (L_lighter + 0.05) / (L_darker + 0.05), evaluated against both
`#000000` and `#FFFFFF`. The badge reports **AAA – Passed** at ≥ 7:1,
**AA – Passed** at ≥ 4.5:1, otherwise **Fail – Low Contrast**.

---

## 8. Deploy

```bash
vercel deploy
```

Add every variable from `.env.local.example` to the Vercel project, set
`NEXT_PUBLIC_SITE_URL` to the production URL, and add that URL as a Sanity CORS
origin with credentials allowed.

---

## 9. Links to fill in before submitting

- Live site: `https://…`
- Studio: `https://…/studio`
- Repository: `https://github.com/…`
- Demo video / thread: `https://…`
