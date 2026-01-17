import React from "react";
import type { Book } from "../../sections/LibrarySection";
import { useCircleCover } from "../../../hooks/useCircleCover";

type CircleCardProps = {
  book: Book;
  badge?: string;
  meta?: string;
  kicker?: string;
  totalDots?: number;
  completedDots?: number;
  highlightCompleted?: boolean;
  pausedDotIndex?: number;
  onSelect: () => void;
};

const CircleCard: React.FC<CircleCardProps> = ({
  book,
  badge,
  meta,
  kicker,
  totalDots,
  completedDots = 0,
  highlightCompleted = false,
  pausedDotIndex,
  onSelect,
}) => {
  const coverUrl = useCircleCover(book.thumbnailUrl);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-40 shrink-0 flex-col gap-2 text-left"
      aria-label={`Open circle: ${book.title}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-white/70 ring-1 ring-black/10">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm font-semibold text-gray-600">
            No cover
          </div>
        )}
        {badge ? (
          <span className="absolute left-2 top-2 rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-0.5">
        {kicker ? (
          <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-600">
            {kicker}
          </div>
        ) : null}
        {typeof totalDots === "number" && totalDots > 0 ? (
          <div className="my-3 flex flex-wrap gap-1">
            {Array.from({ length: totalDots }).map((_, index) => {
              const isFilled = highlightCompleted && index < completedDots;
              const isPausedDot =
                typeof pausedDotIndex === "number" &&
                pausedDotIndex > 0 &&
                index + 1 === pausedDotIndex &&
                !isFilled;
              return (
                <span
                  key={`${book.id}-dot-${index}`}
                  className={`h-2.5 w-2.5 rounded-full ${
                    isPausedDot
                      ? "border-2 border-black"
                      : "border border-black/30"
                  } ${isFilled ? "bg-black" : "bg-transparent"}`}
                />
              );
            })}
          </div>
        ) : null}
        <div className="text-sm font-semibold text-gray-900">{book.title}</div>
        {meta ? (
          <div className="text-xs font-medium text-gray-500">{meta}</div>
        ) : null}
      </div>
    </button>
  );
};

export default CircleCard;
