import React from "react";
import { Book } from "../sections/LibrarySection";
import SplitColorButton from "../common/SplitColorButton";

type BookCardProps = Book & {
  onAction: () => void;
};

const BookCard: React.FC<BookCardProps> = ({
  thumbnailUrl,
  title,
  author,
  status,
  progress,
  chapters,
  onAction,
}) => (
  <div className="bg-[#eeeeee] rounded-xl p-4 flex flex-col items-center w-full border border-none">
    <div className="w-full flex justify-center mb-2">
      <div className="w-24 aspect-[2/3] bg-gray-200 rounded flex items-center justify-center overflow-hidden">
        <button
          type="button"
          onClick={onAction}
          className="w-24 aspect-[2/3] bg-gray-200 rounded flex items-center justify-center overflow-hidden focus:outline-none focus:ring-2 focus:ring-orange-500"
          style={{ cursor: "pointer" }}
          aria-label={`Select book: ${title}`}
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover rounded"
            />
          ) : null}
        </button>
      </div>
    </div>
    <div className="font-semibold text-left w-full">{title}</div>
    <div className="text-gray-500 text-sm text-left mb-2 w-full">{author}</div>
    <div className="flex justify-between items-center w-full mb-2"></div>
    <SplitColorButton
      text={status === "started" ? "Continue" : "Let's talk"}
      leftColor="#E85C33"
      rightColor="#000"
      split={Math.max(0, ((progress - 1) / chapters) * 100)}
      onClick={onAction}
      className="mt-auto w-full"
    />
  </div>
);

export default BookCard;
