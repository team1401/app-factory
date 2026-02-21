# Agent Rep Check - Frontend

A beautiful, glassmorphic React frontend for monitoring what AI agents are saying about you online.

## Features

- 🔑 **BYOK Settings Panel** - Bring Your Own API Keys (OpenAI, Anthropic, Brave)
- 🔍 **Multi-Source Search** - GitHub, Web, Social Media
- 📊 **Risk Score Visualization** - Interactive doughnut chart with sentiment analysis
- ⏱️ **Timeline View** - Chronological display of AI agent mentions
- 🎨 **Glassmorphic Design** - Dark mode with purple/blue gradients
- ✨ **Smooth Animations** - Framer Motion powered transitions
- 📱 **Responsive** - Mobile-friendly design

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Chart.js
- Lucide React Icons

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

```bash
# Build image
docker build -t agent-rep-check-frontend .

# Run container
docker run -p 3000:80 agent-rep-check-frontend
```

## Environment

No environment variables needed - all API keys are stored in browser localStorage and sent via custom headers.

## API Integration

The frontend expects the backend to be available at `/api/*` endpoints. In production, nginx proxies these requests to the backend service.

### Custom Headers (BYOK)

- `X-OpenAI-Key` - OpenAI API key
- `X-Anthropic-Key` - Anthropic API key  
- `X-Brave-Key` - Brave Search API key (optional)

## Design Philosophy

This app follows the design principles of Linear, Vercel, and Stripe:

- Clean, minimalist interface
- Smooth, purposeful animations
- High contrast for readability
- Glassmorphism for depth
- Purple/blue gradient accents
- Responsive and accessible

## License

MIT
