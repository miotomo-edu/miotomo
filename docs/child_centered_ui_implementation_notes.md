# Child-Centered UI Plan and Implementation Notes

## Context

This document records:

- the child-centered UI plan derived from the live product review
- what was implemented in this pass
- what is still missing
- what should be prioritized next

The review and implementation were based on:

- `design-system/MASTER.md`
- `docs/miotomo_overview.md`
- live inspection in Chrome MCP of the browse/library flow and a circle detail page
- the stricter child-facing target of ages `7-9`

The product direction from the design system remained unchanged:

- warm claymorphism
- calm confidence, not hyperactivity
- rounded, tactile forms
- high readability for children

## Original Plan

The implementation plan focused on five child-centered goals.

### 1. Clarify the next action

Children aged 7-9 should understand what to do next in a few seconds without needing to infer it from layout, iconography, or system knowledge.

Planned changes:

- make the next primary action explicit on the browse hero and circle page
- favor verb-first language such as `Start`, `Keep going`, `Listen first`
- reduce abstract labels like `TALK TIME` and `VOCABULARY`

### 2. Improve loading and error forgiveness

Young children should not encounter cold or ambiguous states such as raw `Loading...` or dead-end errors.

Planned changes:

- replace bare loading text with warm, reassuring loading states
- replace terse error copy with calm recovery messaging
- add retry actions where data can be refetched

### 3. Make progress easier to parse

Status should be understandable without reading backend-style state or mentally decoding progress rings.

Planned changes:

- add plain-language status cues such as `New`, `In progress`, `Done`
- reinforce the current mission consistently across browse and circle views

### 4. Fix immediate accessibility issues

The live review found concrete accessibility problems that directly affect children and caregivers.

Planned changes:

- restore mobile zoom by removing `user-scalable=no`
- fix heading hierarchy issues
- improve semantics without changing the visual language

### 5. Preserve the strongest visual strengths

The cinematic illustration system and warm brand direction were already working well. The intent was to improve clarity without flattening the experience.

## What Was Implemented

### Browse page improvements

Updated in [BrowsePage.tsx](/Users/carlo/dev/miotomo/miot/src/components/sections/BrowsePage.tsx).

Implemented:

- replaced the old `Loading circles...` state with a warmer skeleton-based loading screen
- replaced the old generic error state with a calmer recovery card and a `Try again` button
- kept the browse structure intact so the strongest content hierarchy was preserved

Result:

- loading now feels intentional instead of broken
- error states are no longer dead ends
- the browse surface feels more forgiving for children

### Browse hero improvements

Updated in [CurrentCircleHero.tsx](/Users/carlo/dev/miotomo/miot/src/components/features/browse/CurrentCircleHero.tsx).

Implemented:

- added a visible mission cue under the hero play button:
  - `Start here: Dot X`
  - `Keep going: Dot X`
- replaced abstract labels with clearer child-facing language:
  - `LISTEN` -> `LISTEN FIRST`
  - `TALK TIME` -> `TALK WITH TOMO`
  - `VOCABULARY` -> `WORD GAME`
  - `SPELLING` -> `SPELLING GAME`
- changed the current-dot CTA from icon-only to icon + text for stronger clarity
- replaced the hero dot-list error message with retryable recovery UI
- softened the empty state from `No dots available yet.` to a more child-safe message

Result:

- the child can now identify the next action much faster
- the hero remains visually strong while giving clearer guidance
- recovery is easier when episode metadata fails to load

### Circle page improvements

Updated in [CirclePage.tsx](/Users/carlo/dev/miotomo/miot/src/components/sections/CirclePage.tsx).

Implemented:

- added a visible next-step badge on the hero image:
  - `Start here: Dot X`
  - `Keep going: Dot X`
- changed the mission card CTA from an isolated floating play circle to a full-width labeled button:
  - `Start Dot X`
  - `Keep going with Dot X`
- replaced raw `Loading...` with a warmer loading card
- replaced raw failure text with a retryable recovery state
- added plain-language status chips on dot rows:
  - `New`
  - `In progress`
  - `Done`
  - `Start here`
- renamed the secondary browse section from `Continue` to `More to keep going`
- corrected heading levels for downstream accessibility

Result:

- the circle page is still cinematic, but no longer relies on the child inferring what to do next
- state changes are easier to parse
- the page is more forgiving under slow or failed data loads

### Accessibility and metadata improvements

Updated in [index.html](/Users/carlo/dev/miotomo/miot/index.html).

Implemented:

- removed `user-scalable=no` from the viewport meta tag
- added a document meta description

Result:

