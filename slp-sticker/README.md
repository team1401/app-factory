# StickerTally (SLP)

Fast session tallies + quick progress trends for speech-language pathologists.

## The pain it solves
SLPs often need to track trials and ratings **in the moment**. Existing systems are either paper (easy to lose, hard to summarize) or EHR screens (too slow for quick tapping). StickerTally gives you big touch targets for tallying and a simple trend view per goal.

## What it does
- Create clients
- Add a "goal sticker sheet" per client
- Run a session with big **✓ / ✕** buttons (or 0–5 ratings)
- Save sessions locally
- View goal trends + session history
- Export CSV (documentation/analysis) + export/import JSON (backup)

## Privacy
- **Local-only**: data is stored in the browser `localStorage`.
- No accounts, no server database.
- If you clear browser storage, data is removed (use backups).

## Dev

```bash
npm install
npm run dev
```

## Docker

```bash
docker build -t stickertally .
docker run --rm -p 3112:8080 stickertally
```

Then open: http://localhost:3112
