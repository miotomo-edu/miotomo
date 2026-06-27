import React from "react";
import type { Book } from "../../../types";
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

const badgeStyle = (badge: string): string => {
  if (badge === "NEW") return "bg-emerald-500 text-white";
  if (badge === "REPLAY") return "bg-sky-500 text-white";
  if (badge === "Continue") return "bg-amber-400 text-black";
  return "bg-black/80 text-white";
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
      className="browse-circle-card group flex w-40 shrink-0 flex-col gap-2 text-left !bg-transparent md:w-64 md:gap-3"
      aria-label={`Open adventure: ${book.title}`}
    >
      <div className="browse-circle-card__cover relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-white/70 ring-1 ring-black/10">
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
          <span
            className={`browse-circle-card__badge absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide md:px-3 md:py-1 md:text-xs ${badgeStyle(badge)}`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="browse-circle-card__meta space-y-0.5">
        {kicker ? (
          <div className="browse-circle-card__kicker text-xs font-semibold uppercase tracking-wide text-white/70 md:text-sm">
            {kicker}
          </div>
        ) : null}
        <div className="browse-circle-card__title font-display text-sm font-semibold text-white md:text-xl">
          {book.title}
        </div>
        {meta ? (
          <div className="browse-circle-card__detail text-xs font-medium text-white/55 md:text-base">
            {meta}
          </div>
        ) : null}
      </div>
    </button>
  );
};

export default CircleCard;
