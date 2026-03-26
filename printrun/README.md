# PrintRun — Indie Publishing Break-Even Calculator

## What it does
PrintRun helps indie/self-published authors calculate exactly what they need to charge and sell to break even — and reach their income goals. It accounts for per-unit print costs (IngramSpark POD model), royalty rates per channel, pre-publication costs (editing, design, ISBNs), and shows per-channel break-even unit counts.

## The Problem it Solves
First-time self-publishers consistently set their cover price wrong because the math is scattered across multiple vendor calculators, royalty tables, and spreadsheets. PrintRun consolidates all of it: print costs + pre-pub cost amortization + royalty rates + multi-channel comparison = one clean break-even number per channel.

## Target User
- Indie/self-published authors (first book or returning)
- Small press publishers managing multiple titles
- Writing coaches who advise clients on pricing

## Features
- Live Penguin-style book cover preview (updates as you type title/author)
- Per-channel royalty breakdown (IngramSpark, KDP, Direct, Gumroad, Draft2Digital, Bookshop.org)
- Pre-publication cost table (editing, cover design, ISBNs, setup fees)
- Break-even unit count per channel
- Income goal calculator (units needed over a timeframe)
- Direct/event sales analysis with author discount
- Channel royalty overrides for custom deals
- Margin visualization bar

## Running Locally
```bash
docker compose up -d
# Visit http://localhost:3240
```

## Env Vars
None — fully client-side.

## Tech Stack
- Pure HTML/CSS/JavaScript (no framework)
- Nginx Alpine container
- Google Fonts: Barlow Condensed, Barlow, IBM Plex Mono

## Port
3240 (airstream)
