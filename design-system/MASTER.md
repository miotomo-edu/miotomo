# Miotomo Design System — MASTER

> Voice-first AI learning companion for children aged 7–12.
> Single AI character: **Tomo**. One product. One design language.

---

## 1. Brand Personality

| Dimension | Direction |
|-----------|-----------|
| Age target | 7–12 (child holds the device; parent approves) |
| Tone | Warm, curious, encouraging — never condescending |
| Energy | Calm confidence, not hyperactive |
| Visual style | **Warm Claymorphism** — soft depth, rounded forms, tactile warmth |
| Forbidden | Neon, cold blues, sterile white, aggressive reds, emoji as icons |

**Style rationale:** Claymorphism (soft 3D depth, multi-layer shadows, generous border-radii, spring-physics press feedback) is the ideal match for a children's companion app. It communicates safety and warmth without being infantilising.

---

## 2. Color Tokens

### 2.1 Semantic Tokens (what to use in code)

Replace all raw hex values with these names. Define them as CSS variables in `globals.css` and as Tailwind tokens in `tailwind.config.cjs`.

```
--color-brand-primary    #FAC304   Gold — primary CTA, active nav, highlights
--color-brand-dark       #1A1A1F   Near-black — primary dark surface
--color-brand-danger     #f25a57   Red — destructive, error states

--color-surface-base     #FFFFFF   Default page background (library, onboarding)
--color-surface-warm     #F4ECDF   Warm cream — calm sections (parents, post-onboarding)
--color-surface-circle   #EFE6DA   Circle page background
--color-surface-dark     #101014   Interactive/talk screen background
--color-surface-card     #FFFFFF   Card backgrounds in light sections

--color-tomo             #F2D47C   Tomo's character accent (badge panels, intro tints)

--color-text-primary     #111111   Default body text on light surfaces
--color-text-secondary   #7B7264   Muted text, meta labels
--color-text-inverse     #EFE6D6   Primary text on dark surfaces
--color-text-muted-inv   #D8CDBD   Muted text on dark surfaces
--color-text-gold        #C59A41   Decorative gold text (on dark)

--color-user-bubble      #C492F1   User chat bubble (purple)
--color-assistant-bubble #FAC304   Tomo chat bubble (gold)

--color-border-light     rgba(0,0,0,0.10)   Borders on light surfaces
--color-border-dark      rgba(255,255,255,0.14)  Borders on dark surfaces
```

### 2.2 Gray Scale (keep in Tailwind config)

Already defined in `tailwind.config.cjs`. No changes needed.

```
gray-25   #FBFBFF
gray-200  #E1E1E5
gray-350  #BBBBBF
gray-450  #949498
gray-600  #616165
gray-700  #4E4E52
gray-800  #2C2C33
gray-850  #1A1A1F
gray-900  #101014
gray-1000 #0B0B0C
```

### 2.3 Remove from Tailwind Config

These character tokens reference removed characters and should be deleted:

```js
// DELETE from tailwind.config.cjs → colors.character:
gramma: "#92B1D1"
argoo:  "#E49C88"
wordie: "#92949E"
echo:   "#97BBA0"

// RENAME:
character.tomo → color-tomo (keep as a named token, not a character system)
```

### 2.4 Add to Tailwind Config

```js
colors: {
  brand: {
    primary: "#FAC304",
    dark:    "#1A1A1F",
    danger:  "#f25a57",
  },
  surface: {
    base:   "#FFFFFF",
    warm:   "#F4ECDF",
    circle: "#EFE6DA",
    dark:   "#101014",
  },
  tomo: "#F2D47C",
}
```

---

## 3. Typography

### 3.1 Font Families

| Role | Font | Weight Range | Use |
|------|------|-------------|-----|
| Display | **Baloo 2** | 400–700 | All headings, large titles, Tomo speech |
| Body | **Nunito** | 400–700 | Body copy, labels, UI text |

**Body font note:** Nunito is well-suited to this age group — friendly, rounded, highly legible. Do not change. The script-generated suggestion (Comic Neue) is less legible at small sizes and should be ignored.

