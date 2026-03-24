# Voice Session Page — Design Override

> Overrides MASTER.md for: TalkWithBook, CharacterContainer, Transcript, MicrophoneStatus, modality panels

---

## Surface
Full dark surface. Background: `#000000`. All text: `#FFFFFF`.
Discussion background image fills the screen with `object-cover`.

## Character Orb
- Size: 130×130px (`.orb-animation`), 90×90px in active-order mode
- Uses `max-height: 20vh` to adapt to small screens
- Wrapper uses `transform 160ms ease` for volume-reactive animation
- Disabled/loading: `opacity: 0.5` + `pointer-events: none`
- Remove tap highlight: `.tap-safe` class required

## Microphone States
| State | Visual |
|-------|--------|
| Active/listening | `.mic-pulse` (1.2s scale 1.08) + `.mic-glow` (pink shadow `#f78ad7`) |
| Thinking/speaking | Opacity changes, no pulse |
| Muted/disabled | `.mic-fade` (opacity 0.5) |

## Speech Bubbles
- Background: `#232329`
- `border-radius: 45px`
- Width: 200px, Height: 80px
- CSS arrow via `::after` pointing down-right at `left: 130px, top: 75px`

## Transcript Area
- `.scrollable-element` — hides scrollbar cross-browser
- Auto-scrolls to latest message
- User messages: `bg-userBubble (#F4F7F4)` + dark text
- Assistant messages: `bg-assistantBubble (#FAC304)` + dark text

## Bottom Controls
- Full-width, anchored to bottom
- Uses safe-area bottom padding
- Microphone button: pill or circle, centered
- No bottom nav shown during active voice session

## No Library Patterns Here
Do not use `bg-library`, white cards, or horizontal browse rows on this screen.
