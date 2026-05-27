# Miotomo Design System

This system translates `Miotomo Landing.html` into reusable app rules, tokens, and components. The landing page is not a generic SaaS style: it is a warm cosmic storybook interface for children, with enough restraint that parents can trust it.

Use this as the source of truth when updating the Miotomo app UI.

## Design Direction

**Name:** Motara Storybook

**Core idea:** Miotomo should feel like a doorway into Tomo's mission, not like an edtech dashboard. The app is practical, but the first impression should be: warm night sky, tactile illustrated worlds, child-as-expert, parent-trustworthy.

**What carries over from the landing page:**

| Landing signal | App-system translation |
| --- | --- |
| Deep purple/blue canvas | Default dark app shell, especially for child sessions and immersive learning flows |
| Parchment typography | Warm readable foreground, not pure white |
| Fraunces headings | Editorial, storybook authority for titles and major prompts |
| Nunito Sans body | Friendly, rounded, legible interface copy |
| JetBrains Mono eyebrows | Small system labels, episode states, metadata |
| Ochre/coral/leaf accents | Progress, calls to action, warmth, success |
| Rounded illustrated panels | Circle cards, Dot cards, session scenes, vocabulary games |
| Texture overlay | Use subtly on large backgrounds only, never on dense controls |
| Reveal/parallax motion | Use for scene transitions; keep core app workflows fast and predictable |

## Product Principles

1. **Tomo is the anchor.** Tomo should appear in child-facing home, badges, spelling, vocabulary, and Teachtime surfaces. Topic-native characters can dominate Dot sessions, but Tomo is the return point.
2. **The child is not being tested.** Copy and UI states should say "help Tomo learn" rather than "pass/fail." Mistakes are framed as Tomo still needing help.
3. **Parents get calm evidence.** Parent dashboards should be quieter than child sessions: same tokens, less illustration, denser layout, more numbers and summaries.
4. **Voice comes first.** The active speaking/listening state should be the visual center of live sessions. Text transcripts are supporting material, not the main event.
5. **Every topic is a place.** Circle/Dot artwork should feel like entering a world. Avoid generic cards with only text.

## Installation

Import the component layer once in the app root:

```css
@import "./design-system/components.css";
```

Load the same fonts used by the landing page:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@500,700&display=swap" rel="stylesheet" />
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&family=Nunito+Sans:ital,opsz,wght@0,6..12,400;0,6..12,500;0,6..12,600;0,6..12,700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

Use the root theme attribute for parent or admin screens that need light mode:

```html
<main class="mio-shell" data-mio-theme="light">
  ...
</main>
```

## Tokens

### Color

| Token | Value | Use |
| --- | --- | --- |
| `--mio-color-motara-950` | `#171222` | Deepest shell, modals, session backdrop |
| `--mio-color-motara-850` | `#2a2440` | Default dark canvas from landing |
| `--mio-color-motara-800` | `#322a4a` | Cards, form wells |
| `--mio-color-motara-700` | `#3d3458` | Raised panels, hover surfaces |
| `--mio-color-parchment-150` | `#f0e6cf` | Primary text, inverse surface |
| `--mio-color-parchment-250` | `#d8ccb0` | Body text |
| `--mio-color-parchment-450` | `#9d93a8` | Muted labels |
| `--mio-color-ochre-400` | `#d9a83c` | Primary action, badge progress |
| `--mio-color-coral-400` | `#d9836a` | Warm accents, active dots |
| `--mio-color-leaf-500` | `#8fa05c` | Tomo mark, success |
| `--mio-color-sky-500` | `#3f6f86` | Informational states |
| `--mio-color-terracotta-500` | `#b14f3e` | Danger, attention |

Guidance:

- Use dark Motara as the default child-app atmosphere.
- Use light parchment for parent reports, account settings, and dense reading.
- Avoid pure white and pure black except image outlines and unavoidable platform defaults.
- Do not make a screen all purple. Each view needs at least one warm or organic accent: ochre, coral, leaf, or sky.

### Typography

| Role | Font | Usage |
| --- | --- | --- |
| Display | Fraunces | Page titles, prompt headlines, Circle titles, badge names |
| Body | Nunito Sans | UI copy, forms, cards, prompts |
| Brand | Satoshi | Logo wordmark and rare nav-level labels |
| Mono | JetBrains Mono | Eyebrows, timers, progress metadata, state chips |

Rules:

