# Miotomo

Miotomo is an AI reading companion for 6–12 year olds. Kids pick a book, tap a character modality (vocabulary, debating, storytelling, spelling), and hold a real-time voice conversation powered by Pipecat (which in turn calls Deepgram for STT/TTS). Parents, teachers, and publishers gain Supabase-backed insights into progress while the UI stays lightweight enough to run on any modern browser.

## Highlights
- **Voice pipeline** – `PipecatClientProvider` wraps the app in `src/main.tsx`, `TalkWithBook` + `usePipecatConnection` switch between Daily or Small WebRTC transports, and `VoiceBotContext` tracks transcripts, sleep state, and manual log messages.
- **Character modalities** – `src/lib/characters.ts` defines avatars, accent colors, celebration art, and modality metadata; the talk screen inherits the color and surfaces modality-specific panels like `VocabularyPanel`.
- **Prompt system** – Pipecat now owns the full prompt; the frontend simply passes book/chapter/character metadata. Keep any new prompt experiments in `src/lib` for reference or backend handoff.
- **Supabase integration** – `useStudent`, `useConversations`, and `useProgress` hydrate dashboards and persist transcripts (see `src/hooks/integrations/supabase`).
- **Circle page** – Tapping a book opens the circle page with episode titles and Play buttons; Play jumps straight into the chat with the chosen episode.
- **Browse experience** – Home/Library render a Netflix-style stack of rows driven by `circles_catalog`, `books`, and `dot_progress`.

## Tech Stack
React 18 · Vite 6 · TypeScript (UI is mid-migration from JSX) · TailwindCSS · @pipecat-ai client, transports, and React bindings (Deepgram-powered STT/TTS) · Supabase · React Query · TanStack Query for data fetching.

## Getting Started
1. **Requirements** – Node 20+ and npm 10+. Install ffmpeg if you need to record custom audio assets.
2. **Install** – Clone the repo and run `npm install`.
3. **Environment** – Create `.env.local` with:
   ```
   VITE_SUPABASE_URL=<your-project-url>
   VITE_SUPABASE_ANON_KEY=<your-anon-key>
   VITE_DAILY_PROXY_URL=<https endpoint returning room_url + token>
   VITE_SMALL_WEBRTC_URL=<Pipecat offer endpoint>
   ```
   The GitHub Pages workflow expects the same variables (store them as repository secrets). The generated Supabase client currently ships with placeholder values; override them via env vars before shipping or point the client at `import.meta.env` in your fork.
4. **Run** – `npm run dev` launches Vite on `http://localhost:5173`. Append `?transport=daily` to test the Daily SDK; the default path uses Small WebRTC.

## Useful Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR. |
| `npm run build` | Production build (must pass before PRs). |
| `npm run preview` | Serve the build for local smoke tests. |
| `npm run lint` | ESLint with unused-disable detection. |
| `npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,md}"` | Format code & Markdown. |

## Architecture Overview
- `src/components/App.jsx` – Handles navigation (Landing → Onboarding → Library/Home/Map → Talk), wires book + character selection, and mirrors the chosen character’s accent color across the view.
- `src/components/TalkWithBook.jsx` – Conversation surface: subscribes to RTVI events, controls mic state, and pushes updates into `VoiceBotContext`.
- `src/context/VoiceBotContextProvider.tsx` – Stores transcripts, latency metrics, sleep/thinking/speaking state, and auto-save behavior.
- `src/hooks` – Reusable data hooks; notable ones are `usePipecatConnection` (connect/disconnect wrapper), `useConversations` (Supabase persistence), and `useStudent` (progress + streaks).
- `src/components/sections` – Library, Map (modality picker), Progress, Rewards, Settings, etc.
- `src/components/sections/BrowsePage.tsx` – Netflix-style browse rows (featured, continue, new, theme/mood/length/domain) driven by `useBrowseCircles`.
- `src/lib` – Prompt markdown files, constants, characters, and Pipecat config helpers.
- `src/styles` – Tailwind entry + shared CSS (e.g., `.app-mobile-shell`, microphone animations).
- `src/components/sections/CirclePage.tsx` – Circle detail page with cover/title and episode list; Play routes directly into the chat.

```
src
├── components        # Screens, layout, and voice UI
├── context           # VoiceBot global store
├── hooks             # Supabase + Pipecat helpers
├── lib               # Prompt variants and constants
├── styles            # Tailwind/global CSS
├── utils             # Misc helpers (mock data, etc.)
```

## Voice + Prompt Flow
1. `App` opens the circle page after a book tap; readers pick an episode and Play to jump into the chat with the selected chapter metadata.
2. `App` selects a book + character and feeds metadata into `TalkWithBook`.
2. `TalkWithBook` plays the circle intro audio locally, waits for `BotReady`, syncs the mic, sends `start-chat`, and renders the server-side event feed (`VocabularyPanel` etc.).
3. Avatar clicks pause/resume chat and send RTVI `pauseListening`/`resumeListening` control messages; intro controls stay disabled during active chat.
4. `useConversation` (features/voice) merges bot and user utterances for display and analytics, while `VoiceBotContext` records latency and behind-the-scenes events.
5. When Pipecat emits `celebration_sent`, `AnimationManager` swaps the character into its thumbs-up pose so the avatar keeps celebrating through the end of the session.
6. Prompts can still be prototyped in `src/lib/*.md`, but the production bot prompt lives in Pipecat—document any backend updates in `AGENTS.md`.

## Data & Persistence
- Supabase tables: `students`, `books`, `conversations`, `dot_progress`. `dot_progress` tracks per-dot listening/talking status and elapsed seconds for the circle list UI.
- Update `src/hooks/integrations/supabase/types.ts` via your preferred generator when schema changes.

## Testing & QA
Automated tests are not present yet. Add Vitest + React Testing Library tests alongside components (`Component.test.tsx`) and run them before shipping. Always verify the voice flow manually with two browser tabs to ensure WebRTC tracks, transcripts, and mic controls behave as expected.

## Contributing
Refer to `AGENTS.md` for contributor guidelines (project structure, coding style, PR expectations, and security tips). Pull requests should include lint results, screenshots/Looms for UI or audio updates, and a note confirming no secrets were added.
