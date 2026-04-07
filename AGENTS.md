# Repository Guidelines

## Project Structure & Module Organization
Miotomo is a Vite + React voice companion. Static assets stay in `public/`; builds land in `dist/`. Within `src/`, UI lives in `components/` (voice transports under `components/features/voice`, circle pages under `components/sections/`), prompts plus Deepgram/Pipecat constants live in `lib/`, shared state in `context/`, reusable hooks in `hooks/`, Tailwind entry points in `styles/`, helpers in `utils/`, and media under `assets/img`. Pipecat now owns the production prompt—keep experiments or handoff drafts in `src/lib/` and document variants at the top of each file.

### Voice & Flow Notes
- `skipOnboarding=1` (or `true`) in the URL opens the app directly on Library; default startup still shows Landing + Onboarding.
- `preview=circle-page|vocab-intro|vocab-game|dot-complete|circle-complete|vocab-complete|spelling-intro|spelling-game|spelling-complete` opens the matching hard-to-reach UI directly for development. `circle-page` should use the current student circle when browse data is available. Optional params: `previewName`, `previewDot`, `previewTotalDots`, `previewBookTitle`, `studentId`.
- After a reader taps a book anywhere in the Library/Home experience, open the circle page with the episode list; Play goes directly to the chat for the chosen episode.
- When Pipecat sends `celebration_sent`, the character avatar swaps to its thumbs-up art; only emit that event when the celebration should persist through the rest of the session.
- Dot completion and phase status live in `dot_progress` (listening/talking statuses + elapsed seconds) and are updated by the frontend during intro/chat.
- Intro audio is played locally; the avatar is not clickable during intro playback. Intro controls are enabled during intro and chat-paused, and disabled during chat-active.
- Avatar pause/resume sends RTVI control messages (`pauseListening` with optional `reason`/`max_pause_s`, `resumeListening` on resume).
- The browse/home experience is built from `circles_catalog` + `books`, with `dot_progress` powering the Continue row.
- Vocabulary/Spelling games show `PreGameScreen` before gameplay; the CTA transitions into the game flow.
- Warm-up pings run through `useAnalytics.wakeAnalytics()`: they call analytics status (`${ANALYTICS_BASE_URL}/analytics-status`) and vocabulary readiness (`https://miotomo-vocabulary.onrender.com/ready`) on app start, every 45 seconds, and again on `BotReady` to reduce Render/edge cold starts.

## Build, Test, and Development Commands
- `npm run dev` – Start the Vite dev server on `http://localhost:5173`; append `?transport=daily` to toggle the Daily transport, `?skipOnboarding=1` to jump straight to Library for QA, and `?preview=...` to jump straight to completion screens while styling/debugging them.
- `npm run build` – Produce the optimized bundle in `dist/`; this must succeed before a PR leaves draft.
- `npm run preview` – Serve the built assets locally to smoke-test WebRTC flows.
- `npm run lint` – Run ESLint over `ts,tsx`; fix or explain all findings.
- `npx prettier --write "src/**/*.{ts,tsx,js,jsx,css,md}"` – Enforce formatting before commits.
- TODO: Add any new game-specific dev commands when introduced.

## Coding Style & Naming Conventions
Write new UI in TypeScript (`.tsx`) and convert legacy `.jsx` files when touching them. Components, hooks, and contexts use PascalCase (`BookShelfPanel.tsx`, `useTransport.ts`); utilities are camelCase; prompts follow `book-companion-prompt-{variant}.md`. Prefer 2-space indentation, named exports, React function components with typed props, and consistent Tailwind ordering (layout → spacing → typography) to keep diffs readable.

## Testing Guidelines
Automated tests are not wired up yet, so introduce Vitest + React Testing Library colocated as `Component.test.tsx` or `__tests__/*.test.tsx`. Cover new logic with at least one interaction or transport scenario and aim for roughly 80% statement coverage via `vitest run --coverage`. Manual voice verification remains required: run `npm run dev`, open two tabs, connect once per tab, and watch the transcript logs streamed from `src/main.tsx`.

## Commit & Pull Request Guidelines
Follow the concise, imperative style already in `git log` (`added a vocabulary panel`, `Supporting multiple characters`) and add scopes when helpful (`voice: improve daily transport`). PRs must include a short description, screenshots or Loom for UI/audio work, linked issue, lint/test evidence, and confirmation that no secrets or large media files slipped into the diff.

## Security & Configuration Tips
Keep Deepgram, Supabase, and Pipecat credentials in `.env.local` (loaded via `import.meta.env`). The generated Supabase client at `src/hooks/integrations/supabase/client.ts` currently carries placeholder values—swap them for env-driven values locally and never commit real keys. Never check in raw child transcripts. Document any transport/prompt changes in both this file and `README.md` so every agent shares the same voice setup.

<!-- code-review-graph MCP tools -->
## MCP Tools: code-review-graph

**IMPORTANT: This project has a knowledge graph. ALWAYS use the
code-review-graph MCP tools BEFORE using Grep/Glob/Read to explore
the codebase.** The graph is faster, cheaper (fewer tokens), and gives
you structural context (callers, dependents, test coverage) that file
scanning cannot.

### When to use graph tools FIRST

- **Exploring code**: `semantic_search_nodes` or `query_graph` instead of Grep
- **Understanding impact**: `get_impact_radius` instead of manually tracing imports
- **Code review**: `detect_changes` + `get_review_context` instead of reading entire files
- **Finding relationships**: `query_graph` with callers_of/callees_of/imports_of/tests_for
- **Architecture questions**: `get_architecture_overview` + `list_communities`

Fall back to Grep/Glob/Read **only** when the graph doesn't cover what you need.

### Key Tools

| Tool | Use when |
|------|----------|
| `detect_changes` | Reviewing code changes — gives risk-scored analysis |
| `get_review_context` | Need source snippets for review — token-efficient |
| `get_impact_radius` | Understanding blast radius of a change |
| `get_affected_flows` | Finding which execution paths are impacted |
| `query_graph` | Tracing callers, callees, imports, tests, dependencies |
| `semantic_search_nodes` | Finding functions/classes by name or keyword |
| `get_architecture_overview` | Understanding high-level codebase structure |
| `refactor_tool` | Planning renames, finding dead code |

### Workflow

1. The graph auto-updates on file changes (via hooks).
2. Use `detect_changes` for code review.
3. Use `get_affected_flows` to understand impact.
4. Use `query_graph` pattern="tests_for" to check coverage.
