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

const badgeStyle = (badge: string): string => {
  if (badge === "NEW") return "bg-leaf-500 text-parchment-50";
  if (badge === "REPLAY") return "bg-sky-500 text-parchment-50";
  if (badge === "Continue") return "bg-ochre-400 text-motara-950";
  return "bg-motara-950/85 text-parchment-50";
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
      className="group flex w-40 shrink-0 cursor-pointer flex-col gap-2 text-left md:w-64 md:gap-3"
      aria-label={`Open circle: ${book.title}`}
    >
      <div className="mio-media relative aspect-[2/3] w-full overflow-hidden rounded-[22px] bg-motara-800 ring-1 ring-parchment-150/12">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-motara-700 text-sm font-semibold text-parchment-250">
            No cover
          </div>
        )}
        {badge ? (
          <span
            className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold uppercase tracking-wide md:px-3 md:py-1 md:text-xs ${badgeStyle(badge)}`}
          >
            {badge}
          </span>
        ) : null}
      </div>
      <div className="space-y-0.5">
        {kicker ? (
          <div className="font-mono text-xs font-medium uppercase tracking-widest text-parchment-450 md:text-sm">
            {kicker}
          </div>
        ) : null}
        <div className="font-display text-sm font-semibold text-parchment-150 md:text-xl">
          {book.title}
        </div>
        {meta ? (
          <div className="text-xs font-medium text-parchment-450 md:text-base">
            {meta}
          </div>
        ) : null}
      </div>
    </button>
  );
};

export default CircleCard;
