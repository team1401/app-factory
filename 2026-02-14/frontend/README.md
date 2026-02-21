# PaperPlain Frontend

A stunning React frontend for AI-powered research paper explanation. Built with Vite, Tailwind CSS, and Framer Motion.

## Design Philosophy

This frontend rivals Linear/Vercel/Stripe in polish with:
- **Dark mode** with purple/blue gradients
- **Glassmorphism** cards with backdrop blur
- **Framer Motion** animations throughout
- **Inter font** for clean typography
- **Responsive design** that works beautifully on all devices

## Features

### Input Methods
- 📎 **arXiv URL** - Paste any arXiv paper link
- 📄 **PDF Upload** - Drag & drop or browse
- 📝 **Text Paste** - Copy/paste paper content

### Beautiful Results Display
- ⚡ **TL;DR** - One sentence summary
- 🔬 **Key Findings** - Main results
- 🧪 **Methodology** - How they did it
- 💡 **Implications** - Why it matters
- 🎈 **ELI5** - Explain like I'm 5
- 📚 **Related Work** - Papers to read next

### BYOK Settings
- 🔑 OpenAI & Anthropic API key management
- 🎯 Provider selection (OpenAI/Anthropic)
- 🤖 Model dropdown
- 🟢/🔴 Status indicators
- 💾 localStorage persistence
- 🔒 Client-side only (keys never sent to our servers)

## Tech Stack

- **React 18** - Latest React with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **Axios** - API calls

## Development

```bash
# Install dependencies
npm install

# Run dev server (port 3107)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker Deployment

```bash
# Build image
docker build -t paperplain-frontend .

# Run container
docker run -p 80:80 paperplain-frontend
```

The Dockerfile uses multi-stage builds:
1. **Builder stage** - Installs deps and builds with Vite
2. **Production stage** - Serves with nginx on port 80

## Environment

- **Backend API**: `http://localhost:3108/api`
- **Dev Port**: 3107
- **Production Port**: 80 (nginx)

## Custom Headers

The app sends per-request API credentials via headers:
- `X-AI-Provider` - Selected provider (openai/anthropic)
- `X-AI-API-Key` - User's API key from settings

This allows BYOK (Bring Your Own Key) without server-side storage.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
