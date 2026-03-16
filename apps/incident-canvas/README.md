# IncidentCanvas

**Incident Timeline Logger & Post-Mortem Generator**

On-call engineers live through production outages where events are scattered across Slack, Discord, PagerDuty, and mental notes. When the smoke clears, writing the post-mortem requires 2-3 hours of reconstructing what happened from Slack archaeology. IncidentCanvas solves this by giving engineers a dedicated, fast timeline logger during the incident so the post-mortem writes itself.

## What it does

- **Real-time timeline**: Log events as they happen — detection, investigation, mitigation, comms, resolution, escalation, learning
- **Wire service aesthetic**: Events appear as AP/UPI wire dispatches with severity flags (FLASH ★ / URGENT / BULLETIN / ADVISORY)
- **Incident metadata**: Track affected systems, user impact, incident commander, contributing factors
- **One-click post-mortem**: Generates a structured markdown post-mortem document from the timeline
- **Live UTC timer**: Shows elapsed time from incident start to resolution
- **Persistent storage**: All data stored in localStorage

## Who it's for

On-call engineers, SREs, DevOps engineers, and platform teams who respond to production incidents.

## Running

```bash
docker compose up -d
# Access at http://localhost:3233
```

## Environment

No environment variables required — client-side only, data stored in localStorage.

## Tech

- Pure HTML/CSS/JavaScript (no framework)
- nginx:alpine serving static files
- Docker
