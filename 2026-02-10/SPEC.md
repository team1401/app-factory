# ViewFinder - Longest Line of Sight Explorer

## Viral Inspiration
**Source:** Hacker News frontpage (385 points, 158 comments) - Feb 9, 2026  
**Original:** https://alltheviews.world  
**What's viral:** Algorithmically calculated longest lines of sight on Earth using 4.5 billion computed viewsheds

## The Concept
An interactive web app that lets users click anywhere on Earth and discover:
- The longest unobstructed line of sight from that point
- Distance, direction, and what they're looking at
- 3D visualization of the sight line over terrain
- Top 10 longest views globally (leaderboard)

## Core Features

### 1. Interactive Globe
- Beautiful 3D globe (WebGL) with country borders
- Click anywhere to calculate longest sight line from that point
- Smooth camera animations when exploring
- Mobile-friendly touch controls

### 2. Sight Line Calculation
- Use elevation data (SRTM or similar public dataset)
- Calculate viewshed from clicked point
- Find longest unobstructed line
- Return: distance (km), bearing, target coordinates, target name

### 3. Visualization
- Draw arc from origin to target on globe
- Show elevation profile along the line
- Highlight origin and destination with markers
- Display mountain/peak names if applicable

### 4. Leaderboard
- Top 10 longest sight lines on Earth (pre-computed)
- Hindu Kush to Pik Dankova (530km) - #1
- Antioquia to Pico Cristobal (504km) - #2
- Mount Elbrus to Pontic Mountains (483km) - #3
- Click any to fly to that location

### 5. Share Feature
- Generate shareable link for specific viewpoint
- "I can see 437km from Mount Everest!" social cards
- Copy coordinates button

## Tech Stack

### Backend (Node.js + Express)
- Elevation data API integration (or cached SRTM tiles)
- Viewshed calculation algorithm
- Geographic calculations (haversine, bearing, etc.)
- Caching layer (Redis optional, or in-memory for MVP)

### Frontend (React + Three.js)
- Three.js for 3D globe rendering
- React for UI components
- Framer Motion for animations
- Tailwind CSS for styling

## Design Requirements (AWARD-WINNING UI)

### Visual Style
- **Dark mode only** - deep space black (#0a0a0f)
- **Accent color** - electric blue (#00d9ff) for sight lines
- **Typography** - Inter for UI, JetBrains Mono for coordinates
- **Glassmorphism** - frosted glass panels for info cards
- **Smooth animations** - 60fps, Framer Motion springs

### Key UI Elements
1. **Globe** - Center stage, full-bleed with subtle atmosphere glow
2. **Info Panel** - Bottom-left frosted glass card with sight line details
3. **Leaderboard** - Top-right collapsible panel
4. **Instructions** - Subtle hint "Click anywhere on Earth" with fade-out
5. **Loading States** - Elegant spinners, never jarring

### Interactions
- Hover over globe shows crosshair cursor
- Click triggers pulse animation at origin
- Sight line draws with smooth bezier curve animation
- Info panel slides up from bottom
- Haptic-feeling button presses (scale + shadow transforms)

## Data Sources
- Elevation: SRTM 90m data (free, global coverage)
- Geography: Natural Earth Data for country borders
- Peak names: OpenStreetMap or GeoNames API

## MVP Scope (Build Tonight)
1. ✅ Interactive 3D globe with click-to-place
2. ✅ Simplified viewshed (sample points along bearing rays, ~100km max for MVP)
3. ✅ Pre-computed top 10 leaderboard (hardcoded from research)
4. ✅ Sight line visualization (arc on globe)
5. ✅ Info panel with distance/bearing
6. ⚠️ Full Earth coverage (start with popular mountain regions if needed)

## Future Enhancements (V2)
- Full 360° viewshed rendering
- Multiple sight lines from one point
- Augmented reality mode (phone camera overlay)
- Time-of-day shadows affecting sight lines
- Weather/atmospheric refraction modeling

## Success Metrics
- Users spend >3 minutes exploring
- Share rate >15%
- "This is beautiful" reactions on social media

---

**Build Status:** Ready for sub-agent spawn  
**Target Port:** 3100 (first daily app)  
**Deployment:** Docker on plex (100.97.65.28)
