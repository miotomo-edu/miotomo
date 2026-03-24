# Circle Detail Page — Design Override

> Overrides MASTER.md for: CirclePage, NextDotCard

---

## Surface
Light surface with a sticky dark hero at top.

## Sticky Hero Header
- Height: `80vh`
- Full-bleed cover image, `object-cover`
- Parallax: scroll-driven `translateY + scale` via `requestAnimationFrame`
- Gradient overlay: `bg-gradient-to-t from-black/80 via-black/30 to-transparent`
- Book title: `text-6xl font-bold text-white tracking-[-0.03em]` with `text-shadow: 0 6px 14px rgba(0,0,0,1)`
- Back button: `w-10 h-10 rounded-full bg-white/80 hover:bg-white`

## Content Area
- `relative z-10 -mt-16 bg-library` — overlaps hero by 64px
- `px-6 pb-24 pt-8` standard padding

## NextDotCard (Today's Mission)
- `rounded-[28px] bg-black text-white`
- `shadow-[0_12px_30px_rgba(0,0,0,0.2)]`
- Padding: `px-5 pb-4 pt-5 pr-32` (leaves room for play button)
- Episode number: `h-10 w-10 rounded-full bg-white text-black font-bold`
- Title: `text-3xl font-bold leading-[0.95] tracking-[-0.03em]`
- Play button: `absolute right-5 top-1/2 -translate-y-1/2 h-20 w-20 rounded-full bg-[#f25a57]`
  with glow ring `shadow-[0_0_0_8px_rgba(242,90,87,0.22)]`

## Episode List
- Row min-height: `min-h-[88px]` (mobile) → `min-h-[120px]` (md+)
- Dividers: `h-px w-full bg-black/10`
- Episode number circle: `h-8 w-8 rounded-full border-2`
  - Completed: `border-[#f25a57] bg-[#f25a57] text-white`
  - Default: `border-black bg-white text-black`
- Status labels:
  - Completed: `text-sm font-semibold text-green-600`
  - Current: `text-sm font-semibold text-black/55`

## Related Rows (when enabled)
Same pattern as BrowseRow. Currently hidden (`showRecommendationSections = false`).
