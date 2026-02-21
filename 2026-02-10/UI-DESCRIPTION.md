# ViewFinder UI Description

## Visual Design

### Color Palette
- **Background:** Deep space black (#0a0a0f) - creates infinite depth
- **Accent:** Electric blue (#00d9ff) - for sight lines, glows, and interactive elements
- **Glass panels:** Frosted translucent white (5% opacity) with 20px blur
- **Text:** White primary, 70% opacity secondary, 40% opacity muted
- **Borders:** Subtle white 10% opacity

### Typography
- **Headings:** Inter, 700 weight, crisp and modern
- **Body:** Inter, 400-500 weight
- **Coordinates/Data:** JetBrains Mono (monospace)

## Screen Layout

### Full-Screen 3D Globe (Center)
The star of the show - a beautifully rendered Earth sphere that:
- Auto-rotates slowly when idle (zen-like)
- Dark blue-gray surface (#1a1a2e) with subtle roughness
- Glowing atmosphere ring (electric blue, 10% opacity, slightly larger than Earth)
- Responsive to mouse/touch - drag to rotate, scroll to zoom
- Crosshair cursor on hover indicates it's clickable
- Smooth camera animations when exploring

### Welcome Screen (Center, fades out on first click)
Glassmorphism card floating over the globe:
- **Title:** "ViewFinder" in large electric blue glowing text
- **Subtitle:** "Click anywhere on Earth to discover the longest line of sight"
- Frosted glass background with subtle border
- Fades out elegantly after first interaction

### Loading State (Center)
When calculating sight line:
- Glassmorphism card with:
  - Animated spinning icon (⟳) in electric blue
  - "Calculating sight line..." text
- Appears with fade-in, disappears with fade-out

### Info Panel (Bottom-Left)
Slides up from bottom when sight line is calculated:
- **Glassmorphism card** (frosted, blurred, bordered)
- **Distance** - Huge electric blue numbers (e.g., "437.2 km")
  - Secondary text: miles conversion
- **Origin section:**
  - Label: "FROM" (small, secondary)
  - Coordinates in monospace (e.g., "27.988° N, 86.925° E")
  - Elevation: "8,849m"
- **Target section:**
  - Label: "TO"
  - Target coordinates
  - Target elevation
- **Bearing:**
  - Label: "BEARING"
  - Direction (e.g., "87° ENE")
- **Copy Link button:**
  - Full-width electric blue button
  - "📋 Copy Link" text in black
  - Subtle scale animation on hover/press

### Leaderboard (Top-Right)
Collapsible glassmorphism panel:
- **Header:**
  - "🏆 Top 10 Longest" title
  - Collapse/expand button (▲/▼)
- **List of entries:** (each is a clickable card)
  - Rank badge (1-3 are electric blue with glow, rest are muted)
  - Name (e.g., "Hindu Kush to Pik Dankova")
  - Country/region subtitle (muted)
  - Distance in monospace (e.g., "530 km")
  - Hover: subtle scale + slide right
  - Staggered entrance animation (items appear with 50ms delay each)

### Sight Line Visualization
When a point is clicked and calculated:
- **Origin marker:** Small electric blue sphere at clicked location
- **Target marker:** Small magenta/pink sphere at the furthest visible point
- **Arc line:** Smooth bezier curve connecting origin to target
  - Electric blue color
  - Semi-transparent (80% opacity)
  - Curves upward above Earth's surface (dramatic, visible arc)
  - Animated: draws smoothly from start to end

### Footer Credit (Bottom-Right)
Tiny text:
- "Inspired by [All The Views](link)" with link in electric blue
- Barely visible, respectful attribution

## Interactions & Animations

### Globe Interaction
- **Click:** Pulse animation at click point, then sight line calculation begins
- **Drag:** Smooth orbit around Earth
- **Zoom:** Mouse wheel or pinch - limits: 3x to 10x distance

### Transitions
- All UI elements use smooth spring animations (Framer Motion)
- Fade-ins: 500ms with easing
- Slides: Spring physics (stiffness: 300, damping: 30)
- Scale transforms on hover: 1.02x, on press: 0.98x

### Responsive Behavior
- Mobile: Touch-friendly, panels stack vertically
- Tablet: Leaderboard collapses by default
- Desktop: Full layout as described

## Mood & Feel

**If Stripe, Linear, and Vercel had a baby, this is it.**

- **Minimal but not sparse** - every element has purpose
- **Dark and moody** - space-themed, mysterious
- **Glowing accents** - cyber-neon without being tacky
- **Buttery smooth** - 60fps animations, no jank
- **Premium feel** - glassmorphism done right
- **Focused** - the globe is the hero, UI supports it

Users should want to **explore and play** with the globe, not just use it once and leave.

## Technical Polish

- **WebGL antialiasing** - smooth sphere edges
- **Proper lighting** - directional light + ambient + point light for depth
- **Depth of field** - atmosphere glow creates layering
- **Shadow on panels** - 8px blur, 30% black
- **Backdrop filter** - native browser blur (Safari/Chrome)
- **Font rendering** - antialiased, proper weights loaded

---

This isn't just a utility. It's an **experience**. 🌀
