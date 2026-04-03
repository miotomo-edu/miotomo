# Miotomo Product Overview

## What Is Miotomo?

Miotomo is a voice-first AI learning companion for children aged approximately 7–12. After a child listens to a short audio episode featuring real subject-matter experts, Miotomo guides them through a structured voice conversation that deepens comprehension, builds vocabulary, and develops verbal reasoning skills.

The system is designed for one-on-one voice interaction. Children learn about a topic by listening to audio episodes and interacting directly with the characters in them, engaging in debates and mediation sessions along the way. After completing all episodes in a Circle, the child teaches Tomo — who is eager to learn everything about planet Earth — everything they have discovered.

---

## The Story

Tomo comes from **Motara** — the planet of knowledge — where beings called **Keepers of Knowledge** have dedicated themselves to understanding the universe. Tomo has travelled to Earth on a mission: to learn everything about it. But Tomo cannot learn directly. The only path to Earth's knowledge runs through the child.

**For Tomo to learn, the child must learn first.**

This is the core mechanic and the emotional engine of Miotomo. The child is not a student receiving instruction — they are Tomo's expert, teacher, and guide. Everything the child explains, argues, and teaches in a session becomes Tomo's window onto Earth.

---

## Core Concepts

### Circle
A **Circle** is a complete topic journey — analogous to a TV series or thematic unit. Example: *"What Were Dinosaurs, Actually?"* A Circle contains 4–5 episodes (Dots) and is the top-level unit of curriculum organization. Completing all the Dots in a Circle unlocks a Teachtime session with Tomo — the culmination of the journey.

### Dot
A **Dot** is one episode inside a Circle — the specific audio content the child just listened to before starting a Miotomo session. Each Dot features one or more subject-matter experts and has associated vocabulary, spelling words, and discussion topics that inform the conversation. After listening, the child speaks directly with the expert(s) from that episode.

### Tomo
**Tomo** is the main AI character: a Keeper of Knowledge from Motara — the planet of knowledge — on a mission to learn about Earth. Tomo is genuinely curious and genuinely ignorant. He does not know Earth things, and the child's job is to explain them. This role reversal (child as expert, AI as learner) is a core pedagogical device.

Tomo's responses are intentionally brief (target: 12–25 words per turn) to maximize child speaking time.

Tomo is the consistent anchor across the entire Miotomo experience. While topic-native expert characters change with each Circle, Tomo is always present as:
- The **visual presence** in the app UI — the face the child sees between sessions
- The **playmate** in games (Spelling, Dictionary) — framed as Tomo asking for the child's help ("Help me spell this word", "What does this mean?"), not as the child being tested
- The **badge keeper** — Tomo receives and holds the badges the child earns across Dots, tracking the journey
- The **culminating conversation partner** in Teachtime — the payoff of every Circle

This layered presence means that by the time Teachtime arrives, the child has an established relationship with Tomo built through play, progress, and shared accumulation — making the act of teaching him feel genuinely meaningful.

### Topic-Native Expert Characters
Each Circle features its own cast of expert characters drawn directly from the topic world. Rather than recurring human hosts, the experts are characters who *belong* to the subject matter: a Roman senator and a soldier for a Circle about Rome, a T-Rex and a Stegosaurus for a Circle about dinosaurs, anthropomorphised shadow shapes for a Circle about light and shadows.

This design reflects several deliberate principles:
- **No humanisation of AI**: using non-human, topic-native characters avoids children forming a parasocial bond with human-like AI figures.
- **No fixed recurring cast**: each Circle's characters are unique, giving the art and narrative teams creative freedom per-Circle and avoiding emotional dependency on persistent human characters.
- **Immersion**: a T-Rex explaining what it was like to *be* a T-Rex is inherently more compelling than a human expert talking *about* T-Rexes. The fictional frame does the pedagogical work.

Each Circle's character pairing is designed to naturally cover contrasting orientations — one more experiential and sensory, one more factual and analytical — mirroring the complementary lenses that effective topic exploration requires.

Expert characters appear only during Dot voice sessions. They do not appear during games or Teachtime, which belong entirely to Tomo.

---

## Circle Progression

A Circle follows a deliberate arc:

1. **Dot 1** — child listens to podcast episode → expert voice session (e.g. storytelling, debate, or mediation)
2. **Dot 2** — child listens → expert voice session
3. **Dot 3–5** — same pattern, each building on the previous
4. **Teachtime** — after all Dots are complete, the child has a culminating session with Tomo, teaching him everything they have learned across the Circle

Teachtime is the payoff of the journey: Tomo finally gets to learn from the child who has become a genuine expert on the Circle's topic.

---

## Badges

As a child progresses through a Circle, they earn badges — one piece per Dot, with the final piece awarded at Teachtime. Each partial badge is a visible signal of an incomplete journey: Tomo doesn't have the full picture yet.

Badges are shared with Tomo, who keeps track of them. This makes the accumulation feel directed — the child is not just collecting rewards, they are bringing something to Tomo. The badge mechanic reinforces Tomo's presence throughout the Dot journey even when he is not an active conversational participant.

---

## Learning Modalities

Each session uses one or more modalities, sequenced by the stage flow engine. Modalities correspond to different types of practice and are tied to specific prompts and tools.

### Storytelling (Free Conversation)
The child discusses the episode with the Circle's topic-native expert characters. The conversation follows a four-phase deliberate practice arc:

1. **Warm-up**: low-stakes recall and orientation
2. **Core practice**: guided retelling, inference, and elaboration
3. **Consolidation**: connecting ideas, personalizing understanding
4. **Wrap**: summary and transition

The bot monitors engagement signals (response length, minimal-response streaks, off-topic turns) and adjusts challenge level dynamically.