### 3.2 Type Scale (replace all arbitrary `text-[...]` values)

Replace the current 25+ arbitrary font size values with this 8-step scale:

| Token | px | Tailwind | Use |
|-------|----|---------|-----|
| `text-xs` | 12px | `text-xs` | Metadata, timestamps, tiny labels |
| `text-sm` | 14px | `text-sm` | Secondary labels, helper text |
| `text-base` | 16px | `text-base` | Body copy, default UI text |
| `text-lg` | 18px | `text-lg` | Prominent labels, section headers |
| `text-xl` | 20px | `text-xl` | Card titles, subheadings |
| `text-2xl` | 24px | `text-2xl` | Section headings |
| `text-3xl` | 30px | `text-3xl` | Page headings |
| `text-4xl` | 36px | `text-4xl` | Hero headings |
| `text-5xl` | 48px | `text-5xl` | Display / landing hero only |

For truly large display moments (intro screens, completion screens), `text-5xl` is the ceiling. Do not add arbitrary rem values above this.

### 3.3 Weight Conventions

| Use case | Weight |
|----------|--------|
| Display headings | `font-bold` (700) |
| Section headings | `font-semibold` (600) |
| Body, labels | `font-medium` (500) |
| Metadata, muted | `font-normal` (400) |

### 3.4 Letter Spacing Conventions

| Token | Value | Use |
|-------|-------|-----|
| `tracking-normal` | 0 | Body text |
| `tracking-wide` | 0.025em | Navigation labels |
| `tracking-wider` | 0.05em | Uppercase section labels |
| `tracking-widest` | 0.1em | All-caps badges, pill labels |

Do not use arbitrary `tracking-[...]` values. Collapse the current 10+ custom tracking values into these four.

### 3.5 Line Height Conventions

| Use | Class |
|-----|-------|
| Display headings | `leading-none` or `leading-tight` |
| Section headings | `leading-snug` |
| Body copy | `leading-relaxed` (1.625) |
| Chat / speech text | `leading-7` |

---

## 4. Spacing

The app uses an implicit 4dp/8dp grid. Make it explicit.

### 4.1 Standard Spacing (use Tailwind defaults — no custom values needed)

| Tailwind | px | Use |
|----------|----|-----|
| `space-1` | 4px | Micro gaps (icon to label) |
| `space-2` | 8px | Tight component internal gap |
| `space-3` | 12px | Default internal padding |
| `space-4` | 16px | Standard component padding |
| `space-5` | 20px | Loose internal padding |
| `space-6` | 24px | Section internal padding |
| `space-8` | 32px | Between components |
| `space-10` | 40px | Between sections |
| `space-12` | 48px | Large section separation |

### 4.2 Page Horizontal Padding

| Context | Value |
|---------|-------|
| Mobile content | `px-4` (16px) |
| Mobile cards/rows | `px-4` to `px-5` |
| Wide sections | `px-6` (24px) |
| Desktop (≥1024px) | `px-8` (32px) |

### 4.3 App Shell

The mobile shell is fixed at `402px` width. This is a known constraint, not a design error. Do not modify.

---

## 5. Border Radius Scale

Replace the current ~15 arbitrary radius values with this 6-step scale:

| Token | Value | Tailwind | Use |
|-------|-------|---------|-----|
| `radius-sm` | 8px | `rounded-lg` | Chips, tags, small badges |
| `radius-md` | 12px | `rounded-xl` | Buttons, input fields |
| `radius-lg` | 16px | `rounded-2xl` | Cards (standard) |
| `radius-xl` | 24px | `rounded-3xl` | Panels, modals, episode rows |
| `radius-2xl` | 32px | `rounded-[32px]` | Hero sections, large cards |
| `radius-full` | 9999px | `rounded-full` | Avatars, circular buttons, pills |

**Migration:** Audit all `rounded-[22px]`, `rounded-[28px]`, `rounded-[34px]`, etc. and collapse them to the nearest scale step.

---

## 6. Shadow / Elevation Scale

Current state: ~20 different custom shadow values scattered across components. Collapse to 5 named levels:

