# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OBA Mood AI** - AI-powered employee mood tracking and burnout risk monitoring system for Azerbaijani enterprises.

- **Stack:** React 18 + TypeScript + Vite (frontend), Supabase (backend/database), Google Gemini 2.5 Flash (AI)
- **Live URL:** https://oba-mood-ai.lovable.app
- **Language:** UI is in Azerbaijani; code/comments follow the project's conventions

## Development Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

**No test framework configured** - manual testing via browser.

## Architecture

### Frontend Structure
```
src/
├── components/       # React components
│   ├── ui/           # Shadcn/UI base components (do not edit manually)
│   └── charts/       # Recharts chart components
├── hooks/            # Custom React hooks
├── integrations/     # Supabase client (auto-generated - do not edit)
├── lib/              # Utilities (utils.ts, exportUtils)
└── pages/            # Route targets (14 pages)
```

### Backend Structure
```
supabase/
├── functions/        # Edge Functions (serverless)
│   ├── analyze-responses/   # AI mood analysis (POST)
│   ├── predict-risk/        # AI risk prediction (POST)
│   └── translate-content/   # Translation (no JWT)
└── migrations/       # Database schema migrations
```

### Database
Supabase/PostgreSQL with 11 tables including RLS policies:
- `employee_responses` - Anonymous mood submissions
- `burnout_alerts` - Auto-generated risk alerts
- `risk_predictions` - AI risk predictions
- `user_roles`, `manager_branches`, `manager_actions`, etc.

## Important Notes

### Auto-Generated Files (Do Not Edit Manually)
- `src/integrations/supabase/client.ts` - Supabase SDK client
- `src/integrations/supabase/types.ts` - Database types
- `supabase/config.toml` - Supabase configuration
- `.env` - Supabase credentials (auto-configured by Lovable)

### AI Integration
- Uses Lovable AI Gateway (no API key required)
- Model: Google Gemini 2.5 Flash
- Edge functions verify JWT tokens except `translate-content`
- Fallback: If AI fails, metric-based automatic analysis is returned

### Styling Conventions
- Use Tailwind semantic tokens: `bg-primary`, `text-status-good`, etc.
- Custom colors defined in `tailwind.config.ts`
- Mood score scale: Əla=100, Yaxşı=75, Normal=50, Pis=25, Çox pis=0

### Routing
14 routes in `src/App.tsx`. Auth-protected routes wrapped with `ProtectedRoute.tsx`.

## Adding Shadcn/UI Components

```bash
npx shadcn@latest add [component-name]
```

Components are configured in `components.json` and installed to `src/components/ui/`.
