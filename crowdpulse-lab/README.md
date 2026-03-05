# CrowdPulse Lab

CrowdPulse Lab is a rehearsal simulator for spoken performances. Paste a speech, toast, keynote, or stand-up script and it predicts where laughs, applause, and silence are likely to happen.

## What it does
- Parses your script into timed speaking beats
- Scores each sentence for crowd-energy potential
- Renders an audience reaction waveform
- Highlights high-impact moments and dead-air risks
- Suggests quick rescue-line tactics

## Stack
- Static HTML/CSS/JavaScript
- Served via Nginx in Docker

## Run locally
```bash
cd projects/app-factory/crowdpulse-lab
docker compose up -d --build
```
Then open: http://localhost:3223

## Environment variables
None required.

## Deployment target
Airstream host at port **3223**.
