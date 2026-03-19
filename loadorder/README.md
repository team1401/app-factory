# LoadOrder — TTRPG Combat Initiative Tracker

**Problem:** Game Masters running D&D/Pathfinder/any TTRPG struggle to track initiative order, HP, and conditions for 8-15 combatants simultaneously. Paper breaks down; full VTTs require account setup.

**Solution:** Instant, no-account, no-reload browser combat tracker. Open the URL and start adding combatants.

## What it does

- **Initiative order** — add combatants with name, initiative, HP, and AC. Auto-sorted descending.
- **HP tracking** — damage/heal/temp HP controls with live HP bar (color-shifts green → copper → crimson)
- **Conditions** — all 14 D&D 5e conditions as toggle chips (Blinded, Charmed, Poisoned, etc.)
- **Concentration tracking** — toggle indicator with visual badge
- **Death saves** — pip trackers for downed PCs/NPCs (3 successes = stable, 3 failures = dead)
- **Round counter** — tracks elapsed game time (6 sec per round)
- **Notes** — per-combatant text field for spells, tactics, reminders
- **Persistent** — all state saved to localStorage, survives page refresh

## Design

**Style:** "Letterpress Broadside" — 19th century theatrical print aesthetic. Warm cream paper, Navy and Crimson ink, Ultra woodtype serif font.

## Running

```bash
docker compose up -d
```

Access at http://localhost:3165

## Keyboard Shortcuts

- `Space` / `→` — Next Turn
- `←` — Previous Turn
- `N` — Focus the "Name" input to add a combatant quickly

## Environment

No environment variables required. All state in localStorage.

## Target User

TTRPG Game Masters (D&D 5e, Pathfinder, etc.) who want instant browser-based initiative tracking without signing up for anything.

## Revenue Path

- Free: unlimited encounters, all features
- Paid ($3/mo): save multiple named encounters, monster compendium lookup, condition reference card, encounter sharing links
