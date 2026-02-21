# PaperPlain - AI Research Paper Explainer

**Viral Trend:** GPT-5.2 derives new result in theoretical physics (452 points on HN, 306 comments)

**Concept:** Paste an arXiv link or upload a PDF research paper, get an AI-generated breakdown that anyone can understand.

---

## Features

### Core Functionality
1. **Input Methods:**
   - Paste arXiv URL (auto-fetch paper)
   - Upload PDF file
   - Default example: OpenAI GPT-5.2 physics paper

2. **AI Analysis:**
   - **TL;DR** - One sentence summary
   - **Key Findings** - Bullet points of main results
   - **Methodology** - How they did it
   - **Implications** - Why it matters
   - **ELI5** - Explain like I'm 5
   - **Related Work** - Papers to read next

3. **Output:**
   - Beautiful card-based layout
   - Animated section reveals
   - Copy individual sections
   - Export as markdown
   - Share link (if we implement storage)

### BYOK Settings Panel (MANDATORY)
- Gear icon (top-right)
- API key inputs: OpenAI, Anthropic
- Provider selection (default: OpenAI)
- Model selection dropdown
- Green/red status dots
- localStorage storage
- Custom headers: X-AI-Provider, X-AI-API-Key

---

## Tech Stack

### Backend (Node/Express)
- `/api/explain` - Main endpoint
  - Accept: arXiv URL, PDF upload, raw text
  - Fetch paper from arXiv if URL provided
  - Extract text from PDF if uploaded
  - Send to AI with structured prompt
  - Return JSON with all sections
- `/health` - Health check
- Accept per-request API keys via headers (X-AI-Provider, X-AI-API-Key)
- Fallback to .env keys if headers not provided
- PDF parsing: pdf-parse npm package
- arXiv fetch: axios + xml2js for API

### Frontend (React + Tailwind + Framer Motion)
- **Design:** Dark mode, gradient backgrounds (purple/blue), glassmorphism cards
- **Typography:** Inter font, large headings, readable body text
- **Animations:** Fade in sections, smooth transitions, loading skeleton
- **Layout:** 
  - Hero: Large input area + example button
  - Results: Card-based sections with expand/collapse
  - Settings: Modal with BYOK fields
- **Components:**
  - Input card (URL/upload/paste)
  - Loading state (animated gradient)
  - Results cards (each section)
  - Copy buttons
  - Settings modal

---

## Port Allocation
- Frontend: 3107 (nginx)
- Backend: 3108

---

## Example Flow
1. User lands on page
2. Sees "Try the viral GPT-5.2 physics paper" button
3. Clicks → loads OpenAI paper URL
4. Backend fetches from arXiv
5. Sends to AI: "Explain this paper in these sections..."
6. Beautiful animated reveal of results
7. User can copy sections, share, or try another paper

---

## Design Inspiration
- Linear.app (clean, minimal)
- Vercel (gradient backgrounds)
- Stripe (glassmorphism cards)
- Framer Motion (smooth animations)

---

## Deployment
- Docker Compose
- nginx for frontend
- Node backend
- All ports consistent across configs
- Health endpoint mandatory
- Startup wait: 15 seconds
- Tests: curl health + main page

---

## Success Metrics
- Can explain GPT-5.2 physics paper (default example)
- Can handle any arXiv URL
- Can parse uploaded PDFs
- Beautiful UI rivals Linear/Vercel
- BYOK panel fully functional
- All tests pass on first deploy
