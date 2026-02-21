# UI Preview - Agent Rep Check Frontend

## Visual Design Overview

This document describes the visual appearance of the completed frontend.

## 🎨 Color Palette

**Background:**
- Base: Gradient from slate-900 → purple-900 → slate-900
- Animated orbs: Purple-600/20 and Blue-600/20 with blur

**Glass Elements:**
- Background: rgba(255, 255, 255, 0.05)
- Backdrop blur: 10px
- Border: rgba(255, 255, 255, 0.1)

**Brand Colors:**
- Primary gradient: Purple-600 → Blue-600
- Text gradient: Purple-400 → Blue-400

**Sentiment Colors:**
- Positive: #10b981 (green)
- Neutral: #f59e0b (amber)
- Negative: #ef4444 (red)
- Hostile: #7f1d1d (dark red)

## 📱 Layout Structure

### Header
```
┌────────────────────────────────────────────────────────┐
│  🛡️ Agent Rep Check              [⚙️ Settings]         │
│     Monitor your AI reputation                         │
└────────────────────────────────────────────────────────┘
```

### Hero Section (Before Search)
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│         What Are AI Agents                            │
│         Saying About You?                             │
│                                                        │
│    Autonomous AI agents are creating content          │
│    online. Monitor your reputation and discover       │
│    what they're saying before it affects your career. │
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ 🔍       │  │ ⚠️       │  │ 📈       │           │
│  │ Multi-   │  │ Sentiment│  │ Timeline │           │
│  │ Source   │  │ Analysis │  │ View     │           │
│  │ Search   │  │          │  │          │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Search Interface
```
┌────────────────────────────────────────────────────────┐
│  Full Name                                             │
│  ┌──────────────────────────────────────────────────┐ │
│  │ e.g., John Smith                                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Username / Handle (optional)                          │
│  ┌──────────────────────────────────────────────────┐ │
│  │ e.g., @johndoe or github.com/johndoe            │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  Search Sources                                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ ✓ GitHub │  │ ✓ Web    │  │   Social │           │
│  │ Issues,  │  │ Blogs,   │  │ Twitter, │  [Soon]   │
│  │ PRs      │  │ articles │  │ Moltbook │           │
│  └──────────┘  └──────────┘  └──────────┘           │
│                                                        │
│  [🔍 Search My Reputation]                            │
└────────────────────────────────────────────────────────┘
```

### Risk Score Display
```
┌────────────────────────────────────────────────────────┐
│                                                        │
│      ┌─────────┐           🛡️ Low Risk               │
│      │    25   │              Based on 12 mentions    │
│      │  ╱───╲  │                                      │
│      │ │  │  │ │           Sentiment Analysis        │
│      │  ╲───╱  │           Most mentions are positive│
│      │         │           or neutral. Your online   │
│      └─────────┘           reputation appears healthy│
│    Risk Score                                         │
│                            Recommendation             │
│                            Keep monitoring period...  │
│                                                        │
│                     ┌──────┐  ┌──────┐               │
│                     │  12  │  │ 75%  │               │
│                     │Total │  │ Safe │               │
│                     └──────┘  └──────┘               │
└────────────────────────────────────────────────────────┘
```

