# Browse / Library Page — Design Override

> Overrides MASTER.md for: BrowsePage, LibraryPage, FeaturedHero, BrowseRow, CircleCard, CategoryChips

---

## Surface
Full light surface. Default background is `#FFFFFF` / `bg-library`, but hero-aligned browse/library variants may use the warm paper gradient `#F4ECDF → #EFE6D8`. Black text.

## FeaturedHero
- Height: `h-[62vh] min-h-[300px]`
- `rounded-[28px]` container
- Full-bleed cover image (`object-cover`)
- Gradient overlay: `bg-gradient-to-t from-black/80 via-black/30 to-transparent`
- Title: `text-3xl font-bold` (mobile) → `text-5xl font-bold` (md+)
- Kicker: `text-xs font-semibold uppercase tracking-[0.2em] text-white/80`
- Slide transition: `translateX` with `duration-500 ease-out`
- Carousel arrows: `text-7xl` (mobile) → `text-[10rem]` (md+), white with `drop-shadow`

## BrowseRow
- Section heading: `text-lg font-semibold text-black`
- Horizontal scroll: `flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`
- Row items: CircleCard (160px mobile, 256px md+)

## CircleCard
- Width: `w-40` (mobile) → `w-64` (md+)
- Cover: `aspect-[2/3] rounded-2xl ring-1 ring-black/10`
- Badge: `absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white`
- Title: `text-sm font-semibold text-gray-900` (mobile) → `text-xl` (md+)
- Meta: `text-xs font-medium text-gray-500` (mobile) → `text-base` (md+)
- Hover: `group-hover:scale-[1.03]` on cover image, `duration-300`
- `LibraryPage` is a BrowsePage variant with `showContinueRow={false}`, so it inherits this page system directly

## Progress Dots (on cards)
- Dot size: `h-2.5 w-2.5` (mobile) → `h-3.5 w-3.5` (md+)
- All dots: `rounded-full`
- Filled: `bg-black border-2 border-black/40`
- Paused/current: `border-[2.5px] border-black bg-transparent`
- Empty: `border-2 border-black/40 bg-transparent`

## CurrentCircleHero Notes
- Uses the warm editorial hero treatment rather than the neutral white browse surface
- Collapsed hero keeps play as the primary CTA and chevron as the expand control
- Expanded hero uses the warm paper panel and may include a quiet `Explore circle` chip after the dot list

## CategoryChips
- Horizontal scroll row above browse content
- Pill-shaped filter chips (expected pattern)
