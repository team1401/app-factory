# ViralCheck - AI Persona Focus Group

**Viral Trend**: Based on the trending article "I Cloned 2,000 Hacker News Users to Predict Viral Posts" which demonstrates 60% accuracy in predicting viral content using AI personas. This approach is gaining massive attention as a new market research technique.

**Concept**: Test any headline, tweet, or content idea against AI personas representing your target audience. Get instant feedback, virality scores, and suggestions for improvement.

---

## Features

### Core Functionality
1. **Content Input**: Single text field for headline/tweet/post title
2. **Audience Selection**: Dropdown with presets
   - Hacker News (tech-savvy developers)
   - Product Hunt (early adopters, founders)
   - Reddit r/technology (tech enthusiasts)
   - Twitter Tech (AI/crypto/startup crowd)
   - LinkedIn Business (professionals, B2B)
   - General Public (diverse demographics)

3. **Persona Generation**: Create 20-50 diverse AI personas representing that audience
   - Each persona has: background, interests, voting patterns, pet peeves
   - Stored in memory for the session (not persistent)

4. **Voting Simulation**: Each persona rates the content on:
   - Would I upvote/share this? (Yes/No)
   - Interest level (1-10)
   - Brief reaction/comment

5. **Results Display**:
   - **Virality Score**: % who would engage (like the 60% from the article)
   - **Distribution Chart**: Show voting breakdown
   - **Top Reactions**: Display 5-10 most insightful persona comments
   - **Suggestions**: AI-generated improvements based on negative feedback
   - **Comparison**: Test multiple headlines side-by-side

### Design Requirements
- **Dark mode by default** with gradient backgrounds (purple/blue tech vibes)
- **Framer Motion animations**: 
  - Stagger persona cards as they "vote"
  - Smooth score counter animation
  - Slide-in results panel
- **Typography**: Inter/SF Pro for clean tech aesthetic
- **Glassmorphism**: Frosted glass panels for results
- **Responsive**: Mobile-first design

### BYOK Settings Panel (MANDATORY)
- Gear icon in top-right opens modal
- Fields for:
  - OpenAI API Key
  - Anthropic API Key
  - Preferred provider dropdown
- Store in localStorage
- Send via headers: `X-AI-Provider`, `X-AI-API-Key`
- Backend accepts per-request keys, falls back to .env
- Green/red dots showing provider status

---

## Technical Stack

### Frontend
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Recharts (for voting distribution)
- Axios for API calls

### Backend
- Node.js + Express
- OpenAI SDK + Anthropic SDK
- Per-request API key handling via headers
- Caching layer for personas (in-memory, session-based)

### API Endpoints
- `POST /api/generate-personas` - Create audience personas
- `POST /api/test-content` - Run the viral test
- `GET /health` - Health check

---

## User Flow
1. Land on page → see example headline being tested (demo mode)
2. Enter your own headline
3. Select target audience
4. Click "Test Virality"
5. Watch personas "vote" in real-time (animated cards)
6. See final score + feedback
7. Optionally: edit headline based on suggestions, re-test

---

## Viral Hook
**Why this will spread**:
- Instant gratification (results in 10-15 seconds)
- Social proof element ("60% of HN would upvote this!")
- Shareworthy results ("My headline scored 87%!")
- Useful for content creators, marketers, founders
- BYOK removes friction for power users

---

## Port Assignment
Check existing apps, use next available port starting from 3100.

---

## Testing Checklist
- [ ] Health endpoint returns 200
- [ ] Home page loads
- [ ] Can generate personas
- [ ] Can test content without API keys (using backend env vars)
- [ ] BYOK modal opens and saves keys
- [ ] Results display correctly
- [ ] Mobile responsive
- [ ] All animations smooth (60fps)

---

**Build Timeline**: 600s per sub-agent (backend + frontend in parallel), 300s for audit, deploy + test.
