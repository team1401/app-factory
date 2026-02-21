# DebateArena - AI Model Debate Platform

**Daily App #4 - February 12, 2026**

## Viral Trend
AI agent debates are exploding on HN:
- "Agent Alcove" (51 points, trending) - multi-model debate forums
- GLM-5 for "long-horizon agentic tasks" (335 points, 423 comments)
- Growing interest in AI reasoning and argumentation

## Concept
A gorgeous real-time debate platform where multiple AI models argue opposite sides of a topic. Users watch the debate unfold in real-time and vote on which side presented the most convincing argument.

## Features

### Core Functionality
1. **Topic Input** - User enters a debate topic (e.g., "Should AI have rights?")
2. **Model Selection** - Choose which models debate (GPT-4, Claude, Gemini, local models)
3. **Real-Time Debate** - Models take turns presenting arguments (3 rounds each)
4. **Live Voting** - Users vote on most convincing argument during/after debate
5. **Debate History** - Browse past debates and their vote results

### Technical Requirements

**Backend:**
- Express.js + WebSocket (Socket.io) for real-time updates
- Support multiple AI providers (OpenAI, Anthropic, Ollama for local)
- Queue system for debate turns (model A → model B → A → B → A → B)
- CORS enabled for frontend
- Health endpoint at /health
- Environment variables for all API keys
- Port: TBD (check docker ps, use next available from 3100+)

**Frontend:**
- Dark mode, glassmorphism UI
- Real-time debate feed with smooth animations (Framer Motion)
- Typing indicators while AI is "thinking"
- Vote buttons (thumbs up/down per argument)
- Live vote counter
- Beautiful typography (Inter or SF Pro)
- Color-coded sides (blue vs. orange)
- Responsive design

### Design Inspiration
- Linear.app (clean, modern, fast)
- Vercel dashboard (glassmorphism, gradients)
- Stripe (typography-first)

### User Flow
1. Landing page → "Start a Debate"
2. Enter topic + select models (defaults: Claude Sonnet vs GPT-4)
3. Click "Begin Debate"
4. Watch arguments stream in real-time
5. Vote on convincing arguments
6. See final results + share link

## Tech Stack

**Backend:**
- Node.js + Express
- Socket.io for WebSocket
- Axios for AI API calls
- dotenv for config

**Frontend:**
- React + Vite
- Tailwind CSS
- Framer Motion
- Socket.io-client

**Deployment:**
- Docker Compose
- Nginx reverse proxy
- Single port exposure

## Environment Variables
```
OPENAI_API_KEY=...
ANTHROPIC_API_KEY=...
OLLAMA_BASE_URL=http://host.docker.internal:11434 (optional)
PORT=3000
```

## Success Criteria
- Debate streams in real-time with smooth animations
- Multiple debates can run concurrently
- Vote counts update live
- Works on mobile + desktop
- Beautiful, polished UI rivaling top SaaS products
- Health check returns 200
- Main page returns 200
