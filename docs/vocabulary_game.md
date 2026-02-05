## Vocabulary Game Flow

This document describes how the Visual Vocabulary game works in the frontend.

### Source Data
- Vocab items are loaded from Supabase `vocab_items` with `circle_id` + `dot`.
- Fields used: `word_id`, `target_word`, `context_text`, `context_audio_url`, `tomo_prompt_text`, `language`, `feedback_text_map`.
- Items are ordered by `index` then `created_at`.

### High-Level Flow (User Experience)
1. Bubble shows: “Tap listen to hear it.”
2. User taps **Listen**.
3. The context sentence audio plays locally.
4. The sentence is displayed, with the target word highlighted.
5. The bubble switches to `tomo_prompt_text`.
6. User can replay the sentence if desired.
7. User taps the mic and records a response.
8. While recording, the bubble shows “Listening…”.
9. The backend returns grading feedback (including `feedback_key`).
10. The bubble shows `feedback_text_map[feedback_key]` loaded from Supabase.
11. If `feedback_key === "success_clear"`, the Next button appears.
12. Otherwise, the mic reappears for another attempt.

### UI States
The UI transitions through these phases:
- `listen`: waiting for the user to listen to the sentence.
- `revealed`: sentence is visible; bubble shows `tomo_prompt_text`; mic is available.
- `recording`: mic is active; bubble shows “Listening…”.
- `grading`: backend is grading; bubble shows “Grading…”.
- `feedback`: bubble shows backend feedback from `feedback_text_map`.

### Backend /grade Protocol
The frontend streams audio to:
```
ws://localhost:8000/v1/vocab/grade?sample_rate=16000&target_word=<word>
```

Messages:
- `type: "status", stage: "grading"` → stop mic capture, show “Grading…”.
- `type: "transcript"` → logged only; not shown in the UI.
- `feedback_key` → determines the bubble message and success state using the Supabase `feedback_text_map`.

### Feedback Mapping (Required)
The backend returns a `feedback_key`. The bubble **must** display:
```
feedback_text_map[feedback_key]
```
`feedback_text_map` is stored per vocab item in Supabase.

Example:
```
{
  "miss_soft": "Hmm… I’m still confused. Let’s try the next one.",
  "retry_audio": "I didn’t catch that — can you try again, a little louder?",
  "partial_close": "Close — I get part of it. One thing is missing.",
  "success_clear": "Ohhh — yes. That makes it clearer now."
}
```

### Success vs Retry
- `success_clear` → mark word correct and show the Next button.
- any other key → keep the current word and re-enable the mic.

### Attempt Tracking
- Attempts are stored for grading logic (max 3).
- Attempt transcripts are **not** displayed in the UI.

### Audio Notes
- Context audio is played locally; avatar is not clickable during playback.
- Recording is done via `MediaRecorder` (Opus WebM) and streamed to the socket.
