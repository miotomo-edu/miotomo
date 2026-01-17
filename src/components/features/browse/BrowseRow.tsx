import React from "react";
import CircleCard from "./CircleCard";
import type { Book } from "../../sections/LibrarySection";

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
  <section className="space-y-3">
    <div className="flex items-end justify-between">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
    {items.length > 0 ? (
      <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
    ) : (
      <div className="rounded-2xl border border-dashed border-black/10 bg-white/60 px-4 py-6 text-sm font-medium text-gray-500">
        {emptyMessage || "No circles yet."}
      </div>
    )}
  </section>
);

export default BrowseRow;