| Level | CSS Value | Use |
|-------|-----------|-----|
| `shadow-xs` | `0 1px 3px rgba(0,0,0,0.08)` | Subtle separation (cards on white) |
| `shadow-sm` | `0 4px 12px rgba(0,0,0,0.10)` | Standard card depth |
| `shadow-md` | `0 8px 24px rgba(0,0,0,0.14)` | Elevated cards, modals |
| `shadow-lg` | `0 14px 40px rgba(0,0,0,0.22)` | Featured hero, play buttons |
| `shadow-xl` | `0 28px 90px rgba(25,26,20,0.18)` | Full hero sections (CurrentCircleHero) |
| `shadow-glow-gold` | `0 0 0 6px rgba(250,195,4,0.22)` | Gold ring around active play button |
| `shadow-glow-mic` | `0 0 16px 4px #f78ad7, 0 2px 8px rgba(0,0,0,0.08)` | Mic pulse (listening state) |

Add these as custom shadow tokens in `tailwind.config.cjs`:
```js
boxShadow: {
  'xs': '0 1px 3px rgba(0,0,0,0.08)',
  'card': '0 4px 12px rgba(0,0,0,0.10)',
  'elevated': '0 8px 24px rgba(0,0,0,0.14)',
  'hero': '0 14px 40px rgba(0,0,0,0.22)',
  'stage': '0 28px 90px rgba(25,26,20,0.18)',
  'glow-gold': '0 0 0 6px rgba(250,195,4,0.22)',
  'glow-mic': '0 0 16px 4px #f78ad7, 0 2px 8px rgba(0,0,0,0.08)',
  'inset-highlight': 'inset 0 1px 0 rgba(255,255,255,0.45)',
}
```

---

## 7. Animation Tokens

### 7.1 Duration

| Token | Value | Use |
|-------|-------|-----|
| `duration-fast` | 100ms | Tap feedback (scale down) |
| `duration-base` | 150ms | Default transitions |
| `duration-moderate` | 300ms | Color/opacity transitions |
| `duration-slow` | 500ms | Hero expand/collapse |

### 7.2 Easing

| Token | Value | Use |
|-------|-------|-----|
| `ease-spring` | `cubic-bezier(0.22, 1, 0.36, 1)` | Hero expansion, modal entry |
| `ease-out` | Tailwind default | Most entering elements |
| `ease-in` | Tailwind default | Exiting elements |

### 7.3 Standard Interaction Feedback

All tappable elements follow this pattern — no exceptions:
```
hover:brightness-[1.03]
active:scale-[0.97]
transition duration-150 ease-out
```

For large CTA buttons:
```
hover:scale-[1.02]
active:scale-[0.98]
transition duration-150 ease-out
```

### 7.4 Named Animations (globals.css)

| Class | Behavior | Duration |
|-------|----------|----------|
| `.animate-fade-in` | opacity 0→1, translateY 4px→0 | 280ms ease-out |
| `.mic-pulse` | scale 1→1.08→1 | 1.2s infinite |
| `.mic-glow` | pink glow shadow | static class |
| `.slow-spin` | rotate -360deg | 1.5s linear |

