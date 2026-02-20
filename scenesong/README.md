# SceneSong

**Turn any life moment into an AI music prompt.**

Built in response to Google Lyria 3's viral launch (February 2026), SceneSong helps you craft rich, evocative music prompts for AI music generators — just by describing a scene, feeling, or moment.

## What It Does

1. **Describe any moment** — "Watching the last fireflies of summer from a porch swing"
2. **Scene Analysis** — A keyword-scoring engine analyzes your scene across 6 dimensions: Energy, Warmth, Complexity, Tempo Feel, Social Space, and Light/Dark valence
3. **Musical DNA** — Derives key/mode, tempo range, instrumentation, and mood tags
4. **Three Prompts Generated** — Formatted specifically for:
   - **Google Lyria 3** — Natural language prompt for Gemini
   - **Suno** — Genre/mood/tag format
   - **Udio** — Style + emotion descriptor format
5. **Mood Palette** — Suggested color palette for the scene's emotional tone
6. **Save & Share** — LocalStorage saves, URL-shareable scenes

## Design Style

**Analog Warmth / Cassette Punk** — warm browns, amber accents, deep warm blacks. VU meter array, cassette housing frame, Space Mono + Oswald typography. The antithesis of dark glassmorphism.

## Running Locally

```bash
docker compose up -d --build
# App available at http://localhost:3122
```

## No API Keys Required

All prompt generation is client-side JavaScript — no backend, no API calls, no keys. Works offline after initial load.

## Tech Stack

- Pure HTML/CSS/JavaScript
- nginx:alpine (static file server)
- Docker / docker-compose
- Google Fonts (Space Mono, Oswald)

## Port

Default: `3122` (Airstream deployment)
