# Episode Video Player — Architecture Plan

During episode playback (`intro_playing` phase in `TalkWithBook.tsx`), the app currently
shows a single static `talk.png` background. This plan replaces that with synchronized
scene videos that crossfade as the active speaker changes, driven by the episode script's
timing data.

---

## Mental model

Each clip is a **full scene** — it shows the active speaker talking with all other
characters visible and listening in frame. There is no isolated per-character clip.

```
leo_speaking.mp4   →  Leo talking, Maya in frame listening
maya_speaking.mp4  →  Maya talking, Leo in frame listening
```

At any moment exactly one clip plays. When the script's active speaker changes, the
player crossfades to the new speaker's clip.

This means there is a **single video player** — not one per character.

---

## Goals

- Crossfade between scene clips as the active speaker changes
- Work for any number of speakers (N-speaker generic)
- Keep implementation layered and decoupled from `TalkWithBook.tsx` internals

---

## Asset convention

Clips are scoped to a book because the same character can appear across stories with
different costumes, sets, or lighting:

```
src/assets/video/episodes/{book_id}/{speaker_slug}_speaking.mp4
```

`speaker_slug` is the normalized speaker name (lowercase, spaces → underscores),
matching `Utterance.speaker` after normalization. e.g. `leo_speaking.mp4`,
`maya_speaking.mp4`.

Optionally, a fallback idle clip for silence gaps:

```
src/assets/video/episodes/{book_id}/idle.mp4
```

This mirrors the existing discussion background convention at
`src/assets/img/discussion/{bookId}/`.

If the same character appears in two books with identical visuals, clips are still
duplicated per book so each book's assets remain self-contained and independently
updatable.

For now, assets are bundled locally. Move to CDN if clip sizes become a concern
(likely beyond ~10 clips per book).

### Compression

Before committing any clip, compress it with:

```bash
ffmpeg -i input.mp4 \
  -c:v libx264 -crf 24 -preset slow \
  -an \
  -movflags +faststart \
  output.mp4
```

- `-crf 24` — visually lossless quality; raise to 26–28 for smaller files, lower to 22 for higher fidelity
- `-preset slow` — better compression ratio at the cost of encode time
- `-an` — strips audio (all clips are played muted)
- `-movflags +faststart` — moves metadata to the front for faster web playback

Typical result: ~9 MB → ~1.3 MB for an 8-second 720×1280 clip (~7× reduction).

---

## Data contracts

### Utterance (already exists in script JSON)

```ts
type Utterance = {
  line_number: number;
  speaker: string; // e.g. "Leo", "Maya"
  text: string;
  start_ms: number;
  end_ms: number;
  duration_ms: number;
};
```

### EpisodeVideoConfig

Maps each speaker name to its scene clip URL. Produced at the callsite (`TalkWithBook`)
from `book_id` + normalized speaker slug. Also carries an optional idle clip for silence
gaps.

```ts
type EpisodeVideoConfig = {
  clips: Record<string, string>; // speaker name → clip URL
  idleClip?: string; // played when activeSpeaker is null
};
```

### Script source

The script lives in `circles_scripts.utterances` (JSONB), keyed by `circle_id` +
`episode`. Both are already available in `TalkWithBook.tsx` as `selectedBook.id` and
`chapter` (the prop that carries the episode number).

The fetch is a single Supabase query — same shape as the existing `circles_dots` fetch
at line 2064:

```ts
const { data } = await supabase
  .from("circles_scripts")
  .select("utterances")
  .eq("circle_id", selectedBook.id)
  .eq("episode", Number(chapter))
  .maybeSingle();

const script: Utterance[] = data?.utterances ?? [];
```

This belongs in a dedicated hook `useEpisodeScript(bookId, episode)` that mirrors the
existing Supabase hook patterns in `src/hooks/integrations/supabase/`.

---

## Layer 1 — `useActiveSpeaker`

**File:** `src/hooks/useActiveSpeaker.ts`

Watches `audio.currentTime` via the `timeupdate` event and returns the name of whichever
speaker is talking at that moment, or `null` during silence.

```ts
function useActiveSpeaker(
  script: Utterance[],
  audioRef: RefObject<HTMLAudioElement>,
): string | null;
```

Implementation notes:

- Binary search over `script` on each `timeupdate` — O(log n), runs ~4 Hz
- The script must be sorted by `start_ms` (assert in dev)
- Returns `null` when `currentTime` falls in a gap between utterances

```ts
function findActiveUtterance(
  script: Utterance[],
  ms: number,
): Utterance | null {
  let lo = 0,
    hi = script.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const u = script[mid];
    if (ms < u.start_ms) hi = mid - 1;
    else if (ms > u.end_ms) lo = mid + 1;
    else return u;
  }
  return null;
}
```

---

## Layer 2 — `CrossfadeVideo`

**File:** `src/components/features/episode/CrossfadeVideo.tsx`

A single video player that owns two stacked `<video>` elements (A and B) and crossfades
between them when `src` changes. Knows nothing about scripts or speakers — it just plays
whatever URL it receives.

