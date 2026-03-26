# Miotomo Design System — MASTER

> **Product:** AI reading companion for children ages 6–12
> **Stack:** React 19 + Vite + TailwindCSS v4
> **Paradigm:** Mobile-first, flat design, two-surface (dark voice / light library)

---

## 1. Color Tokens

### Core Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg-dark` | `#000000` | Voice/talk screen backgrounds, bottom nav |
| `--color-bg-light` | `#FFFFFF` | Library, browse, circle page backgrounds |
| `--color-bg-paper` | `#F4ECDF` | Warm light surface for browse / circle detail backgrounds |
| `--color-bg-paper-deep` | `#EFE6D8` | Lower light surface / overlapping content area |
| `--color-surface-dark` | `#232329` | Speech bubbles, dark cards |
| `--color-surface-elevated` | `#2C2C33` | gray-800 — elevated dark surfaces |
| `--color-cta` | `#f25a57` | Primary play buttons, completed dot indicator |
| `--color-cta-ring` | `rgba(242,90,87,0.22)` | Glow ring around play button |
| `--color-assistant-bubble` | `#FAC304` | AI chat bubble background (yellow/gold) |
| `--color-assistant-bubble-20` | `#FAC30433` | AI bubble with 20% opacity |
| `--color-highlight-gold` | `#FAC304` | Hero / circle-detail highlight color, completed dots, current-mission accents |
| `--color-highlight-gold-ring` | `rgba(250,195,4,0.22)` | Glow ring around gold play buttons |
| `--color-user-bubble` | `#F4F7F4` | User chat bubble background |
| `--color-accent-green` | `#13EF93` | green-spring, success states |
| `--color-accent-blue` | `#79AFFA` | blue-link, interactive links |
| `--color-mic-glow` | `#f78ad7` | Pink glow on active microphone |

### Gray Scale (Custom)

```
gray-25:   #FBFBFF   ← near-white tint
gray-200:  #E1E1E5   ← subtle dividers, disabled buttons
gray-350:  #BBBBBF   ← placeholder text
gray-450:  #949498   ← secondary text
gray-600:  #616165   ← supporting text
gray-700:  #4E4E52   ← medium emphasis
gray-800:  #2C2C33   ← dark surface
gray-850:  #1A1A1F   ← near-black surface
gray-900:  #101014   ← deep dark
gray-1000: #0B0B0C   ← near-black
```

### Character Accent Colors

Each character has a soft pastel accent for their avatar container / background tint.

| Character | Name | Hex | Modality |
|-----------|------|-----|----------|
| Cat | Tomo | `#F2D47C` | Storytelling / Teaching |
| Octopus | Gramma | `#92B1D1` | Grammar / Spelling |
| Fox | Argoo | `#E49C88` | Debating |
| Panda | Wordie | `#92949E` | Vocabulary |
| Parrot | Echo | `#97BBA0` | Story twist |

### Light-Screen Text Contrast Pairs

| Usage | Text | Background | Ratio |
|-------|------|------------|-------|
| Body text | `#0F172A` | `#FFFFFF` | 19:1 ✓ |
| Secondary text | `gray-500 (#64748B)` | `#FFFFFF` | 5.9:1 ✓ |
| Badge text | `#FFFFFF` | `#000/80` | ≥7:1 ✓ |
| Completed label | `#16a34a` | `#FFFFFF` | 5.9:1 ✓ |
| CTA button text (coral) | `#FFFFFF` | `#f25a57` | 4.6:1 ✓ |
| CTA button text (gold) | `#111111` | `#FAC304` | 11.3:1 ✓ |

---

## 2. Typography

### Font Stack

```css
/* Global body — loaded via Google Fonts */
font-family: "Nunito", sans-serif;

/* Logo */
font-family: "Exo 2", sans-serif;  /* .logo class */

/* Tailwind custom families */
font-favorit: var(--font-favorit), Arial, sans-serif;
font-inter:   var(--font-inter), Arial, sans-serif;
font-fira:    var(--font-fira), monospace;   /* code/mono contexts */
```

**Nunito** is the primary body font. Hero, browse, and circle-detail titles may use the existing `font-display` family when matching the editorial hero treatment.