- Letter spacing is `0` for normal text and headings.
- Eyebrows use `0.18em` tracking because they are tiny and uppercase.
- Use `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs.
- Use tabular numbers for timers, session minutes, scores, progress counts, and parent dashboard metrics.

### Type Scale

| Token | Role |
| --- | --- |
| `--mio-step--1` | Legal, helper text, compact metadata |
| `--mio-step-0` | Default body |
| `--mio-step-1` | Lede, important prompt body |
| `--mio-step-2` | Card headings |
| `--mio-step-3` | Section titles, modal titles |
| `--mio-step-4` | App page titles |
| `--mio-step-5` | Immersive session hero prompt only |

### Spacing

Use the 4px-based scale from `--mio-space-1` through `--mio-space-24`. Typical app layout:

- Screen padding: `--mio-space-6` on mobile, `--mio-space-10` to `--mio-space-16` on desktop.
- Card padding: `--mio-space-5` to `--mio-space-8`.
- Control gap: `--mio-space-2` to `--mio-space-3`.
- Section gap: `--mio-space-12` to `--mio-space-20`.

### Radius

| Token | Value | Use |
| --- | --- | --- |
| `--mio-radius-xs` | 6px | Tiny badges, internal progress elements |
| `--mio-radius-sm` | 8px | Compact inputs, menu items |
| `--mio-radius-md` | 14px | Standard cards and inputs |
| `--mio-radius-lg` | 22px | Major panels and media |
| `--mio-radius-xl` | 28px | Immersive shells |
| `--mio-radius-pill` | 999px | Chips and primary CTAs |

Keep radii concentric: if a parent has 22px radius and 8px padding, an inner child should be about 14px.

## Components

### App Shell

Use for the main child experience:

```html
<main class="mio-shell">
  <div class="mio-wrap mio-stack">
    ...
  </div>
</main>
```

The shell includes a subtle cosmic wash. Keep additional backgrounds sparse so screens do not become noisy.

### Brand

```html
<a class="mio-brand" href="/">
  <span class="mio-brand-mark" aria-hidden="true"></span>
  <span>Miotomo</span>
</a>
```

Use the mark as Tomo's minimal app icon. For the full mascot, use actual Tomo artwork.

### Buttons

```html
<button class="mio-button">Start Dot</button>
<button class="mio-button" data-variant="quiet">Review progress</button>
<button class="mio-button" data-variant="inverse">Teach Tomo</button>
```

Rules:

- Primary action is ochre.
- Quiet action is transparent with a soft parchment border.
- Buttons scale to `0.96` on press.
- Minimum hit target is 44px.
- Icon buttons should use a familiar icon, not a text label inside a rounded rectangle.

### Inputs

```html
<label class="mio-stack">
  <span class="mio-eyebrow">Parent email</span>
  <input class="mio-input" placeholder="parent@email.com" />
</label>
```

Rules:

- Inputs sit on dark surface, not pure transparent canvas.
- Placeholder text uses muted parchment.
- Use visible labels for parent/admin forms.

### Surfaces and Cards

```html
<section class="mio-surface mio-panel" data-raised="true">
  <p class="mio-eyebrow">Circle</p>
  <h2 class="mio-title-md">What were dinosaurs, actually?</h2>
  <p class="mio-lede">Five Dots, two expert characters, one Teachtime.</p>
</section>
```

```html
<article class="mio-card">
  <span class="mio-chip">Dot 03</span>
  <h3>Why did ice float?</h3>
  <p>Help Tomo explain density in plain English.</p>
</article>
```

Rules:

- Use cards for repeated items: Dots, Circles, vocabulary words, children, sessions.
- Use full-width sections or panels for page structure.
- Do not nest cards inside cards.
- Images in cards should use `.mio-media` or an equivalent 1px black/white outline.

### Chips

```html
<span class="mio-chip">Listening</span>
<span class="mio-chip">4 of 5 Dots</span>
```

Use chips for states and metadata, not primary actions.

### Progress

```html
<div class="mio-progress" aria-label="Circle progress">
  <div class="mio-cluster">
    <span class="mio-eyebrow">Circle progress</span>
    <span class="mio-stat">3 / 5</span>
  </div>
  <div class="mio-progress-track">
    <div class="mio-progress-value" style="width: 60%"></div>
  </div>
