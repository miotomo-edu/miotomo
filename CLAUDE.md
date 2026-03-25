# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server on port 3000 (proxies /api → localhost:3001)
npm run build      # Production build
npm run preview    # Serve production build locally
npm run lint       # ESLint with TypeScript support
npm run prettier   # Format code
```

No automated tests exist yet. The README recommends Vitest + React Testing Library when tests are added.

## Environment Setup

Requires `.env.local` with:
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the database
- `VITE_PIPECAT_URL` for the voice AI backend

## URL Parameters (useful for development)

- `?skipOnboarding=1` — Skip landing/onboarding, jump straight to Library
- `?transport=daily` — Use Daily.co WebRTC transport (default: Small WebRTC)
- `?studentId=<id>` — Override the hardcoded student ID

## Architecture

**What it is:** An AI-powered reading companion app for children (ages 6-12) that enables real-time voice conversations with AI characters while reading books.

**Stack:** React 19 + Vite, TypeScript (migration from JSX in progress), TailwindCSS v4, Pipecat AI (WebRTC voice), Supabase (PostgreSQL), React Query (TanStack Query).

### Routing

No router library — routing is pure React state in `src/components/App.jsx` via an `activeComponent` variable. Navigation happens through callbacks (`onContinue`, `onBack`, `onOpenCircle`, `onPlayEpisode`) and a bottom nav bar. Scroll positions are saved/restored per-route via `scrollPositionsRef`.

### State Management

Two patterns:

1. **VoiceBot Context** (`src/context/VoiceBotContextProvider.tsx`) — `useReducer`-based context for the real-time voice session state: bot status (listening/thinking/speaking/sleeping), message history with latency metrics, sleep timer, and Pipecat server events. Consumed via `useVoiceBot()`.

2. **React Query** — All Supabase data fetching (student, books, conversations, progress). Hooks live in `src/hooks/integrations/supabase/`.

### Voice Pipeline

Pipecat handles the WebRTC voice connection. The flow: user speaks → Deepgram STT → LLM → Deepgram TTS → audio playback. `usePipecatConnection()` manages the connection; `usePipecatStatus()` tracks readiness. The bot has a sleep/wake state machine — it auto-sleeps after 30 seconds of inactivity and requires explicit voice input to wake.

### Character & Modality System

`src/lib/characters.ts` defines the AI characters (Tomo the cat, Sparko the octopus, Argu the fox, Wordie the panda, Echo the parrot). Each character maps to a learning modality (vocabulary, debating, storytelling, spelling, teachtime) and has associated Deepgram voice config and SVG avatars for each state (idle/listening/sleeping/celebrating). Character selection drives the entire conversation experience.

### Data Persistence

Supabase tables: `students`, `books`, `conversations`, `dot_progress`. Conversations auto-save with elapsed time, full transcript, and dot progress on session end.

### Dynamic Backgrounds

`TalkWithBook.tsx` uses `import.meta.glob()` to load discussion backgrounds per book from `src/assets/img/discussion/{bookId}/{modality}/`. Supports landscape/portrait orientations with fallbacks.

### Path Alias

`@` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`).