### Type Scale

| Role | Class | Size | Weight | Usage |
|------|-------|------|--------|-------|
| Hero title | `text-6xl font-bold` | 60px | 700 | Circle page book titles |
| Display | `text-5xl font-bold` | 48px | 700 | Hero card titles (md+) |
| H1 | `text-3xl font-bold` | 30px | 700 | Section headings |
| H2 | `text-2xl font-bold` | 26px | 700 | `h2` default = 26px |
| H3 | `text-lg font-semibold` | 18px | 600 | Sub-section labels |
| Body | `text-base` | 16px | 400 | Default body copy |
| Caption | `text-sm` | 14px | 400–500 | Meta, type names, durations |
| Label | `text-xs` | 12px | 400–600 | Nav labels, badges, kickers |

### Tracking Conventions

| Context | Class |
|---------|-------|
| Hero title tight | `tracking-[-0.03em]` |
| Kicker / eyebrow | `tracking-[0.2em]` uppercase |
| Badge / tag | `tracking-wide` uppercase |
| Body | Default (no explicit tracking) |

---

## 3. Spacing

4/8px base unit system:

```
4px   → gap-1, p-1
8px   → gap-2, p-2      ← minimum touch spacing between targets
12px  → gap-3, p-3
16px  → gap-4, p-4      ← standard horizontal padding
20px  → gap-5, p-5
24px  → gap-6, p-6      ← section internal padding
32px  → mt-8, gap-8
48px  → mt-12           ← between major sections
96px  → pb-24           ← bottom padding to clear nav bar
```

**Section vertical rhythm:** mt-4 (tight grouping) → mt-8 (component separation) → mt-12 (section separation).

---

## 4. Border Radius

| Shape | Class | Usage |
|-------|-------|-------|
| Full pill | `rounded-full` | Buttons, badges, nav items, avatars, dots |
| Large card | `rounded-[28px]` | Hero cards (FeaturedHero, NextDotCard), desktop shell |
| Medium card | `rounded-2xl` | CircleCard covers, modals |
| Small | `rounded` | Progress bars |
| Button back | `rounded-full` | Back button, all CTAs |

---

## 5. Elevation & Shadows

This is a **flat-design** product. Shadow use is minimal and intentional:

| Context | Shadow |
|---------|--------|
| Hero content card | `shadow-[0_12px_30px_rgba(0,0,0,0.2)]` |
| Featured hero container | `shadow-lg` |
| Play button glow ring | `box-shadow: 0 0 0 8px rgba(242,90,87,0.22)` |
| Active mic glow | `box-shadow: 0 0 16px 4px #f78ad7, 0 2px 8px rgba(0,0,0,0.08)` |
| Cards (ring, not shadow) | `ring-1 ring-black/10` |

Never add arbitrary drop shadows. Use `ring-*` for card outlines and the specific box-shadow values above for glow effects.

---

## 6. Surfaces (Two-Surface System)

The app has two distinct visual surfaces that must not be mixed on the same screen:

### Light Surface (Library / Browse)
- Background: pure white `#FFFFFF` / `bg-library` for neutral browse layouts
- Warm variant: `#F4ECDF → #EFE6D8` for hero-aligned browse / circle-detail surfaces
- Text: `text-gray-900` (#0F172A)
- Cards: white with `ring-1 ring-black/10`
- Hero overlay: either `bg-gradient-to-t from-black/80 via-black/30 to-transparent` or the warmer editorial gradient used by `CurrentCircleHero` / `CirclePage`
- Used in: LibraryPage, BrowsePage, CirclePage, ProgressSection

### Dark Surface (Voice / Talk)
- Background: `#000000`
- Text: `#FFFFFF`
- Speech bubbles: `#232329` (surface-dark)
- Bottom nav: always `#000000`
- Used in: TalkWithBook (voice session), CharacterContainer, Transcript

---

## 7. Component Patterns

### Buttons

**Primary CTA (Play, dark-surface card)**
```tsx
// Coral/red pill — always full-width or 80×80px circle
className="rounded-full bg-[#f25a57] text-white shadow-[0_0_0_8px_rgba(242,90,87,0.22)] transition hover:scale-[1.02]"
```

**Primary CTA (Play, hero-aligned light surface)**
```tsx
className="rounded-full bg-[#FAC304] text-black shadow-[0_0_0_8px_rgba(250,195,4,0.22)] transition hover:scale-[1.02]"
```

**Secondary Action (replay/resume pill)**
```tsx
className="rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-800 hover:bg-gray-300"
```

**SplitColorButton** — signature component for character selection. Uses `linear-gradient` split with `clip-path` text technique. Always `rounded-full h-12`.

**Back Button**
```tsx
className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white"
```

Minimum touch target: **44×44px** (`min-h-[44px] min-w-[44px]`).

### Cards

**CircleCard** — book card in browse rows
- Size: `w-40` (mobile) → `w-64` (md+)
- Cover: `aspect-[2/3]` with `rounded-2xl`
- Badge: top-left pill, `bg-black/80`, uppercase, `text-[10px]`
- Hover: `group-hover:scale-[1.03]` on cover image (300ms)

**FeaturedHero** — full-bleed hero slider
- Height: `h-[62vh] min-h-[300px]`
- `rounded-[28px]`
- Gradient overlay from bottom
- Title: `text-3xl font-bold` (mobile) → `text-5xl font-bold` (md+)
- Slide transition: `translateX` with `duration-500 ease-out`

**NextDotCard** — today's mission card
- `rounded-[28px] bg-black text-white`
- Play button: `absolute right-5 top-1/2 -translate-y-1/2`, 80×80px circle

### Progress Dots

Used to show episode progress inline on cards:
```tsx
// Filled (completed)
className="h-2.5 w-2.5 rounded-full bg-black border-2 border-black/40"

// Paused (current)
className="h-2.5 w-2.5 rounded-full border-[2.5px] border-black bg-transparent"

// Empty
className="h-2.5 w-2.5 rounded-full border-2 border-black/40 bg-transparent"
```

On dark backgrounds (hero), use `bg-white` and `border-white/70` instead.

### CircleDotsSymbol

Reusable episode-progress symbol used in hero/detail contexts.

- Outer ring with evenly spaced dots around a circle
- Two visual states only for dots: completed (`#FAC304`) and not completed (same color as ring)
- The dot matching the current row / episode number may be larger, but not recolored
- Optional center label for episode number
- Default dark version:
  - ring / incomplete dots: `#0A1024`
  - completed dots: `#FAC304`
  - label: `#111111`
- Inverted hero/detail version:
  - ring / incomplete dots: `#FFFFFF`
  - completed dots: `#FAC304`
  - label: `#FFFFFF`

### Bottom Navigation
- Height: `h-16` (64px)
- Background: always `#000000`
- 3 items max (current: Circles, Tomo, Parents)
- Icons: SVG, `w-6 h-6`, stroke-width 2.5 (active) / 1.5 (inactive)
- Labels: `text-xs`, always white, `font-weight: 800` active / `400` inactive
- No visual active indicator beyond font weight (current pattern)

### Speech Bubbles
- Background: `#232329`
- `border-radius: 45px`
- CSS `::after` arrow pointing down-right

---

## 8. Animation & Motion

### Defined Animations

| Name | Duration | Easing | Trigger |
|------|----------|--------|---------|
| `animate-fade-in` | 280ms | `ease-out` | Route entry, content reveal |
| `.scale-up` | 100ms | `forwards` | Press start (scale 0.95→1) |
| `.scale-down` | 100ms | `forwards` | Press end (scale 1→0.95) |
| `.mic-pulse` | 1200ms | `infinite` | Mic active state (scale 1.08) |
| `slowSpin` | 1500ms | `linear` | Loading indicator |
| `character-orb-wrapper` | 160ms | `ease` | Volume response animation |
| Orb opacity | 300ms | `ease` | Disabled/loading state |
| Hero slide | 500ms | `ease-out` | FeaturedHero carousel |
| Parallax scroll | rAF | — | CirclePage header |

### Rules
- Press feedback: scale 0.95–0.97, ≤100ms — applied via `.scale-up/.scale-down` or `hover:scale-[1.02]`
- Entrances: `ease-out`; exits: `ease-in`
- Never animate `width`, `height`, `top`, `left` — only `transform` and `opacity`
- All scroll-driven animations use `requestAnimationFrame` (see CirclePage parallax)
- Respect `prefers-reduced-motion` — disable `animate-fade-in`, `.mic-pulse`, carousel motion

---

## 9. Layout

### Mobile Shell
```
Device viewport → #root (flex column, 100%)
  └── .app-mobile-shell (100vh via --vh, flex column)
       ├── Page content (flex-1, scrollable)
       └── BottomNavBar (flex-shrink-0, h-16)
```

On desktop ≥1367px, the shell is constrained to **402×874px** aspect ratio, centered with `border-radius: 24px`.

### Safe Areas
- `.safe-area-top`: `padding-top: calc(1rem + env(safe-area-inset-top))`
- Bottom: `padding-bottom: calc(4rem + env(safe-area-inset-bottom))` via `.with-bottom-nav`
- Horizontal: `env(safe-area-inset-left/right)` on `.app-mobile-shell`

### Page Padding
- Standard horizontal: `px-6` (24px)
- Bottom clearance for nav: `pb-24` (96px)

### Horizontal Scroll Rows
Used for browse card rows:
```tsx
className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
```

### Viewport Height
Use `calc(var(--vh, 1vh) * 100)` instead of `100vh` for mobile. The `--vh` custom property is set via JS to handle iOS Safari toolbar offsets.

---

## 10. Iconography

- All icons are **inline SVG components** in `src/components/common/icons/`
- Standard size: `w-6 h-6` (24×24px)
- Stroke-based icons: consistent stroke-width (1.5 inactive, 2.5 active in nav)
- No emoji as icons
- No external icon library — all custom SVG

---

## 11. Image Conventions

### Book Covers
- Fetched via `useCircleCover()` hook (adds Supabase storage URL)
- Aspect ratio: `2/3` (portrait book cover)
- Object fit: `object-cover`
- Fallback: gray placeholder with "No cover" text

### Discussion Backgrounds
- Located: `src/assets/img/discussion/{bookId}/{modality}/{landscape/}{talk|listen}.png`
- Loaded dynamically via `import.meta.glob()`
- Supports portrait/landscape and per-book overrides

### Character Avatars
- SVG files in `src/assets/img/characters/`
- States: `idle`, `listening`, `sleeping`, `celebrating`
- Displayed via `<img src={character.images.idle} />`

---

## 12. UX Rules (App-Specific)

1. **Single primary action per screen** — one visible play/CTA button per view
2. **No hover-only interactions** — all interactions via onClick (touch device primary)
3. **Tap highlight removal** — `.tap-safe` class on interactive orbs/animations to remove WebKit highlight
4. **Scroll state preservation** — navigate back restores scroll position via `scrollPositionsRef` in App.jsx
5. **overscroll-behavior: contain** — on scroll containers to prevent pull-to-refresh conflicts
6. **Bottom nav always visible** — never hide bottom nav during in-app navigation (only during voice session)
7. **Gradient overlays** — for dark-on-image text: `bg-gradient-to-t from-black/80 via-black/30 to-transparent`
8. **Loading states** — inline "Loading..." text for episode data; skeleton/orb animation for voice pipeline
9. **Error states** — inline red text near the affected content (`text-red-600`), not toast-only

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (all SVG)
- [ ] Touch targets ≥ 44×44px
- [ ] Min 8px gap between tappable elements
- [ ] Tap feedback (scale 0.95–0.97 within 100ms)
- [ ] Using `transform`/`opacity` only for animations
- [ ] Safe area insets respected (top + bottom)
- [ ] `pb-24` on scrollable page content (clears bottom nav)
- [ ] Text contrast ≥ 4.5:1 (light surface), ≥ 4.5:1 (dark surface)
- [ ] `var(--vh)` used instead of `100vh`
- [ ] `[scrollbar-width:none]` on horizontal scroll rows
- [ ] Character accent color used for customBg, not inline hex
- [ ] New screens use either full dark OR full light surface — never mixed
