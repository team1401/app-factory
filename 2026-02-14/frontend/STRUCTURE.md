# PaperPlain Frontend - Project Structure

```
frontend/
├── public/
│   └── vite.svg                 # Favicon placeholder
├── src/
│   ├── components/
│   │   ├── Hero.jsx            # Input section (URL/Upload/Paste)
│   │   ├── Results.jsx         # Beautiful results cards
│   │   ├── LoadingState.jsx    # Animated loading screen
│   │   └── SettingsModal.jsx   # BYOK settings panel
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # React entry point
│   └── index.css               # Tailwind + custom styles
├── Dockerfile                   # Multi-stage production build
├── nginx.conf                   # Production nginx config
├── package.json                 # Dependencies & scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind theme & extensions
├── postcss.config.js           # PostCSS setup
├── index.html                  # HTML entry point
├── .dockerignore               # Docker build exclusions
├── .gitignore                  # Git exclusions
└── README.md                   # Documentation

```

## Component Hierarchy

```
App
├── Settings Button (top-right)
├── Header (animated title)
├── Hero (conditional: !results && !loading)
│   ├── Example Button (GPT-5.2 paper)
│   ├── Input Tabs (URL/Upload/Paste)
│   │   ├── URL Input Form
│   │   ├── File Upload Zone
│   │   └── Text Textarea
│   └── Error Display
├── LoadingState (conditional: loading)
│   ├── Animated Brain Icon
│   ├── Progress Bar
│   └── Skeleton Cards
├── Results (conditional: results)
│   ├── Header with Reset Button
│   ├── Results Grid
│   │   ├── TL;DR Card
│   │   ├── Key Findings Card
│   │   ├── Methodology Card
│   │   ├── Implications Card
│   │   ├── ELI5 Card
│   │   └── Related Work Card
│   └── Export Options
└── SettingsModal (conditional: showSettings)
    ├── API Key Inputs
    │   ├── OpenAI (with status dot)
    │   └── Anthropic (with status dot)
    ├── Provider Selection
    ├── Model Dropdown
    └── Save Button
```

## Design System

### Colors
- **Background**: `slate-950` base with gradient overlay
- **Glass cards**: `rgba(15, 23, 42, 0.6)` with backdrop blur
- **Primary gradient**: `violet-400 → purple-400 → blue-400`
- **Accents**: `violet-600`, `blue-600`
- **Text**: `slate-100` (primary), `slate-400` (secondary)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: `text-6xl`/`7xl` font-bold
- **Body**: `text-lg` with relaxed leading
- **Labels**: `text-sm` font-medium

### Animations (Framer Motion)
- **Fade in**: opacity 0→1, y 20→0
- **Stagger children**: 0.1s delay
- **Float**: translateY oscillation
- **Gradient**: background-position animation
- **Hover**: scale 1.02, smooth transitions

### Spacing
- **Cards**: `p-6`/`p-8` with `rounded-2xl`/`3xl`
- **Gaps**: `gap-6` for grids, `gap-3` for buttons
- **Container**: `max-w-5xl` centered

## API Integration

### Request Flow
1. User submits input (URL/file/text)
2. Settings loaded from localStorage
3. FormData constructed with appropriate field
4. Headers added: `X-AI-Provider`, `X-AI-API-Key`
5. POST to `http://localhost:3108/api/explain`
6. Response parsed and displayed in Results

### Error Handling
- Network errors → error message displayed
- API errors → backend error message shown
- Missing API key → Settings modal prompts user

## State Management

### Local State (useState)
- `results` - AI analysis results
- `loading` - Loading indicator
- `error` - Error message
- `showSettings` - Settings modal visibility

### Persistent State (localStorage)
- `paperplain-settings` - JSON object with:
  - `openaiKey`
  - `anthropicKey`
  - `provider` (openai/anthropic)
  - `model` (gpt-4o/claude-opus-4/etc)
  - `apiKey` (computed based on provider)

## Production Build

### Multi-Stage Dockerfile
1. **Stage 1 (builder)**: Node 20 Alpine
   - Install deps
   - Run `npm run build`
   - Output to `/app/dist`

2. **Stage 2 (production)**: Nginx Alpine
   - Copy nginx.conf
   - Copy built files from builder
   - Expose port 80
   - Health check on `/health`

### Nginx Features
- Gzip compression
- Security headers
- Static asset caching (1 year)
- SPA fallback (all routes → index.html)
- Optional API proxy to backend
- Health check endpoint

## Performance Optimizations

- **Code splitting**: Vite automatic chunks
- **Tree shaking**: Unused code eliminated
- **Minification**: JS/CSS minified in production
- **Lazy loading**: Framer Motion animations
- **Font optimization**: Google Fonts with preconnect
- **Image optimization**: SVG icons (lucide-react)

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Focus states on interactive elements
- ARIA labels where needed
- High contrast text (WCAG AA+)

## Browser Compatibility

Targets modern browsers with:
- ES2020 features
- CSS Grid & Flexbox
- Backdrop filter (glassmorphism)
- CSS custom properties
- Fetch API

Graceful degradation for:
- Backdrop filter → solid background fallback
- Animations → reduced motion query support
