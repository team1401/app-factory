# Daily Drama Network (DDN)

Daily Drama Network turns personal chaos into a satirical, screenshot-worthy 24-hour cable news broadcast.

## What it does
- Accepts a user's situation and vibe level
- Generates:
  - Breaking headline + subheadline
  - Anchor desk intro
  - Field reporter segment
  - 3-person pundit panel takes
  - Scrolling ticker items
  - National importance score (1-10)
  - Public advisory

## Tech
- Node.js + Express backend
- Vanilla HTML/CSS/JS frontend
- LLM endpoint: OpenAI-compatible API (default Qwen3-32B at Spark)
- Dockerized deployment

## Run locally
```bash
npm install
PORT=3222 npm start
```
Then visit: `http://localhost:3222`

## Environment variables
- `PORT` (default: `3222`)
- `LLM_URL` (default: `http://100.87.41.76:8000/v1`)
- `LLM_MODEL` (default: `qwen3-32b`)
- `NODE_ENV` (optional, usually `production`)

## Docker
```bash
docker compose up -d --build
```

## API
### `POST /api/broadcast`
Request:
```json
{
  "drama": "My coworker replied-all to my private vent email.",
  "vibe": "Mildly Catastrophic"
}
```

Response:
```json
{
  "urgency": "BREAKING",
  "headline": "...",
  "subheadline": "...",
  "importance": 8,
  "anchorIntro": "...",
  "fieldReport": "...",
  "panel": [
    {"name":"...","title":"...","take":"...","bias":"chaos"}
  ],
  "ticker": ["..."],
  "publicAdvisory": "..."
}
```
