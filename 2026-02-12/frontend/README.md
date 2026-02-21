# 🎭 DebateArena Frontend

A stunning, real-time debate platform where AI models battle it out with arguments. Built with React, Vite, Tailwind CSS, and Framer Motion.

## ✨ Features

- **🌑 Dark Mode** - Beautiful dark theme with glassmorphism effects
- **⚡ Real-Time** - Live WebSocket updates as debates unfold
- **🎬 Smooth Animations** - Framer Motion for buttery-smooth transitions
- **💭 Typing Indicators** - See when AI models are thinking
- **🗳️ Live Voting** - Vote on arguments in real-time
- **📱 Responsive** - Works perfectly on mobile and desktop
- **🎨 Beautiful Typography** - Inter font for crisp, modern text
- **🔵🟠 Color-Coded Sides** - Blue vs Orange for visual clarity

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and set VITE_API_URL to your backend URL

# Start dev server
npm run dev
```

Visit http://localhost:5173

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t debate-arena-frontend .
```

### Run Container

```bash
docker run -p 8080:80 \
  -e VITE_API_URL=http://your-backend:3000 \
  debate-arena-frontend
```

Visit http://localhost:8080

### Docker Compose (Recommended)

See the main project's `docker-compose.yml` for the full stack setup.

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx        # Topic input & model selection
│   │   ├── DebateArena.jsx        # Main debate view
│   │   ├── DebateHeader.jsx       # Sticky header with scores
│   │   ├── ArgumentCard.jsx       # Individual argument display
│   │   └── ThinkingIndicator.jsx  # AI thinking animation
│   ├── hooks/
│   │   └── useDebateSocket.js     # WebSocket connection logic
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── Dockerfile                     # Multi-stage production build
├── nginx.conf                     # Nginx configuration
├── tailwind.config.js             # Tailwind customization
└── vite.config.js                 # Vite configuration
```

## 🎨 Design System

### Colors

- **Blue Side**: `#3B82F6` (debate-blue-500)
- **Orange Side**: `#F97316` (debate-orange-500)
- **Dark Background**: `#030712` (dark-950)
- **Glass Effect**: `bg-white/5` with `backdrop-blur-xl`

### Typography

- **Font**: Inter (via Google Fonts)
- **Weights**: 300-800
- **Features**: Contextual alternates, stylistic sets

### Animations

- **Fade In**: Arguments appear smoothly
- **Slide Up**: Cards slide up on entry
- **Pulse Glow**: Subtle glow effects
- **Thinking**: Animated dots for AI thinking

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend WebSocket URL | `http://localhost:3000` |

### Nginx Configuration

- **Gzip Compression**: Enabled for all text assets
- **Static Caching**: 1 year for immutable assets
- **SPA Fallback**: All routes serve `index.html`
- **Health Check**: `/health` endpoint
- **Security Headers**: X-Frame-Options, CSP, etc.

## 🎯 Key Components

### useDebateSocket Hook

Manages WebSocket connection with automatic reconnection:
- `debate` - Current debate data
- `arguments` - Array of debate arguments
- `thinking` - Which model is currently thinking
- `debateComplete` - Debate finished status
- `startDebate()` - Initiate a new debate
- `vote()` - Submit a vote

### LandingPage

- Topic input with examples
- Model selection (2 required)
- Connection status indicator
- Beautiful gradient animations

### DebateArena

- Real-time argument feed
- Live vote counting
- Thinking indicators
- Completion ceremony
- Vote percentage bars

### ArgumentCard

- Color-coded by side
- Vote buttons (agree/disagree)
- Smooth enter animations
- Real-time vote updates

## 🚀 Performance

- **Vite** - Lightning-fast HMR in development
- **Code Splitting** - Automatic chunk optimization
- **Asset Optimization** - Minified JS/CSS
- **Image Optimization** - WebP support
- **Lazy Loading** - Components load on demand

## 📦 Dependencies

### Runtime
- `react` - UI library
- `react-dom` - React renderer
- `socket.io-client` - WebSocket client
- `framer-motion` - Animation library
- `lucide-react` - Icon library

### Development
- `vite` - Build tool
- `@vitejs/plugin-react` - React support
- `tailwindcss` - Utility CSS
- `autoprefixer` - CSS vendor prefixes
- `postcss` - CSS processing

## 🎭 Usage Flow

1. **Landing Page**
   - Enter debate topic
   - Select 2 AI models
   - Click "Begin Debate"

2. **Debate Arena**
   - Watch arguments appear in real-time
   - See typing indicators
   - Vote on each argument
   - View live vote counts

3. **Completion**
   - See final results
   - Winner announcement
   - Start new debate

## 🐛 Troubleshooting

### WebSocket Connection Issues

If you see "Connecting..." forever:
1. Check backend is running
2. Verify `VITE_API_URL` is correct
3. Check CORS settings on backend
4. Ensure backend WebSocket is enabled

### Build Errors

If `npm run build` fails:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check Node.js version (requires 18+)

### Docker Issues

If container won't start:
1. Check if port 80 is available
2. Verify environment variables
3. Check nginx logs: `docker logs <container-id>`

## 🌟 Credits

Built with love for the AI debate revolution.

**Inspiration:**
- Linear.app - Clean, fast UI
- Vercel - Glassmorphism & gradients
- Stripe - Typography-first design

**Tech Stack:**
- React + Vite
- Tailwind CSS
- Framer Motion
- Socket.io
- Nginx

---

**Made for Daily Apps - February 12, 2026**
