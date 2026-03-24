# OverScope — Scope Creep Tracker for Freelancers

**The litigation brief for your next change order.**

## The Problem

Every freelancer loses money to scope creep. A client asks for "just one more thing," you do it to keep the relationship smooth, and by the time the project ends you've done $3,000 of work you never charged for. The problem isn't being too nice — it's not documenting.

## What It Does

- **Case Files**: Each project is a Case File with client name, hourly rate, original contract value, and scope summary
- **Exhibits**: Each scope creep event is an Exhibit (A, B, C...) with description, category, hours, and dollar exposure
- **Exposure Tracking**: Real-time calculation of total undocumented hours and dollar exposure
- **Change Order Generator**: One click generates a professional change order email ready to send to the client
- **Persistence**: All data stored in localStorage — no account, no server, no subscription

## Categories
- New Feature (something not discussed)
- Excess Revision (beyond contracted rounds)
- Unplanned Meeting (calls and calls and calls)
- Ongoing Support (post-launch "quick questions")
- Spec Change (moving goalposts)
- Other

## Target User
Independent freelancers, consultants, and small agencies — particularly web designers, developers, copywriters, brand strategists.

## Visual Style
"Litigation Brief" — cream legal paper, double-rule dividers, rubber stamp EXHIBIT markers, Playfair Display headings, IM Fell English italic accents, IBM Plex Mono for all data. The contrast between legal formality and everyday freelance frustration is the entire personality.

## Running

```bash
docker compose up -d
```

App runs on port 3238.

## Revenue Potential

- Free tier: 2 projects, 10 exhibits each
- Pro: $12/month — unlimited projects, PDF export, invoice integration, client portal
- The "you lost $3,500 last month" first-run hook has high upgrade conversion potential

## Tech
Static HTML/CSS/JS — localStorage for persistence. Zero dependencies, zero backend.
