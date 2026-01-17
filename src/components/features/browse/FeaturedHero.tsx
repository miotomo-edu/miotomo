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
  const hasDots =
    typeof item.totalDots === "number" && item.totalDots > 0;
  const completedDots =
    typeof item.completedDots === "number" && item.completedDots > 0
      ? Math.min(item.completedDots, item.totalDots ?? item.completedDots)
      : 0;
  const currentDot =
    typeof item.currentDot === "number" && item.currentDot > 0
      ? item.currentDot
      : null;

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
        <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
          {item.badge}
        </span>
      ) : null}
      <div className="absolute bottom-6 left-6 right-6 text-white">
        {effectiveKicker ? (
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            {effectiveKicker}
          </div>
        ) : null}
        {hasDots ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {Array.from({ length: item.totalDots ?? 0 }).map((_, index) => {
              const isFilled = index < completedDots;
              const isCurrent =
                currentDot !== null && index + 1 === currentDot && !isFilled;
              return (
                <span
                  key={`${item.book.id}-hero-dot-${index}`}
                  className={`h-2.5 w-2.5 rounded-full ${
                    isCurrent ? "border-2" : "border"
                  } ${isFilled ? "bg-white" : "bg-transparent"} border-white/70`}
                />
              );
            })}
          </div>
        ) : null}
        <div className="mt-2 text-3xl font-bold leading-tight">
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
      className="relative h-[62vh] min-h-[300px] w-full overflow-hidden rounded-[28px] text-left shadow-lg"
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
            className="absolute -left-4 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-black transition hover:text-black"
          >
            <span
              aria-hidden="true"
              className="text-7xl leading-none text-white drop-shadow-[0_0_8px_rgba(0,0,0,1)]"
            >
              ‹
            </span>
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next featured circle"
            className="absolute -right-4 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-black transition hover:text-black"
          >
            <span
              aria-hidden="true"
              className="text-7xl leading-none text-white drop-shadow-[0_0_8px_rgba(0,0,0,1)]"
            >
              ›
            </span>
          </button>
        </>
      ) : null}
    </div>
  );
};

export default FeaturedHero;
