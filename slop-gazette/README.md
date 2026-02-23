# The AI Slop Gazette

**A sensational tabloid newspaper that exposes AI-generated writing.**

Paste any text and get a full front-page exposé revealing how "sloppy" it is — with a SLOP SCORE from 0–100, investigative column articles for each metric, pull quotes, and an official Gazette Scorecard.

## What It Does

The Gazette runs 7 forensic analysis metrics on submitted text:

1. **AI Buzzword Density** — Detects ~50 overused AI phrases like "certainly," "it's important to note," "first and foremost"
2. **Hedge Phrase Infestation** — Flags epistemic cowardice: "it's worth mentioning," "in many cases," "it should be noted"
3. **Transition Word Abuse** — Catches mechanical paragraph stitching: "Furthermore," "Moreover," "In conclusion"
4. **Passive Voice Evasion** — Heuristic passive voice detection (X is/was/were done)
5. **Sentence Length Robotics** — Low sentence length variance = robotic cadence
6. **Sycophantic Openers** — "Certainly!" "Great question!" "Absolutely!" sentence starters
7. **Suspicious Em Dash Usage** — AI loves em dashes — perhaps too much

Results are displayed as a fully-formatted 1980s tabloid newspaper front page with:
- Sensational headline based on score
- Multiple investigative column articles with evidence lists
- A circular SLOP SCORE seal
- "Official Gazette Scorecard" with mini progress bars
- Rubber stamp overlay (EXPOSED / SUSPICIOUS / CLEARED / AUTHENTIC)
- Pull quote from the most suspicious sentence

## How to Run

```bash
docker compose up -d --build
```

App runs at `http://localhost:3125` (or wherever port 3125 is mapped).

No environment variables required. Fully client-side — no backend, no API calls.

## Visual Style

**Retro Tabloid Sensationalism** — 1970s–80s supermarket tabloid aesthetic (Weekly World News / National Enquirer). Newsprint cream backgrounds, ink-black columns, scandal red headlines, rubber stamp overlays, and dense justified column layout.

Typography: Playfair Display (headlines) + IM Fell English (body) + Special Elite (datelines/stamps)

## Tech Stack

- Pure HTML/CSS/JavaScript (zero dependencies, zero build step)
- Client-side text analysis with regex + phrase dictionary
- nginx:alpine Docker image

## Deployment

Built by the Overnight App Factory · Airstream port 3125 · February 23, 2026
