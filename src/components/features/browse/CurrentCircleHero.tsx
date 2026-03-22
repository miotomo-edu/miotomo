import React from "react";
import type { Book } from "../../sections/LibrarySection";
import { useCircleCover } from "../../../hooks/useCircleCover";

type CurrentCircleHeroProps = {
  item: {
    book: Book;
    badge?: string;
    kicker?: string;
    totalDots?: number;
    completedDots?: number;
    currentDot?: number;
    nextDotTitle?: string;
    nextChapter?: number;
  };
  onSelect: (book: Book) => void;
};

const CurrentCircleHero: React.FC<CurrentCircleHeroProps> = ({
  item,
  onSelect,
}) => {
  const coverUrl = useCircleCover(item.book.thumbnailUrl);
  const handleSelect = () => onSelect(item.book);
  const hasDots = typeof item.totalDots === "number" && item.totalDots > 0;
  const completedDots =
    typeof item.completedDots === "number" && item.completedDots > 0
      ? Math.min(item.completedDots, item.totalDots ?? item.completedDots)
      : 0;
  const currentDot =
    typeof item.currentDot === "number" && item.currentDot > 0
      ? item.currentDot
      : null;

  return (
    <section className="px-4">
      <h1 className="mb-7 text-3xl font-bold leading-none md:text-5xl">
        Continue talking
      </h1>
      <div
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleSelect();
          }
        }}
        className="relative h-[62vh] min-h-[300px] w-full overflow-hidden rounded-[28px] text-left shadow-lg"
        aria-label={`Open current circle: ${item.book.title}`}
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
            aria-label={`Play ${item.book.title}`}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-white/55 text-black backdrop-blur-sm transition hover:bg-white/65 md:h-32 md:w-32"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="h-12 w-12 md:h-16 md:w-16"
              fill="currentColor"
            >
              <path d="M4 2.5v11l9-5.5-9-5.5z" />
            </svg>
          </button>
        </div>
        <div className="absolute bottom-6 left-6 right-6 text-white md:bottom-8 md:left-8 md:right-8">
          {item.book.title ? (
            <div className="text-lg font-semibold uppercase tracking-[0.2em] text-white/80 md:text-sm">
              {`Continue ${item.book.title}`}
            </div>
          ) : null}
          <div className="mt-2 max-w-xl text-3xl font-bold leading-tight md:text-5xl">
            {item.nextDotTitle || item.book.title}
          </div>
          {hasDots ? (
            <div className="mt-4 flex flex-wrap gap-1 md:gap-1.5">
              {Array.from({ length: item.totalDots ?? 0 }).map((_, index) => {
                const isFilled = index < completedDots;
                const isCurrent =
                  currentDot !== null && index + 1 === currentDot && !isFilled;
                return (
                  <span
                    key={`${item.book.id}-current-dot-${index}`}
                    className={`h-2.5 w-2.5 rounded-full md:h-4 md:w-4 ${
                      isCurrent
                        ? "border-[2.5px] border-white"
                        : "border-2 border-white/80"
                    } ${isFilled ? "bg-white" : "bg-transparent"}`}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default CurrentCircleHero;