```ts
type Props = {
  src: string; // current clip URL
  crossfadeDuration?: number; // ms, default 200
  className?: string;
};
```

Internal mechanics:

- `activeSlot` ref (`'a' | 'b'`) tracks which video is front
- When `src` changes, load the new URL into the **inactive** slot and call `.play()`
  imperatively (bypasses React render cycle — avoids blank frame)
- Shortly before the active clip ends, restart the same URL in the inactive slot and
  crossfade to it. Do not use native `<video loop>`; its seek back to frame zero can
  expose a black frame on mobile browsers.
- Toggle a React state bit to flip opacity via CSS transition
- The outgoing clip keeps playing during the fade, then pauses
- Both `<video>` elements are `muted playsInline preload="auto"`
- Keep the static Episode artwork underneath until the first decoded video frame is
  available

```
┌──────────────────────────────────┐
│  position: relative              │
│  ┌────────────────┐              │
│  │ video-a        │  opacity 1→0  (outgoing, still playing)
│  └────────────────┘              │
│  ┌────────────────┐              │
│  │ video-b        │  opacity 0→1  (incoming, already playing)
│  └────────────────┘              │
└──────────────────────────────────┘
After fade: swap slot roles
```

Key edge case: if `src` changes again before the crossfade finishes, cancel the in-flight
timeout and start a new transition from the current visual state. CSS transitions
interpolate correctly as long as the property isn't reset mid-flight.

---

## Layer 3 — `EpisodeVideoPlayer`

**File:** `src/components/features/episode/EpisodeVideoPlayer.tsx`

Wires `useActiveSpeaker` to `CrossfadeVideo`. Resolves `activeSpeaker → clip URL` and
passes the result down as a single `src`.

```ts
type Props = {
  script: Utterance[];
  audioRef: RefObject<HTMLAudioElement>;
  config: EpisodeVideoConfig;
  paused?: boolean;
  className?: string;
};
```

Usage:

```tsx
<EpisodeVideoPlayer
  script={script}
  audioRef={introAudioRef}
  paused={sessionPhase !== "intro_playing"}
  config={{
    clips: {
      Leo: leoSpeakingUrl,
      Maya: mayaSpeakingUrl,
    },
    idleClip: idleUrl,
  }}
  className="w-full h-full"
/>
```

Internal logic:

```ts
const activeSpeaker = useActiveSpeaker(script, audioRef);
const src = activeSpeaker
  ? config.clips[activeSpeaker] ?? config.idleClip
  : config.idleClip;

return <CrossfadeVideo src={src} paused={paused} />;
```

If `activeSpeaker` has no matching clip (e.g. a new character not yet in the config),
fall back to `idleClip` rather than crashing.

---

## Integration into `TalkWithBook.tsx`

The change is localized to the background rendering section (around line 2793):

```tsx
// Before: static image during intro
if (isListenMode) return "talk.png";

// After: replace the background entirely with EpisodeVideoPlayer
// during isListenMode; static background removed for that phase
```

Steps:

1. Call `useEpisodeScript(selectedBook.id, chapter)` — returns the utterances array
2. Build `EpisodeVideoConfig` from `book_id` + speaker slugs derived from the script
3. Render `<EpisodeVideoPlayer>` during `isListenMode` instead of the background image

---

## File map

```
src/
  hooks/
    useActiveSpeaker.ts               ← Layer 1
    integrations/supabase/
      useEpisodeScript.ts             ← fetches circles_scripts by circle_id + episode
  components/features/episode/
    CrossfadeVideo.tsx                ← Layer 2
    EpisodeVideoPlayer.tsx            ← Layer 3
  assets/video/episodes/
    {book_id}/
      leo_speaking.mp4
      maya_speaking.mp4
      idle.mp4                        ← optional silence fallback
    {other_book_id}/
      leo_speaking.mp4                ← same character, different look
      maya_speaking.mp4
```

---

## Implementation order

1. `useActiveSpeaker` — pure hook, testable with a mock audio element and hardcoded script
2. `CrossfadeVideo` — mount standalone with a button that cycles `src` to validate crossfade
3. `EpisodeVideoPlayer` — wire 1 + 2 together with a hardcoded config
4. `useEpisodeScript(bookId, episode)` — Supabase hook querying `circles_scripts`
5. Full integration — call `useEpisodeScript` in `TalkWithBook`, replace static background
   during `isListenMode` with `<EpisodeVideoPlayer>`

---

## Open questions

- **Script source:** resolved — `circles_scripts.utterances`, queried by `circle_id` +
  `episode` via `useEpisodeScript`.
- **Video hosting:** local bundle vs CDN. Clips are a few MB each; bundling is fine for
  a handful per book, CDN becomes necessary at scale.
- **Silence gaps:** when `activeSpeaker` is `null`, hold the last active clip; use
  `idleClip` only as the initial fallback when configured.
- **First frame on mobile:** iOS Safari may show a black frame before the first video
  plays. Mitigation: preload all clips for the episode on mount, not on first transition.
- **Clip for unknown speaker:** if `Utterance.speaker` doesn't match any key in
  `config.clips` (data inconsistency), fall back to `idleClip` silently and log a warning.
