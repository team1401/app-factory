# GigBook — Musician's Gig Ledger & Pay Tracker

**Pain point:** Working musicians track 30–60 gigs/year across Notes, texts, and Google Sheets. No simple tool tells them what they've earned, who still owes them, what they played where, or how much they made per venue.

**Target user:** Gigging musicians with regular bookings — bar performers, session players, wedding musicians, private-event performers.

## Features
- Log gigs with venue, city, type, pay, pay status, hours, booker contact, and setlist
- Three pay states: **Owed/Unpaid**, **Paid/Collected**, **Free/Traded**, **Canceled**
- One-click "Mark Paid" button on unpaid gig cards
- Setlist tracking per gig — tag songs and see them on each card
- Ledger view — sortable table of all gigs
- Summary view — monthly earnings chart, top venues by count + revenue, aggregate stats
- Live stats in header: total gigs, collected, still owed, YTD earnings
- All data stored in localStorage — no backend, no accounts, works offline

## Running
```bash
docker compose up -d --build
```
App available at http://localhost:3241

## Visual Style
"1970s Concert Handbill" — warm near-black background, Anton/Bebas Neue display type, gold + orange + blue palette. Each gig card has an accent bar and status badge styled like concert poster copy.