All animations must respect `prefers-reduced-motion`. Add to `globals.css`:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .mic-pulse,
  .slow-spin {
    animation: none;
  }
  * {
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Component Patterns

### 8.1 Primary CTA Button

```
bg-[#FAC304]  text-gray-900  font-bold  uppercase  tracking-wider
rounded-full  px-6 py-3.5  min-h-[52px]
shadow-hero  shadow-inset-highlight
hover:brightness-[1.04] active:scale-[0.97]
transition duration-150 ease-out
```

### 8.2 Secondary Button

```
bg-white/10  border border-white/30  text-white  font-semibold
rounded-full  px-5 py-3  min-h-[48px]
hover:bg-white/18 active:scale-[0.97]
transition duration-150 ease-out
```

### 8.3 Standard Card (light surface)

```
bg-white  rounded-2xl  shadow-card
border border-black/[0.07]
p-4
```

### 8.4 Episode Row Card

```
bg-white/80  rounded-3xl  border border-black/10
px-4 py-4  gap-3
```

### 8.5 Play Button (large, circular)

```
bg-[#FAC304]  rounded-full  w-16 h-16 (or w-24 h-24 for hero)
shadow-hero  shadow-glow-gold
hover:scale-[1.03] active:scale-[0.97]
transition duration-150 ease-out
```

### 8.6 Bottom Navigation

```
bg-black  h-16 + safe-area-inset-bottom
Icon active: #FAC304
Icon inactive: rgba(255,255,255,0.55)
Active dot: h-1 w-1 rounded-full bg-[#FAC304]
```

---

## 9. Screen-Level Color Mapping

| Screen | Background | Text | Notes |
|--------|-----------|------|-------|
| Library / Home | `#FFFFFF` | `#111111` | Default light |
| Browse | `#FFFFFF` → dark | Mixed | Dark category section |
| Circle page | `#EFE6DA` | `#111111` | Warm cream |
| TalkWithBook | `#000000` | `#EFE6D6` | Full dark, interactive |
| Parents | `#F6EFE2` | `#111111` | Warm cream |
| Progress | `#EFE6DA` | `#111111` | Warm cream (matches Circle page) |
| Onboarding | `#FFFFFF` | `#111111` | Clean white |
| Post-onboarding | `#F4ECDF` | `#111111` | Warm cream |

---

## 10. Visual Audit — Live App Observations

Captured by navigating the live app at `localhost:3000` on a 430×932 mobile viewport.

### Home / Circles Screen
- ✅ Tomo avatar with gold star badge — warm, inviting, well-executed
- ✅ Gold accent bar before section headings (`Continue talking`, `New`, `Nature Wonders`) — consistent and branded
- ✅ BY DESIGN: Two chip styles co-exist — filled black for active category, outlined for `All ▾`. Intentional active/inactive distinction.
- ✅ Play button on home hero unified to gold `#FAC304` matching Circle page
- ✅ BY DESIGN: "Continue talking" has no subtitle — intentional; the section heading is sufficient context
- ✅ Beautiful illustrated artwork for Circle covers — distinctive and premium-feeling

### Circle Page
- ✅ Hero image fills the top edge-to-edge — immersive and bold
- ✅ "Today's Mission" dark featured card with gold play button — clear hierarchy, strong visual weight
- ✅ BY DESIGN: Dot modality icons vary per dot type — `LISTEN + TALK TIME + VOCABULARY` vs `TAKE A SIDE` vs `TEACH TIME WITH TOMO` reflects real content differences, not a bug
- ✅ BY DESIGN: Only the current dot is tappable; dots unlock sequentially. Static appearance of locked dots is intentional.
- ✅ Dot number indicators (circular node diagrams) are unique and memorable
- ✅ Dark episode cards on the cream Circle page background create strong contrast

### Progress / Tomo Screen
- ✅ Restyled to warm cream (`#EFE6DA`) matching Library/Circle visual system
- ✅ Weekly day selector uses gold active day circle with glow — consistent with brand
- ✅ Star emoji replaced with `StarIcon` SVG component
- ✅ Distinct SVG icons added to each skill category (brain, speech bubble, star).
- ✅ Collapse panels upgraded: `<div>` → `<button>`, animated SVG chevron, white card surface

### Parents Screen
- ✅ Placeholder developer text replaced with user-facing "Coming soon" copy

### Navigation Bar
- ✅ Black bar, gold active icon+label, muted white inactive — clear and branded
- ⚠️ **Tomo icon is text-rendered** (`o_o` face) rather than an SVG. This may render inconsistently across fonts and OS versions
- BY DESIGN: ⚠️ **Only 3 nav items** — the design system notes a max of 5, but 3 items leaves a lot of empty space in the bar; consider whether this is intentional or if items are missing

---

## 11. UI Audit — Issues & Priorities

### Critical (affects usability / accessibility)

1. ✅ **DONE — `prefers-reduced-motion` support added** — block added to `globals.css`; `.mic-pulse`, `.animate-fade-in`, `.slow-spin` are suppressed and all transitions clamped to 0.01ms.

2. ✅ **DONE — `:focus-visible` outline added** — `2px solid #FAC304` ring in `globals.css` restores visible keyboard/switch-access focus state.

3. **Icon-only buttons lack `aria-label`** — the mic button, play button, and navigation icons in `TalkWithBook.tsx` and `BottomNavBar.tsx` should have `aria-label` on every `<button>` that contains only an icon.

### High (visual inconsistency / design debt)

4. **Typography fragmentation** — 25+ arbitrary `text-[...]` values across the codebase. Migrate all to the 8-step scale in §3.2. This is the single largest source of visual inconsistency.

5. **Border radius inconsistency** — values span 3px → 34px with no semantic meaning. Migrate to the 6-step scale in §5.

6. ✅ **DONE — Stale character tokens removed** — `character.gramma/argoo/wordie/echo` deleted; `character.tomo` renamed to `tomo`. `brand`, `surface`, and shadow tokens added.

7. ✅ **DONE — `#FAC304` migrated to `brand-primary` token** — all Tailwind class usages replaced; inline styles and SVG props retain hex (Tailwind tokens don't apply there).

8. **Shadow values are all one-offs** — no two components use the same shadow. Migrate to the 7 named shadow tokens in §6.

### Medium (polish / maintainability)

9. **Letter spacing fragmentation** — 10 different custom `tracking-[...]` values. Collapse to the 4 named tokens in §3.4.

10. **Inconsistent button tap feedback** — some buttons use `hover:brightness-105`, others `hover:scale-[1.02]`, others `hover:brightness-[1.02]`. Standardise to the pattern in §7.3.

11. **`#C492F1` (user bubble purple) has no semantic token name** — appears only in chat. Define as `--color-user-bubble` and add to Tailwind config.

12. **Desktop background `#836e6e` is hardcoded in CSS** — should be a named token if it stays, or reconsidered (it's an odd brownish purple that doesn't match the warm palette).

### Low (nice to have)

13. **Missing skeleton/shimmer loading states** — loading screens show a text spinner ("Loading vocab...", "Loading..."). Replace with skeleton shapes matching the content layout for perceived performance.

14. **No `cursor-pointer` on tappable elements** — needed for desktop/web PWA users.

15. **The `scrollbar-thin` utility class** is defined but its `thumb` color is not set — the scrollbar renders browser-default. Add `background: rgba(0,0,0,0.2)` to `.scrollbar-thin::-webkit-scrollbar-thumb`.

---

## 11. Migration Priorities

Do these in order. Each step is independent — you can stop at any point.

| Step | Change | Impact |
|------|--------|--------|
| ~~1~~ | ✅ Add `prefers-reduced-motion` block to `globals.css` | Accessibility |
| ~~2~~ | ✅ Add `:focus-visible` outline to `globals.css` | Accessibility |
| ~~3~~ | ✅ Delete stale character tokens from `tailwind.config.cjs` | Cleanliness |
| ~~4~~ | ✅ Add `brand`, `surface`, `tomo` tokens to `tailwind.config.cjs` | Foundation |
| ~~5~~ | ✅ Add named shadow tokens to `tailwind.config.cjs` | Foundation |
| ~~6~~ | ✅ Migrate `#FAC304` hardcodes to `bg-brand-primary` / `text-brand-primary` | Consistency |
| ~~7~~ | ✅ Migrate typography to 8-step scale | Visual consistency |
| ~~8~~ | ✅ Migrate border radius to 6-step scale | Visual consistency |
| ~~9~~ | ✅ Migrate shadows to named tokens | Visual consistency |
| ~~10~~ | ✅ Standardise button interaction pattern | Polish |

---

## 13. What Not To Change

- **Font families**: Baloo 2 + Nunito is the right pairing for this age group. Do not change.
- **`#FAC304` as primary brand color**: The gold is distinctive and warm. Keep it.
- **App shell width (402px)**: This is an intentional mobile-emulation constraint. Do not change.
- **Dark background on TalkWithBook**: Full black during voice sessions creates focus. Keep it.
- **Gray scale in Tailwind**: The existing custom gray scale is coherent and useful. Keep it.
