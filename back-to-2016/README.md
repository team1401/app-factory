# Back to 2016 - Time Capsule Generator

A nostalgia-driven web app that recreates your 2016 self based on your current age. Taps into the viral "2016 is the new 2016" TikTok trend.

## Features

- **Personalized memories** based on age bracket (kid/teen/young adult/adult)
- **2016 music hits** - Drake, Chainsmokers, Rihanna, etc.
- **Viral moments** - Mannequin Challenge, Pokémon GO, Damn Daniel, Harambe
- **Popular apps** - Vine, Dubsmash, Musical.ly nostalgia
- **Slang translator** - "on fleek," "lit," "bae," and more
- **Polaroid aesthetic** - Cards that "develop" on hover like real Polaroids
- **Vintage digital scrapbook** style - warm colors, paper texture, scattered layout

## Design

**Style:** Vintage Digital Scrapbook  
**Palette:** Hot pink (#FF6B9D), Instagram blue (#4A90E2), Snapchat yellow (#FFD93D), warm cream background (#FFF8E7)  
**Typography:** Montserrat (bold headers) + Open Sans (body)  
**Signature element:** Animated polaroid cards with develop-on-hover effect

## Tech Stack

- React 18
- Pure CSS animations (no libraries)
- Client-side only (no backend)
- Responsive design
- Docker + nginx for production

## Running Locally

```bash
npm install
npm start
```

Runs on http://localhost:3000

## Building for Production

```bash
npm run build
```

## Docker Deployment

```bash
docker build -t back-to-2016 .
docker run -d --name back-to-2016 --restart unless-stopped -p 3110:80 back-to-2016
```

Access at http://100.97.65.28:3110

## Why 2016?

According to TikTok trends and social media data, 2016 is experiencing massive nostalgia in early 2026. It represents:
- Pre-pandemic normalcy
- Peak social media fun (before toxicity)
- Simpler times before AI ubiquity
- Drake's cultural dominance
- Vine's golden era

The hashtag #BringBack2016 has millions of posts, 55M+ TikTok videos using 2016-style filters, and Spotify playlists titled "2016" seeing increased playback.

## No External Dependencies

All content is curated and hardcoded - no API calls required. This keeps it fast, reliable, and free to run.

---

Built overnight by the App Factory 🌙
