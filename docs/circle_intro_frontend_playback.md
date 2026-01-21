# Circle Intro Playback: Frontend-Driven Architecture

## Overview
We are moving the intro audio playback for circles from server-side streaming to frontend playback. The backend will no longer decode and stream the intro audio. Instead, the frontend will fetch and play the audio asset directly (mp3/opus), and the backend will only manage state and conversation start.

This improves scale (CDN caching, no server CPU for decoding), reduces latency, and keeps the pipeline focused on real-time conversation audio only.

## Backend Responsibilities (High-Level)
- Provide intro audio metadata to the client (URL, format, duration if known, book_id/circle_id).
- Keep the conversation pipeline idle/muted during intro playback.
- Accept RTVI control events to control state:
  - introStarted
  - introInterrupted (with playback position)
  - introCompleted
- Trigger the normal greeting + conversation start only after introCompleted or introInterrupted.
- Persist intro status for analytics (optional).

Relevant code paths:
- `core/handlers.py` sends intro metadata and handles intro events over RTVI.
- `processors/circle_playback_processor.py` gates user frames while intro playback is pending.
- `core/pipeline.py` binds `CircleIntroState` and inserts the gate processor.

## Frontend Responsibilities (High-Level)
- Fetch intro audio URL/duration from Supabase (`circles_dots`) using `circle_id` before opening the session.
- Play the intro audio locally using the browser audio element or Web Audio.
- Delay the backend session until 30s before the end of the audio (to save session cost).
- Allow interruption via UI controls (pause/play or dev interrupt); emit introInterrupted when explicitly requested.
- On intro completion or interruption, notify the backend so the conversation begins.
- Optionally allow resume: continue from a saved playback position if user requests it.
- If `dot_progress.listening_status` is `completed`, skip intro playback and render the completed intro UI while opening the session immediately.

## Frontend Checklist (Share with Frontend Agent)
- Fetch `circles_dots` by `circle_id` (latest row) to get `audio_url` and `duration` before starting the session.
- Send RTVI `control` messages with `data.action` set to `introStarted`, `introInterrupted`, or `introCompleted` and include `circle_id` plus `position_s`.
- Start the session when `remaining_time <= 30s` (call `/api/offer`), then send `introStarted` with the current `position_s`.
- If `duration` is less than 30 seconds, start the session immediately (no delayed offer).
- Send `start-chat` only after intro finishes (introCompleted/introInterrupted).
- Wait for `introStatus.conversation_ready=true` before sending mic audio to the backend.
- Ignore user speech during intro (no auto-interrupt).
- Mic control is centralized in the talk screen; UI toggles should only change phase (intro pause/play or chat pause/resume).
- Avatar is disabled during intro; once chat is active, intro controls stay disabled until the user pauses the chat.
- Chat pause/resume sends RTVI control messages (`pauseListening` with optional `reason`/`max_pause_s`, `resumeListening` on resume).
- If `audio_url` is missing or fails to load, skip intro and send `introInterrupted` with `position_s=0`.
- Resume uses `dot_progress.elapsed_listening_seconds` and seeks to `elapsed - 2s` when available.

## Suggested Event Contract (RTVI control)
Client to server:
- `introStarted`: { circle_id, audio_url?, format?, position_s }
- `introInterrupted`: { circle_id, position_s }
- `introCompleted`: { circle_id, duration }

Server to client:
- `intro_metadata`: { circle_id, audio_url, format?, duration? }
- `intro_status`: { status: "playing"|"interrupted"|"completed", conversation_ready: true|false }
  - Note: RTVI server messages may wrap payloads (e.g., `data`); client should unwrap before parsing.

## Rollout Notes
- Start with a backend feature flag: disable server playback when frontend playback is enabled.
- Keep the greeting logic on the backend, but trigger it only after the intro status is completed/interrupted.
- Ensure the frontend does not send audio to the backend until `conversation_ready` is true.

## Open Questions
- Where to host audio assets (Cloudinary for now)?
- Whether the backend should compute and return duration for progress UX.
- Whether intro resume is needed for v1 or can be deferred.
- TODO: add a backend timeout fallback if the client never sends intro completion.
