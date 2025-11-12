# Repository Guidelines

## Project Structure & Module Organization
Miotomo is a Vite + React voice companion. Static assets stay in `public/`; builds land in `dist/`. Within `src/`, UI lives in `components/` (voice transports under `components/features/voice`), prompts plus Deepgram/Pipecat constants live in `lib/`, shared state in `context/`, reusable hooks in `hooks/`, Tailwind entry points in `styles/`, helpers in `utils/`, and media under `assets/img`. Keep new prompt experiments in `src/lib/` and document variants at the top of each file.

## Build, Test, and Development Commands
- `npm run dev` – Start the Vite dev server on `http://localhost:5173`; append `?transport=daily` to toggle the Daily transport.
- `npm run build` – Produce the optimized bundle in `dist/`; this must succeed before a PR leaves draft.
- `npm run preview` – Serve the built assets locally to smoke-test WebRTC flows.
- `npm run lint` – Run ESLint over `ts,tsx`; fix or explain all findings.
- `npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,md}"` – Enforce formatting before commits.

## Coding Style & Naming Conventions
Write new UI in TypeScript (`.tsx`) and convert legacy `.jsx` files when touching them. Components, hooks, and contexts use PascalCase (`BookShelfPanel.tsx`, `useTransport.ts`); utilities are camelCase; prompts follow `book-companion-prompt-{variant}.md`. Prefer 2-space indentation, named exports, React function components with typed props, and consistent Tailwind ordering (layout → spacing → typography) to keep diffs readable.

## Testing Guidelines
Automated tests are not wired up yet, so introduce Vitest + React Testing Library colocated as `Component.test.tsx` or `__tests__/*.test.tsx`. Cover new logic with at least one interaction or transport scenario and aim for roughly 80% statement coverage via `vitest run --coverage`. Manual voice verification remains required: run `npm run dev`, open two tabs, connect once per tab, and watch the transcript logs streamed from `src/main.tsx`.

## Commit & Pull Request Guidelines
Follow the concise, imperative style already in `git log` (`added a vocabulary panel`, `Supporting multiple characters`) and add scopes when helpful (`voice: improve daily transport`). PRs must include a short description, screenshots or Loom for UI/audio work, linked issue, lint/test evidence, and confirmation that no secrets or large media files slipped into the diff.

## Security & Configuration Tips
Keep Deepgram, Supabase, and Pipecat credentials in `.env.local` (loaded via `import.meta.env`). The generated Supabase client at `src/hooks/integrations/supabase/client.ts` currently carries placeholder values—swap them for env-driven values locally and never commit real keys. Never check in raw child transcripts. Document any transport/prompt changes in both this file and `README.md` so every agent shares the same voice setup.
