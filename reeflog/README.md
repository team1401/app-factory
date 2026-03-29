# ReefLog 🐠

**Reef tank water chemistry tracker for serious reefers.**

No spreadsheets. No paper logs. Track alkalinity, calcium, magnesium, nutrients, and physical parameters across multiple tanks with trend charts, out-of-range alerts, and test history.

## The Problem

Reef aquarium hobbyists must test 8–11 water parameters weekly (alkalinity, calcium, magnesium, pH, salinity, nitrate, phosphate, ammonia, nitrite, temperature, iodine). If alkalinity drifts out of range, $5,000+ of coral can die in days. Most reefers track this on paper, whiteboards, or spreadsheets. No good dedicated web tool exists.

## Features

- **Multi-tank support** — track unlimited tanks with color-coded health status
- **11 parameter types** with scientifically correct ranges for reef systems
- **Real-time validation** — out-of-range indicators fire as you type
- **Trend sparklines** — visualize any parameter over last 20 tests
- **Alert banners** — CRITICAL and WARNING levels with visual severity
- **Test history feed** — chronological log with parameter diffs
- **Water change logging** — track percentage changes
- **Offline-first** — all data stored in localStorage, no account required
- **Trend arrows** — ↑↓→ on each parameter showing direction vs. last test

## Parameter Coverage

| Category | Parameters |
|----------|-----------|
| Major | Alkalinity (dKH), Calcium (ppm), Magnesium (ppm) |
| Nutrients | Nitrate, Phosphate, Ammonia, Nitrite, Iodine |
| Physical | Salinity (SG), pH, Temperature (°F) |

## Design System

- **Style:** De Stijl Data — Mondrian grid aesthetic
- **Colors:** Primary blue (#1A3ACC), red (#CC1A1A), yellow (#E8C620), white (#FAFAF8)
- **Typography:** Bebas Neue display + Space Grotesk UI + Space Mono data
- **Signature:** Thick 3–5px black borders creating a Mondrian composition, parameter cells as geometric tiles

## Running

```bash
docker compose up -d
# App available at http://localhost:3160
```

## Environment

No environment variables required. No backend. No database.
All data stored in browser localStorage.

## Revenue Potential (freemium path)

- Free tier: 1 tank, 90-day history, local storage
- Pro ($4.99/mo): unlimited tanks, cloud sync, export CSV/PDF, dosing reminders, parameter alerts via email, auto-correlation analysis (e.g., alk vs. calcium ratio warnings)
- Market: ~1M US reef hobbyists, typically high-spend enthusiasts