### Timeline View (Results)
```
┌────────────────────────────────────────────────────────┐
│  Timeline (12 mentions)                                │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 👍  "Great contribution to open source"         ● │ │
│  │     Jan 15, 2026 · GitHub                  Positive│ │
│  │     The maintainer demonstrated excellent        │ │
│  │     technical knowledge and collaboration...     │ │
│  │                                                   │ │
│  │     Key Claims:                                   │ │
│  │     • Responsive to feedback                     │ │
│  │     • High quality code                          │ │
│  │                                                   │ │
│  │     by @opensource-bot        [View Source →]   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ 💬  "Discussion about code review process"     ● │ │
│  │     Jan 10, 2026 · Web                    Neutral│ │
│  │     An AI agent analyzed the code review...      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ ⚠️  "Rejected pull request with concerns"      ● │ │
│  │     Jan 5, 2026 · GitHub                 Negative│ │
│  │     The PR was rejected due to...                │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Settings Modal
```
┌────────────────────────────────────────────────────────┐
│  🔑 API Settings                               [✕]     │
│                                                        │
│  Bring Your Own Keys (BYOK) - Your API keys are       │
│  stored locally in your browser and sent securely     │
│  with each request. We never store them on servers.   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ OpenAI API Key                             ✓     │ │
│  │                           GPT-4 / GPT-3.5        │ │
│  │ ┌──────────────────────────────────────────────┐│ │
│  │ │ sk-...                                       ││ │
│  │ └──────────────────────────────────────────────┘│ │
│  │ Get your key from platform.openai.com           │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Anthropic API Key                          ✗     │ │
│  │                                      Claude      │ │
│  │ ┌──────────────────────────────────────────────┐│ │
│  │ │ sk-ant-...                                   ││ │
│  │ └──────────────────────────────────────────────┘│ │
│  │ Get your key from console.anthropic.com         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Brave Search API Key  [Optional]           ✗     │ │
│  │ ┌──────────────────────────────────────────────┐│ │
│  │ │ BSA...                                       ││ │
│  │ └──────────────────────────────────────────────┘│ │
│  │ Falls back to web scraping if not provided      │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  👁️ Show API Keys                                     │
│                                                        │
│  [Save Settings]  [Clear All]                         │
│                                                        │
│  🔒 Your API keys are stored only in your browser's   │
│     localStorage and never sent to our servers.       │
└────────────────────────────────────────────────────────┘
```

## 🎭 Animations

### Page Load
1. Background gradient orbs pulse and scale (8-10s loop)
2. Header fades in from left (logo) and right (settings)
3. Hero text fades in with slight upward slide
4. Feature cards stagger in (0.4s, 0.5s, 0.6s delays)
5. Search form slides up and fades in (0.6s delay)

### Search Submit
1. Button scales down on tap
2. Loading spinner rotates
3. Form remains visible for new search when results show

### Results Display
1. Risk score chart animates in
2. Doughnut chart draws with spring animation
3. Score number counts up
4. Timeline cards fade in and slide up with stagger
5. Each card gets 0.1s delay after previous

### Hover States
1. Buttons scale to 102% on hover
2. Glass elements get stronger blur
3. Glow effect intensifies
4. Color transitions smooth (0.3s)

### Settings Modal
1. Backdrop fades in
2. Modal scales from 90% to 100% with fade
3. Success message slides down and fades in
4. Exit animation reverses entry

## 🖼️ Visual Elements

### Glassmorphism
- All cards use frosted glass effect
- Two variants: `glass` (subtle) and `glass-strong` (prominent)
- Consistent 1px white/10% borders
- 10px backdrop blur standard

### Icons
- Lucide React icons throughout
- 24px (w-6 h-6) for most interface elements
- 32px (w-8 h-8) for headers and features
- 64px (w-16 h-16) for empty states
- Color-coded by context (purple for brand, sentiment colors for mentions)

### Typography
- Inter font family (Google Fonts)
- Headings use gradient text (purple-400 → blue-400)
- Body text: white/gray-300 for primary, gray-400 for secondary
- Font sizes: 5xl-6xl for hero, 2xl for section headers, base for body

### Spacing
- Consistent 8px grid system
- Cards: p-6 or p-8
- Gaps: gap-3, gap-4, gap-6
- Margins: mb-4, mb-6, mb-8

## 📐 Responsive Behavior

**Desktop (≥768px):**
- Feature cards in 3-column grid
- Risk score side-by-side (chart + info)
- Timeline full width

**Mobile (<768px):**
- Single column layout
- Feature cards stack
- Risk score stacks vertically
- Timeline cards full width
- Touch-optimized tap targets

## 🎯 Interactive Elements

**Buttons:**
- Primary: Purple-blue gradient with glow
- Secondary: Glass with hover strengthen
- Disabled: Gray gradient, no pointer
- All have scale animations on hover/tap

**Inputs:**
- Dark background with white/10% border
- Purple border on focus
- Placeholder text gray-500

**Toggle buttons (sources):**
- Selected: Glass-strong with purple border and glow
- Unselected: Glass with white/10% border
- Disabled: Opacity 50%, no pointer

## 🔔 Empty States

**No Results:**
- Large message icon (gray-500)
- Helpful message
- Suggestion to try different search

**No API Keys:**
- Status indicators show red X
- Prompt to add keys
- Privacy reassurance

---

This UI achieves the "drop dead gorgeous" requirement with professional polish, smooth animations, and thoughtful UX throughout.
