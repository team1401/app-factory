# mise — Meal Timing Coordinator

> *From "mise en place" — everything in its place.*

## What it does

mise backward-schedules your entire meal from a single target serve time. Add your dishes with their prep, cook, and rest times and mise shows you exactly when to start each one — so everything hits the table hot and ready at the same moment.

**Core features:**
- Set a target serve time; all dishes are reverse-scheduled automatically
- Visual Gantt timeline — prep (diagonal hatch), cook (solid green), rest (dotted) phases
- Oven conflict detection (flags when two dishes need the oven simultaneously)
- 18 quick-add presets (roast chicken, prime rib, mashed potatoes, etc.)
- **Service Mode** — full-screen live cook tracker with:
  - Real-time clock and countdown to serve
  - Live playhead scrubbing through the timeline
  - Action queue ("START PREP Roasted potatoes — in 14m")
  - Per-dish status badges (Pending → Prepping → Cooking → Resting → Ready)
  - Auto-completed action log
- All data persists in localStorage — no account needed
- Fully responsive (mobile-first)

## How to run

```bash
docker compose up -d --build
```

App available at http://localhost:3162 (or replace with server IP).

## Environment variables

None required. Fully static frontend.

## Tech

- HTML5 / CSS3 / Vanilla JavaScript (no framework dependencies)
- nginx:alpine Docker container
- ~100KB total (before fonts)
- Works offline after first load (fonts cached)

## Design

Nordic Tasting Menu — inspired by Noma/Fäviken-era Scandinavian fine dining design. Extreme white space, single forest green accent, warm sand tones, Work Sans + IBM Plex Mono typography.
