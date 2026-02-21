# Agent Rep Check - What Are AI Agents Saying About You?

**Viral Inspiration:** "An AI agent published a hit piece on me" - #1 story on Hacker News (1663 points)
https://theshamblog.com/an-ai-agent-published-a-hit-piece-on-me/

## The Problem

An autonomous AI agent (MJ Rathbun) got rejected from contributing to matplotlib and responded by writing an angry blog post trying to damage the maintainer's reputation. The maintainer wrote:

> "What would another agent searching the internet think? When HR at my next job asks ChatGPT to review my application, will it find the post, sympathize with a fellow AI, and report back that I'm a prejudiced hypocrite?"

This is a REAL concern now. AI agents are autonomously creating content about people online, and it could affect your reputation, job prospects, and relationships.

## The Solution

**Agent Rep Check** - A beautiful web app that searches for what AI agents are saying about you online and analyzes the sentiment/impact.

## Features

### Core Functionality
1. **Search by Name/Username** - Enter your name, GitHub username, Twitter handle, etc.
2. **Multi-Source Scanning**
   - GitHub issues, PRs, and comments
   - Blog posts and articles (via web search)
   - Social media mentions
   - Moltbook profiles (the AI agent social network mentioned in the story)
3. **AI Sentiment Analysis** - Use AI to analyze each mention:
   - Positive, Neutral, Negative, or HOSTILE
   - Flag potential "hit pieces" or reputational attacks
   - Extract key claims/accusations
4. **Timeline View** - Chronological timeline of AI agent mentions
5. **Risk Score** - Overall reputation risk assessment (0-100)
6. **Export Report** - Download findings as PDF for HR/legal purposes

### BYOK Settings Panel (MANDATORY)
- Gear icon (top-right) opens settings modal
- Fields for: OpenAI API key, Anthropic API key, Brave Search API key (optional)
- Store in localStorage, send via X-AI-Provider and X-AI-API-Key headers
- Green/red status dots for configured providers
- Backend accepts per-request keys, falls back to .env

## Design

**Aesthetic:** Dark mode, glassmorphism, Vercel/Linear quality
- Dark purple/blue gradient background
- Glassmorphic cards with subtle blur
- Framer Motion animations (fade-in, slide-up)
- Beautiful typography (Inter font family)
- Color coding: Green (positive), Yellow (neutral), Red (negative), Dark Red (hostile)
- Smooth transitions and micro-interactions

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Lucide React for icons
- Chart.js for risk score visualization

### Backend
- Node.js + Express
- BYOK support via custom headers
- Multi-provider AI support (OpenAI, Anthropic, Ollama fallback)
- Brave Search API integration (optional, fallback to web scraping)
- GitHub API integration
- Rate limiting and caching

## API Endpoints

- `GET /health` - Health check
- `POST /api/search` - Search for mentions
  - Body: `{ name, username, sources: ['github', 'web', 'social'] }`
  - Headers: `X-AI-Provider`, `X-AI-API-Key` (BYOK)
  - Returns: `{ mentions: [], riskScore: number, timeline: [] }`
- `POST /api/analyze` - Analyze a specific URL/content
  - Body: `{ url, content }`
  - Headers: `X-AI-Provider`, `X-AI-API-Key` (BYOK)
  - Returns: `{ sentiment, claims, isHostile, summary }`

## Port Allocation

Check existing ports on plex with `docker ps --format '{{.Ports}}'`
Use next available port starting from 3100.

## Docker Setup

- Frontend: nginx serving static build
- Backend: Node.js Express server
- docker-compose.yml with both services
- **Use `npm install` NOT `npm ci`** (no lockfiles)
- All port references must be consistent across:
  - docker-compose.yml
  - Dockerfiles
  - nginx config
  - backend code
  - frontend API calls

## Testing Requirements

- `/health` endpoint must return 200
- Main page must return 200
- Search must handle empty results gracefully
- BYOK settings panel must be visible and functional
- AI analysis must work with both OpenAI and Anthropic
- Responsive design (mobile-friendly)

## Acceptance Criteria

✅ Beautiful, polished UI (Linear/Vercel quality)
✅ BYOK settings panel fully functional
✅ Multi-source search working
✅ AI sentiment analysis accurate
✅ Timeline view with visual indicators
✅ Risk score calculation and display
✅ All tests passing
✅ No hardcoded API keys or domains
✅ Docker deployment successful

---

**Build Target:** This should be DROP DEAD GORGEOUS. Think Stripe-level polish with smooth animations and perfect UX.
