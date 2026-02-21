# VulnScout - AI-Powered Dependency Vulnerability Scanner

## Inspiration
Claude Opus 4.6 just found 500+ previously unknown high-severity security flaws in open-source libraries (Feb 6, 2026). This went viral across Hacker News and security communities.

## Concept
A beautiful web app that analyzes dependency files (package.json, requirements.txt, go.mod, etc.) for known vulnerabilities and potential security issues using AI analysis + public CVE databases.

## Core Features
1. **File Upload/Paste** - Support multiple dependency file formats
2. **Real-time Scanning** - Analyze dependencies against NVD/OSV databases
3. **AI Analysis** - Use AI to explain vulnerabilities in plain English
4. **Risk Scoring** - Visual severity indicators (Critical/High/Medium/Low)
5. **Remediation Suggestions** - Actionable fix recommendations

## Tech Stack

### Backend
- Node.js + Express
- API endpoints:
  - `POST /api/scan` - Upload/paste dependency file
  - `GET /api/scan/:id` - Get scan results
  - `GET /health` - Health check
- Integration with OSV.dev API (open-source vulnerability database)
- AI integration for analysis (use OpenAI or Anthropic)

### Frontend
- React + Vite
- Framer Motion for animations
- Design inspiration: Linear/Vercel aesthetic
- Features:
  - Drag-and-drop file upload
  - Code editor for paste
  - Real-time scan progress
  - Beautiful vulnerability cards
  - Export results as PDF/JSON

## Design Requirements
- **Dark mode first** - Deep blacks with accent colors
- **Glassmorphism** - Frosted glass effects on cards
- **Typography** - Inter or Geist font, crisp hierarchy
- **Animations** - Smooth transitions, loading states with Framer Motion
- **Color coding** - Red (Critical), Orange (High), Yellow (Medium), Blue (Low)
- **Empty states** - Beautiful illustrations/messaging
- **Responsive** - Works on all screen sizes

## User Flow
1. Land on homepage with hero section + file drop zone
2. Upload or paste dependency file
3. Scan initiates with progress indicator
4. Results appear as animated cards
5. Click any vulnerability for detailed explanation
6. Export or share results

## Environment Variables
- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - For AI analysis
- `PORT` - Server port (3100+)
- `NODE_ENV` - production/development

## Deployment
- Docker Compose on plex
- Nginx reverse proxy
- Health check endpoint
- Graceful shutdown handling

## Success Metrics
- All health checks pass
- Main page loads < 2s
- Scan completes < 10s for typical file
- Zero console errors
- Beautiful on first impression
