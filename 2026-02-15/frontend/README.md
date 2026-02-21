# ViralCheck Frontend

A gorgeous React frontend for testing content virality using AI personas.

## Features

✨ **Premium UI/UX**
- Dark mode with purple/blue gradient backgrounds
- Glassmorphism panels with frosted glass effects
- Smooth Framer Motion animations throughout
- Inter/SF Pro typography for clean tech aesthetic
- Mobile-first responsive design

🎭 **Real-time Persona Voting**
- Staggered card animations as personas "vote"
- Visual feedback with thumbs up/down
- Progress bars showing analysis in real-time

📊 **Results Display**
- Animated virality score counter
- Recharts pie chart for voting distribution
- Top persona reactions with sentiment indicators
- AI-generated improvement suggestions
- Share functionality

🔑 **BYOK Settings**
- Bring Your Own Key modal
- Support for OpenAI and Anthropic APIs
- Local storage for keys
- Headers-based authentication
- Status indicators (green/red dots)

## Tech Stack

- **React 18** - Latest React with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Beautiful charts
- **Lucide React** - Clean icon set
- **Axios** - HTTP client

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Docker

```bash
# Build image
docker build -t viralcheck-frontend .

# Run container
docker run -p 80:80 \
  -e VITE_API_URL=http://localhost:3100 \
  viralcheck-frontend
```

## Environment Variables

- `VITE_API_URL` - Backend API endpoint (default: http://localhost:3100)

## Design Philosophy

This frontend is built to look like a $50k product:

1. **Glassmorphism** - Frosted glass panels that feel premium
2. **Smooth animations** - Everything animated at 60fps
3. **Gradient backgrounds** - Dynamic purple/blue tech vibes
4. **Micro-interactions** - Hover effects, scale transforms, glow effects
5. **Typography** - Inter font with proper weights and spacing
6. **Spacing** - Generous whitespace and consistent rhythm
7. **Responsive** - Mobile-first, looks great on all devices
8. **Accessibility** - Proper contrast, focus states, semantic HTML

Inspired by Linear, Vercel, and Stripe's design systems.
