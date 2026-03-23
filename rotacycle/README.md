# RotaCycle — On-Call Rotation Builder

**What it does:** Fair, no-friction on-call schedule generation for small engineering teams (3–15 people) who can't afford PagerDuty and are tired of managing rotations in Google Sheets.

**Target user:** Engineering leads, DevOps managers, and team leads at small companies (3–25 person teams) who have on-call duties but no scheduling tooling.

**Pain point solved:** The gap between "free Google Sheet" and "PagerDuty at $21/user/month" is enormous. Fair distribution requires math. Holidays get missed. Swaps are tracked in Slack DMs and forgotten.

## Features

- Add up to 10 team members with color-coded assignment blocks
- Three rotation patterns: weekly (default), daily, custom N-day shifts
- Three algorithms: Fair Distribution (equalize shift counts), Round Robin (strict order), Weighted
- Optional backup/secondary on-call track
- Blackout days / holiday calendar (one-click load of US 2026 federal holidays)
- **Calendar view** — color-blocked monthly grid
- **Week Strip view** — horizontal grid showing who is ON/BCK per day across all team members
- **Fairness view** — distribution bars for primary shifts, weekend shifts, holiday coverage, backup shifts
- **Swap tool** — swap two specific dates to handle vacation coverage
- **Export ICS** — import directly into Google Calendar, Apple Calendar, Outlook
- **Export CSV** — spreadsheet-compatible
- All data persisted to localStorage, no account needed, no server-side storage

## Running

```bash
docker compose up -d --build
```

App available at http://localhost:3237 (or `http://100.97.65.28:3237` on airstream).

## Environment Variables

None required. Fully static — no backend.

## Tech

- Pure HTML/CSS/JavaScript (zero dependencies, no framework)
- Nginx serving static files
- Docker for deployment
