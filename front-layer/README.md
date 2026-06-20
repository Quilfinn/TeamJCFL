# Signal — Julius Baer front layer

A social-first mobile banking prototype for the "young money" private-banking client.
Built for SwissHacks 2026 (Team JCFL). Runs in a webview.

> Reels shared from TikTok/Instagram land in the app, where the client can have them
> explained by AI, forwarded to their relationship manager (RM), or expanded into the
> related assets — all anchored on an insight-driven portfolio dashboard. The RM stays
> central throughout.

## Stack

- **Vite + React + TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite`, tokens in `src/index.css` `@theme`)
- **Geist** Sans/Mono (Google Fonts)
- **lucide-react** icons, custom inline TikTok/Instagram glyphs
- Animations are **CSS keyframes** (reliable in webviews); Framer Motion is only used for
  tap feedback. Entrance animations are deliberately *transform-only* so a backgrounded
  tab never leaves an element invisible.

## Run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle to dist/
```

Designed at 402×860 (phone). On desktop it renders inside a device frame; on a real
device the inner screen fills the viewport.

## Structure

```
src/
  App.tsx                 screen composition + all interaction state
  components/
    PhoneFrame.tsx        device frame, atmosphere, nav + overlay slots
    Greeting.tsx          time-aware "Good evening, {name}" + avatar
    PortfolioHeader.tsx   minimal: total/asset value + growth indicator
    Breadcrumb.tsx        drill-down nav path above the bento
    Treemap.tsx           frosted/grainy square-of-rounded-squares, drill-down
    ActivityRow.tsx       compact tappable feed row (reel / voice memo)
    QuickActionsDrawer.tsx  bottom drawer on share/yap: Explain · Send to RM · Record again · Delete
    RecordingDrawer.tsx   glass "listening…" sheet with live equalizer
    AIExplainSheet.tsx    bold glass-gradient AI brief + suggested action
    ForwardSheet.tsx      "Ask Clara" / send-to-RM composer
    BottomNav.tsx         floating glass nav: Home · Wealth · mic · Advisor(face)
    Sheet.tsx / Toast.tsx primitives
    BrandIcons.tsx        inline TikTok / Instagram glyphs
  data/
    portfolio.ts          nested asset tree (drives the treemap)
    feed.ts               activity items + sample shares / transcripts
  lib/
    squarify.ts           squarified-treemap layout (Bruls et al.)
    palette.ts            blue ramp + frosted tile fills
    explain.ts            builds the AI-brief payload for a reel or memo
    format.ts             CHF / percent formatting
```

Grain comes from a CSS `feTurbulence` noise overlay (`.grain-overlay` in `index.css`)
layered over each frosted tile.

## Backend contract (for `back-layer`)

All data is mocked in `src/data/`. Swap these for API calls — shapes are intended to map
1:1. Suggested wiring to the existing Flask endpoints (`/api/v1/...`):

| UI need | Mock source | Suggested endpoint |
| --- | --- | --- |
| Portfolio tree (`AssetNode`) | `data/portfolio.ts` | `GET /portfolio` → nested `{id,name,value,change,children}` |
| Activity feed (`FeedItem[]`) | `data/feed.ts` | `GET /feed` |
| Ingest a shared reel (`App.simulateShare`) | `sampleShares` | `POST /tiktok/download` (exists) → returns a `ReelItem` |
| Explain a reel / memo | `lib/explain.ts` static copy | `POST /ai/explain {itemId}` → brief + bullets + suggestedAction |
| Record a memo (mic → `RecordingDrawer`) | `sampleTranscripts` | `POST /memo/transcribe` (audio) → transcript text |
| Send to RM | `ForwardSheet` (toast stub) | `POST /rm/forward {context,note}` |

Auth: `back-layer` issues an httpOnly `auth_token` cookie via `POST /users/login`; fetches
should use `credentials: 'include'` and the `FRONTEND_URL` CORS origin.

## Out of scope (per brief)

Onboarding, settings detail, and asset *discovery* are intentionally omitted.
