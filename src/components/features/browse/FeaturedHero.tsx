import React, { useState } from "react";
import type { Book } from "../../sections/LibrarySection";
import { useCircleCover } from "../../../hooks/useCircleCover";

type FeaturedHeroProps = {
  items: {
    book: Book;
    badge?: string;
    kicker?: string;
    totalDots?: number;
    completedDots?: number;
    currentDot?: number;
  }[];
  kicker?: string;
  onSelect: (book: Book) => void;
};

const FeaturedHeroSlide: React.FC<{
  item: {
    book: Book;
    badge?: string;
    kicker?: string;
    totalDots?: number;
    completedDots?: number;
    currentDot?: number;
  };
  kicker?: string;
  onSelect: (book: Book) => void;
}> = ({ item, kicker, onSelect }) => {
  const coverUrl = useCircleCover(item.book.thumbnailUrl);
  const effectiveKicker = item.kicker ?? kicker;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.book)}
      className="relative h-full w-full flex-shrink-0 text-left"
      aria-label={`Open featured circle: ${item.book.title}`}
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={item.book.title}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm font-semibold text-gray-600">
          No cover
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      {item.badge ? (
        <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white md:px-4 md:py-2 md:text-sm">
          {item.badge}
        </span>
      ) : null}
      <div className="absolute bottom-6 left-6 right-6 text-white">
        {effectiveKicker ? (
          <div className="text-xs font-semibold uppercase tracking-super text-white/80 md:text-sm">
            {effectiveKicker}
          </div>
        ) : null}
        <div className="font-display mt-2 text-3xl font-extrabold leading-tight md:text-5xl">
          {item.book.title}
        </div>
      </div>
    </button>
  );
};

const FeaturedHero: React.FC<FeaturedHeroProps> = ({
  items,
  kicker,
  onSelect,
}) => {
  const [index, setIndex] = useState(0);
  if (!items || items.length === 0) return null;
  const activeIndex = Math.min(index, items.length - 1);
  const activeItem = items[activeIndex];
  const book = activeItem.book;

  const goPrev = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goNext = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div
      className="relative h-[62vh] min-h-[300px] w-full overflow-hidden rounded-3xl text-left shadow-lg"
      role="region"
      aria-label="Featured circles"
    >
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {items.map((item) => (
          <FeaturedHeroSlide
            key={item.book.id}
            item={item}
            kicker={kicker}
            onSelect={onSelect}
          />
        ))}
      </div>
      {items.length > 1 ? (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous featured circle"
            className="absolute left-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/45 active:scale-[0.97] md:left-3 md:h-16 md:w-16"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 md:h-8 md:w-8" fill="none">
              <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next featured circle"
            className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/45 active:scale-[0.97] md:right-3 md:h-16 md:w-16"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 md:h-8 md:w-8" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      ) : null}
    </div>
  );
};

export default FeaturedHero;
