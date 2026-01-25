import React from "react";
import { Book } from "../sections/LibrarySection";
import { getBookSectionType } from "../../utils/bookUtils";

type BookTitleProps = {
  book: Book;
  chapter: number;
  subtitle?: string;
  useSubtitleAsTitle?: boolean;
  onBack?: () => void;
  isDark?: boolean;
};

const BookTitle = ({
  book,
  chapter,
  subtitle,
  useSubtitleAsTitle = false,
  onBack,
  isDark = false,
}: BookTitleProps) => (
  <div
    className={`w-full px-6 py-4 flex items-start ${
      isDark ? "text-white" : "text-black"
    }`}
  >
    {/* Back button, top-aligned */}
    <button
      onClick={onBack}
      className={`w-10 h-10 flex items-center justify-center mr-8 mt-1 rounded-full transition-colors duration-200 ease-in-out md:w-14 md:h-14 md:mr-10 ${
        isDark
          ? "bg-white/10 hover:bg-white/20"
          : "hover:bg-gray-200 hover:text-blue-600"
      }`}
      aria-label="Back"
      type="button"
      style={{ flexShrink: 0 }}
    >
      {/* Arrow icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="md:h-6 md:w-6"
      >
        <path
          d="M15.8327 10L4.16602 10.0003L9.99935 4.16699L4.16602 10.0003L9.99935 15.8337"
          stroke={isDark ? "white" : "black"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
    {/*{book.thumbnailUrl && (
      <img
        src={book.thumbnailUrl}
        alt={book.title}
        className="w-12 h-16 object-cover rounded shadow mr-4"
        style={{ flexShrink: 0 }}
      />
    )}*/}
    <div>
      <h1
        className={`text-3xl font-bold md:text-4xl ${isDark ? "text-white" : "text-black"}`}
      >
        {useSubtitleAsTitle && subtitle ? subtitle : book.title}
      </h1>
      <div
        className={`text-base font-medium mt-1 capitalize md:text-2xl ${
          isDark ? "text-white/70" : "text-gray-700"
        }`}
      >
        {useSubtitleAsTitle
          ? book.title
          : subtitle || `${getBookSectionType(book.section_type)} ${chapter}`}
      </div>
    </div>
  </div>
);

export default BookTitle;
