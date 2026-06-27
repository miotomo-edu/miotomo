import React from "react";
import CircleCard from "./CircleCard";
import type { Book } from "../../../types";

export type BrowseRowItem = {
  book: Book;
  chapter: number;
  badge?: string;
  meta?: string;
  kicker?: string;
  totalDots?: number;
  completedDots?: number;
  highlightCompleted?: boolean;
  pausedDotIndex?: number;
};

type BrowseRowProps = {
  title: string;
  items: BrowseRowItem[];
  onSelect: (item: BrowseRowItem) => void;
  emptyMessage?: string;
};

const BrowseRow: React.FC<BrowseRowProps> = ({
  title,
  items,
  onSelect,
  emptyMessage,
}) => (
  <section className="browse-row space-y-3">
    <div className="flex items-center gap-2.5">
      <span
        className="inline-block h-5 w-1.5 flex-shrink-0 rounded-full bg-[#b6c356]"
        aria-hidden="true"
      />
      <h2 className="browse-row__title font-display text-xl font-bold text-white md:text-3xl">
        {title}
      </h2>
    </div>
    {items.length > 0 ? (
      <div className="relative">
        <div className="browse-row__scroller flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <CircleCard
              key={item.book.id}
              book={item.book}
              badge={item.badge}
              meta={item.meta}
              kicker={item.kicker}
              totalDots={item.totalDots}
              completedDots={item.completedDots}
              highlightCompleted={item.highlightCompleted}
              pausedDotIndex={item.pausedDotIndex}
              onSelect={() => onSelect(item)}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#4F415F] to-transparent" />
      </div>
    ) : (
      <div className="rounded-2xl border border-dashed border-white/20 bg-white/10 px-4 py-6 text-sm font-medium text-white/55 md:text-lg">
        {emptyMessage || "No adventures yet."}
      </div>
    )}
  </section>
);

export default BrowseRow;
