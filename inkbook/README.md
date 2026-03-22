# InkBook — Tattoo Studio Manager

**The booking manager built for tattoo artists who are still using Instagram DMs.**

## Problem Solved

50,000+ tattoo artists in the US manage clients through Instagram DMs, paper appointment books, and Cash App. They lose deposits, clients miss appointments, and design briefs live in screenshot folders. Booksy/Square aren't tattoo-specific. InkBook is.

## Features

- **Today's Queue** — see the day's sessions at a glance, sorted by time
- **Appointment Booking** — full intake form: piece description, style, placement, size, session type
- **Deposit Tracking** — track deposit amount and receipt status; balance due auto-calculated
- **Client Profiles** — phone, email, Instagram, skin type, allergy/medical notes, referral source
- **Session History** — full appointment history per client, total spend
- **Status Pipeline** — Pending → Deposit Paid → Confirmed → Complete (+ No Show / Cancelled)
- **Studio Tools** — deposit calculator, time estimator, price calculator, printable aftercare guide
- **localStorage persistence** — no account, no server, data stays in browser

## Visual Design

**Style:** Traditional Tattoo Flash Sheet  
- Aged cream paper background with horizontal ruled lines
- Ink black, traditional red, green, gold, and navy palette
- Anton (headlines) + Special Elite (notes/scripts) + Oswald (UI) + Pinyon Script (watermark)
- Appointment cards styled like laminated flash panels
- Corner ✦ ornaments on all cards

## Running

```bash
docker compose up -d --build
```

Access at: http://localhost:3236

## Target Users

Solo tattoo artists and small studios (2–5 artists). Target: anyone currently using a paper book or Instagram DMs for booking.

## Revenue Path

Freemium SaaS — local version free, cloud sync (multi-device, reminders, deposit payment links) at $12–20/month. Clear path: solo artists often earn $100k+/year and gladly pay for tools that save them 2+ hours/week.
