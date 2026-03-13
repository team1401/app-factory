# LogBook73 — Amateur Radio Station Log

A modern, clean web-based QSO logging application for licensed amateur radio operators. Built with a Cold War SIGINT terminal aesthetic — phosphor green on near-black, amber frequency readouts, CRT scanline overlay.

## The Problem It Solves

700,000+ licensed US ham radio operators have no modern web-based logging tool. The popular alternatives (Ham Radio Deluxe, Log4OM, CQRLOG) are old, Windows-heavy, or overwhelmingly complex. LogBook73 is the clean, fast, browser-based option.

## Features

- **Quick QSO entry** — callsign, band, mode, frequency, RST sent/received, operator name, notes
- **Press Enter to log** — optimized for rapid sequential logging during a radio session
- **UTC auto-clock** — always shows current UTC time; timestamps applied at moment of logging
- **Band activity panel** — visual bar chart of logged contacts per band, updates live
- **Session statistics** — total QSOs, unique callsigns, top band, top mode
- **Search** — filter log by callsign
- **ADIF export** — standard format compatible with LOTW, eQSL, Club Log, HRDlog
- **Local storage** — all data stays in your browser, no account required

## Visual Style

"Cold War SIGINT Terminal" — phosphor green (#39FF14) on near-black (#030802), amber frequency readout display, CRT scanline and vignette CSS effects, military olive accents. Share Tech Mono + Orbitron + IBM Plex Mono typography trio.

## Running

```bash
# Local
open index.html

# Docker
docker compose up -d

# Access
http://localhost:3159
```

## Environment

- Pure HTML/CSS/JavaScript — no build step
- localStorage for data persistence (no backend)
- nginx:alpine Docker image

## Port

**3159** (airstream deployment)