### Debating
Structured debate practice on a topic from the episode. The child takes a position and defends it through a sequence of turns, developing argument construction and verbal reasoning skills.

### Mediation
The child acts as mediator between two characters (or perspectives) that disagree. Rather than defending a single position, the child must understand both sides, find common ground, and propose resolutions. This develops perspective-taking and constructive reasoning skills.

### Spelling
An interactive spelling game in which Tomo asks the child to help him spell words drawn from the episode. The child spells words aloud; the game tracks accuracy and progress. Framed as Tomo needing to learn, not as the child being tested — getting a word wrong means Tomo still doesn't know it yet, removing the ego load from failure.

### Vocabulary
A game in which Tomo asks the child the meaning of key words from the episode. The child encounters definitions, examples, and usage prompts in a conversational format. As with Spelling, the framing is Tomo seeking knowledge from the child, not a quiz.

### Teachtime
The culmination of a Circle: the child teaches Tomo everything they have learned across all the Dots. Tomo asks questions from genuine ignorance — he does not scaffold or hint using content from the episodes. Only what the child has said aloud in the current session counts as "known" to Tomo.

---

## Skills & Progress Tracking

Miotomo tracks skill development across sessions, visible to both child and parent:

| Skill | Description |
|-------|-------------|
| **Critical thinking** | Inference, reasoning about cause/effect, evaluating claims |
| **Storytelling** | Retelling, narrative structure, elaboration |
| **Debating** | Argument construction, position defence, rebuttal |
| **Public speaking** | Verbal fluency, confidence, turn-taking |
| **English language proficiency** | Vocabulary acquisition, sentence complexity, pronunciation |

Parents can view their child's skill development over time. Children receive age-appropriate feedback within sessions.

---

## Conversation Design

- **One voice turn at a time**: the pipeline enforces a single speaker at a time via VAD (voice activity detection) and smart turn analysis.
- **Concise bot responses**: target 12–25 words; longer explanations are avoided to maximize child speaking time.
- **Phase-aware behavior**: prompt framing, challenge level, and transition triggers vary by phase (warm_up, core_practice, consolidation, wrap).
- **Challenge-up / downshift**: the system detects disengagement (short responses, off-topic turns) and can inject repair prompts or adjust difficulty.
- **Session length**: approximately 10 minutes per session. A per-session time limit and a daily cap (15 minutes by default) are enforced at the infrastructure level.
- **Resumption**: if a session ends early, the next session for the same child/book/chapter resumes from where it left off.

---

## Safety System

Every child turn passes through a deterministic safety layer **before** reaching the LLM. This layer classifies the input into one of three categories:

- **Safe**: routed to the LLM normally.
- **Ambiguous**: a system tag is injected and the turn is routed to the LLM with a guarded prompt. No blocking occurs, but the LLM is constrained in how it responds.
- **Unsafe**: blocked deterministically. The LLM never sees the content. A pre-written refusal message is returned to the child.

Handled categories include: distress disclosure, PII volunteering (name, address, school), unsafe requests, and AI identity questions.

**Three-strike rule**: after three unsafe violations in a single session, the session closes automatically with an appropriate message and an RTVI `safety-violations` event sent to the client.

**Distress signals**: the system detects language indicating distress and responds with a trusted-adult guidance message, directing the child to speak with a trusted adult.

---

## Technical Summary

*For developers and LLMs needing to understand the implementation domain.*

| Layer | Technology |
|-------|-----------|
| Framework | [Pipecat](https://pipecat.ai) (open-source voice AI pipeline) |
| Speech-to-text | Deepgram (configurable: OpenAI, Google, Groq) |
| LLM | OpenAI GPT-4o (configurable: Gemini, Groq) |
| Text-to-speech | Deepgram or OpenAI (configurable) |
| Transport | WebRTC via Daily, or SmallWebRTC |
| Database | Supabase (PostgreSQL) — content, conversations, progress |
| Deployment | Pipecat Cloud (containerized, per-session bot instances) |

The pipeline processes audio frames in real time: STT → safety layer → LLM → TTS. Each session runs in an isolated bot process. Conversation state (messages, elapsed time, stage progress) is persisted to Supabase at the end of each session.

---

## Terminology Glossary

| Term | Meaning |
|------|---------|
| Circle | A thematic topic journey (like a series); contains 4–5 Dots followed by a Teachtime |
| Dot | One episode within a Circle; includes a podcast segment and an expert voice session |
| Tomo | The AI character — a Keeper of Knowledge from Motara, curious and ignorant of Earth; present across UI, games, badges, and Teachtime |
| Motara | The planet of knowledge; home of the Keepers of Knowledge |
| Keeper of Knowledge | A being from Motara dedicated to understanding the universe; Tomo's identity |
| Topic-native expert | A Circle-specific character drawn from the topic world (e.g. a Roman senator, a T-Rex) who hosts Dot voice sessions |
| Expert | A topic-native character who features in a Dot's podcast and leads the post-episode voice session |
| Teachtime | The culminating session at the end of a Circle, where the child teaches Tomo |
| Badge | A reward earned per Dot (one piece each) and completed at Teachtime; kept by Tomo |
| Modality | A type of learning activity: storytelling, debating, mediation, spelling, vocabulary, teachtime |
| Mediation | A conversation format where the child mediates between two disagreeing perspectives |
| Stage | A named phase within a session (corresponds to one modality) |
| Deliberate practice arc | The four-phase structure: warm_up → core_practice → consolidation → wrap |
| Safety guardrail | The deterministic content filter that runs before every LLM call |
| VAD | Voice Activity Detection — determines when the child has finished speaking |
| RTVI | Real-Time Voice Interaction protocol — event bus between server and client app |
| Session cap | Daily maximum speaking time enforced per child (default: 15 minutes) |
