# Circle Detail Page — Design Override

> Overrides MASTER.md for: CirclePage, NextDotCard

---

## Surface
Warm paper light surface with a sticky editorial hero at top.

## Sticky Hero Header
- Height: `80vh`
- Full-bleed cover image, `object-cover`
- Parallax: scroll-driven `translateY + scale` via `requestAnimationFrame`
- Gradient overlay: `linear-gradient(180deg, rgba(244,238,224,0) 0%, rgba(27,29,22,0.08) 42%, rgba(12,14,12,0.86) 100%)`
- Book title: `font-display text-5xl font-bold leading-[1.02] text-white` with `text-shadow: 0 6px 14px rgba(0,0,0,1)`
- Back button: `h-11 w-11 rounded-full border border-white/35 bg-white/14 text-white hover:bg-white/22`

## Content Area
- `relative z-10 -mt-16 bg-[linear-gradient(180deg,#f4ecdf_0%,#efe6d8_100%)]` — overlaps hero by 64px
- `px-6 pb-24 pt-8` standard padding

## NextDotCard (Today's Mission)
- `rounded-[30px] border border-black/10 bg-[linear-gradient(180deg,#111111_0%,#181512_100%)] text-white`
- `shadow-[0_18px_44px_rgba(0,0,0,0.18)]`
- Padding: `px-5 pb-5 pt-5 pr-28` (leaves room for play button)
- Episode marker: `CircleDotsSymbol` with white ring / incomplete dots, yellow completed dots, episode number centered
- Title: `font-display text-3xl font-bold leading-[0.96] tracking-[-0.02em]`
- Play button: `absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-[#FAC304] text-black`
  with glow ring `shadow-[0_0_0_8px_rgba(250,195,4,0.22)]`

## Episode List
- Rows use hero-aligned cards:
  - Current: `bg-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]`
  - Default: `bg-white/78 text-black`
- Dividers: subtle `bg-black/8`
- Episode marker: `CircleDotsSymbol`
  - Current row: white ring / incomplete dots, yellow completed dots, white centered number
  - Other rows: deep navy ring / incomplete dots, yellow completed dots, dark centered number
- Status labels:
  - Completed: warm gold/brown emphasis
  - Current: `text-[#FAC304]` with `Current mission ✦`
- Replay button: restrained pill `bg-black/10`

## Related Rows (when enabled)
Same pattern as BrowseRow. Currently hidden (`showRecommendationSections = false`).