</div>
```

Use progress as story accumulation, not score pressure. Prefer "Tomo has 3 badge pieces" over "60% complete" in child-facing copy.

### Voice Orb

```html
<div class="mio-voice-orb" data-state="listening" aria-label="Listening"></div>
```

Use in active voice sessions. It should be the visual center, with transcript and controls nearby but secondary.

States:

| State | UI |
| --- | --- |
| Idle | Static orb, muted prompt |
| Listening | Pulse, leaf glow |
| Thinking | Small orbiting dots or slow shimmer |
| Speaking | Gentle scale and waveform accent |
| Blocked/safety | Calm terracotta state with trusted-adult copy |

### Session Rail

```html
<ol class="mio-session-rail">
  <li class="mio-session-step" aria-current="step">Warm-up</li>
  <li class="mio-session-step">Core practice</li>
  <li class="mio-session-step">Consolidation</li>
  <li class="mio-session-step">Wrap</li>
</ol>
```

Keep this compact. It is orientation, not a task checklist.

## Screen Patterns

### Child Home

Recommended hierarchy:

1. Tomo presence and short mission prompt.
2. Active Circle card with artwork, badge pieces, next Dot.
3. "Teach Tomo" or "Continue Dot" primary action.
4. Secondary games: spelling and vocabulary.
5. Quiet parent/account access.

Use dark theme and illustrated assets. Avoid a generic dashboard grid as the first screen.

### Circle Detail

Recommended layout:

- Large topic artwork as a place.
- Circle title in Fraunces.
- Dot timeline with 4-5 cards.
- Badge assembly progress.
- Topic-native character preview.
- Parent-safe details collapsed or secondary.

### Live Voice Session

Recommended layout:

- Full-height immersive shell.
- Voice orb and current character/Tomo art centered.
- Current prompt as a short large sentence.
- Transcript in a smaller side/bottom panel.
- Controls as icon buttons: mute, pause, end.
- Timer in mono tabular numbers.

Do not make live sessions look like chat apps. The child is speaking, not typing.

### Spelling and Vocabulary

Recommended layout:

- Frame as Tomo needing help.
- Word/definition card in the center.
- Voice state prominent.
- Attempts and streaks are quiet, non-punitive.
- Success state gives Tomo knowledge, not grades.

### Parent Dashboard

Recommended layout:

- Light parchment theme by default.
- Dense but warm cards.
- Skills over time with tabular numbers.
- Recent session summaries.
- Safety and privacy status visible but calm.
- Use fewer illustrations than child screens.

## Motion

Use motion sparingly in the app:

- Page/section reveals: `opacity` plus `translateY(28px)`, staggered by about 100ms.
- Button hover: translate `-1px`.
- Button press: scale `0.96`.
- Voice orb: continuous only during live states.
- Scene art: small parallax is acceptable on marketing and Circle detail, not inside dense parent reports.

Do not animate layout-affecting properties. Use explicit transition properties, never `transition: all`.

## Accessibility

- Hit targets are at least 44px.
- Maintain readable contrast on dark Motara backgrounds.
- Respect `prefers-reduced-motion`.
- Use labels for all inputs.
- Live voice state needs text equivalents: "Listening", "Thinking", "Speaking".
- Parent dashboard metrics need semantic headings, not only visual cards.
- Safety states should be calm, clear, and not playful.

## Copy Voice

Use direct, concrete, child-respecting language.

Prefer:

- "Help Tomo understand volcanoes."
- "Tomo still needs this word."
- "You taught Tomo three new ideas today."
- "Ask a trusted adult for help."

Avoid:

- "Correct/incorrect" as the main feedback.
- "Your score is low."
- "AI tutor."
- Overly sentimental companion language.

## Migration Checklist

1. Import `design-system/components.css` at the app root.
2. Load Fraunces, Nunito Sans, Satoshi, and JetBrains Mono.
3. Replace raw colors with `--mio-*` tokens.
4. Replace app background with `.mio-shell`.
5. Convert repeated panels to `.mio-card` or `.mio-surface`.
6. Convert CTAs to `.mio-button`.
7. Convert metadata pills to `.mio-chip` and `.mio-eyebrow`.
8. Add `.mio-tabular` to timers and metrics.
9. Add `.mio-media` to artwork containers.
10. Audit screens for card nesting and oversized hero typography inside compact UI.

## Open Design Debt From The Landing Page

The landing page has a strong visual identity, but a few things should not be copied into the app unchanged:

| Landing issue | App-system decision |
| --- | --- |
| Inline styles override reusable classes | Move all app styling into tokens/components |
| Some section ordering in HTML is tangled | Keep app screens structurally simple and semantic |
| CTA form uses pill layout that stacks on mobile | App inputs use stable block layout by default |
| Marketing scroll animation is prominent | App motion should support tasks, not dominate them |
| Dark theme is immersive but can feel heavy | Parent/admin screens should use parchment light theme |