- pinch zoom is restored for low-vision users, children, and caregivers
- SEO metadata is improved

## Verification

### Functional verification

- `npm run build` passed

### Browser verification

Using Chrome MCP after implementation:

- the browse hero now shows `Start here: Dot 1`
- the circle page now shows `Start here: Dot 1` directly on the hero
- child-facing labels are clearer and more action-oriented

### Accessibility verification

Before implementation, Lighthouse mobile accessibility was `92`.

After implementation, Lighthouse mobile accessibility reached `100`.

Observed improvements included:

- mobile zoom no longer blocked
- heading order issue resolved

### Lint status

`npm run lint` did not run successfully because the repo currently has no `eslint.config.js`, and ESLint 10 expects flat config by default.

This was not changed in this pass.

## What Is Still Missing

This pass intentionally focused on the highest-value child-facing fixes. Several important improvements are still open.

### 1. Browse density is still high

The browse page still contains many thematic shelves and long horizontal lists. For ages 7-9, that can become cognitively heavy after the first screen.

Still missing:

- reduced initial browse density
- stronger progressive disclosure
- a simpler “top picks for you” layer before the full catalog

### 2. Celebration and delight are still underdeveloped

The product has strong artwork and tone, but still lacks enough deliberate delight moments in the interface itself.

Still missing:

- mission-start feedback
- completion celebration moments
- micro-feedback when filters or cards are tapped
- more visible Tomo companionship outside voice sessions

### 3. Progress language is improved but not yet unified system-wide

There is now clearer row-level language, but the app still mixes several mental models:

- circle
- dot
- mission
- continue

Still missing:

- a single progress vocabulary system used consistently across surfaces
- stronger child-facing explanations of what each stage means

### 4. Error resilience is still local, not systemic

This pass improved UI around fetch failures where those failures were visible in the reviewed screens.

Still missing:

- broader network/offline fallback behavior
- more graceful handling of analytics wake-up and readiness failures
- parent-safe and child-safe fallback states across more flows

### 5. Motion and reward systems are still basic

The UI still lacks a more deliberate animation and reward language that reinforces progress without becoming noisy.

Still missing:

- reward animation rules
- mission transition animation rules
- badge progression feedback tied to child success moments

## Recommended Next Steps

### Priority 1

- reduce browse overload on the first screen
- add a “top mission” or “recommended for you” layer before the long catalog
- make category filter feedback more obvious and more playful

### Priority 2

- design a lightweight delight system for:
  - starting a dot
  - finishing a dot
  - unlocking the next mission
  - reaching Teachtime

### Priority 3

- unify progress language across browse, circle, games, and completion pages
- decide which terms are child-facing and which should remain internal only

### Priority 4

- create a reusable child-safe loading/error component library for:
  - content fetching
  - session readiness
  - network interruption
  - empty states

### Priority 5

- run an additional review on:
  - the `Tomo` tab
  - the `Parents` area
  - dot completion screens
  - spelling and vocabulary flows

## Longer-Term Opportunities

### Child-specific content modes

If Miotomo continues to serve a broad `7-12` audience, the UI may eventually need to adapt more explicitly by age band.

Possible future direction:

- a slightly more guided mode for `7-9`
- a more autonomous and denser mode for `10-12`

### Better progress storytelling

Miotomo’s product model is strong: the child teaches Tomo. The UI could reflect that relationship more consistently.

Possible future direction:

- Tomo reacts when the child unlocks a new dot
- Tomo acknowledges returning progress
- badges and mission milestones feel more like “helping Tomo learn” rather than generic progress tracking

### Formal child usability testing

The strongest next validation step is direct observation.

Recommended future testing:

- first-click tests with children ages `7-9`
- comprehension testing on browse and circle pages
- caregiver validation on readability and recovery states

## Files Changed in This Pass

- [index.html](/Users/carlo/dev/miotomo/miot/index.html)
- [src/components/sections/BrowsePage.tsx](/Users/carlo/dev/miotomo/miot/src/components/sections/BrowsePage.tsx)
- [src/components/features/browse/CurrentCircleHero.tsx](/Users/carlo/dev/miotomo/miot/src/components/features/browse/CurrentCircleHero.tsx)
- [src/components/sections/CirclePage.tsx](/Users/carlo/dev/miotomo/miot/src/components/sections/CirclePage.tsx)

## Summary

This pass did not attempt a full redesign.

It improved the child experience by tightening the most important things first:

- clearer next actions
- warmer loading and error handling
- more readable status language
- immediate accessibility fixes

The result is a version of the current design language that is more legible, more forgiving, and better suited to children aged `7-9`, while preserving the visual strengths already present in Miotomo.
