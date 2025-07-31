import React from "react";
import { Book } from "../sections/LibrarySection";

type BookTitleProps = {
  book: Book;
  chapter: number;
  onBack?: () => void;
};

const BookTitle = ({ book, chapter, onBack }: BookTitleProps) => (
  <div className="w-full px-6 py-4 flex items-start">
    {/* Back button, top-aligned */}
    <button
      onClick={onBack}
      className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center mr-8 mt-1"
      aria-label="Back"
      type="button"
      style={{ flexShrink: 0 }}
    >
      {/* Arrow icon */}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13 16L7 10L13 4"
          stroke="#000"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
    {book.thumbnailUrl && (
      <img
        src={book.thumbnailUrl}
        alt={book.title}
        className="w-12 h-16 object-cover rounded shadow mr-4"
        style={{ flexShrink: 0 }}
      />
    )}
    <div>
      <h1 className="text-black text-2xl font-bold">{book.title}</h1>
      <div className="text-base font-medium mt-1">Chapter {chapter}</div>
    </div>
  </div>
);

export default BookTitle;
