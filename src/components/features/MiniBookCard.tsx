import React from "react";
import { Book } from "../sections/LibrarySection";

// Only including the necessary props for MiniBookCard
type MiniBookCardProps = Pick<Book, "id" | "thumbnailUrl" | "title"> & {
  onAction: (bookId: string) => void;
};

const MiniBookCard: React.FC<MiniBookCardProps> = ({
  id,
  thumbnailUrl,
  title,
  onAction,
}) => (
  <div
    className="flex flex-col items-center w-full"
    data-id={`mini-book-card-${id}`}
  >
    <button
      type="button"
      onClick={() => onAction(id)}
      className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-500"
      aria-label={`Select book: ${title}`}
      style={{ cursor: "pointer" }}
    >
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : null}
    </button>
    <div className="font-semibold text-center mt-2 text-sm">{title}</div>
  </div>
);

export default MiniBookCard;
