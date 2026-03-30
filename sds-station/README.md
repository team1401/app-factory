# SDS Station

OSHA-compliant Safety Data Sheet binder and chemical inventory for small workshops, maker spaces, school labs, and auto shops.

## Problem
OSHA requires Safety Data Sheets to be instantly accessible during inspections and emergencies. Small shops either use expensive enterprise EHS suites or messy shared drives/paper binders that are impossible to search quickly.

## Features
- Chemical inventory with name, CAS number, storage location, manufacturer
- NFPA 704 diamond ratings (Health/Fire/Reactivity/Special)
- GHS hazard pictogram tracking
- SDS URL/PDF link per chemical — one click to open
- Quick search across all fields
- Filter by: missing SDS, flammable, toxic, corrosive
- Sort by name, date added, location
- Monthly audit reminder banner
- Kiosk mode for shop wall tablet
- CSV export for print index / compliance binders
- 100% local (localStorage) — no server, no auth, no data leaves the device

## Run
```bash
docker compose up -d --build
```
Access at http://localhost:3170

## Tech
- Single HTML file, vanilla JS, no dependencies
- Nginx Alpine container
- localStorage persistence
