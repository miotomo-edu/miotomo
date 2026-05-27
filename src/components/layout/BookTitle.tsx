import React from "react";
import { Book } from "../sections/LibrarySection";
import { getBookSectionType } from "../../utils/bookUtils";

type BookTitleProps = {
  book: Book;
  chapter: number;
  subtitle?: string;
  useSubtitleAsTitle?: boolean;
  onBack?: () => void;
  showBackButton?: boolean;
  isDark?: boolean;
  darkBackButton?: boolean;
};

const BookTitle = ({
  book,
  chapter,
  subtitle,
  useSubtitleAsTitle = false,
  onBack,
  showBackButton = true,
  isDark = false,
  darkBackButton = false,
}: BookTitleProps) => (
  <div
    className={`flex w-full items-start px-6 py-4 ${
      isDark ? "text-parchment-150" : "text-motara-950"
    }`}
  >
    {showBackButton ? (
      <button
        onClick={onBack}
        className={`mr-8 mt-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out md:mr-10 md:h-14 md:w-14 ${
          isDark
            ? "bg-parchment-150/10 hover:bg-parchment-150/20"
            : darkBackButton
              ? "bg-motara-950 hover:bg-motara-850"
            : "hover:bg-motara-950/10 hover:text-sky-500"
        }`}
        aria-label="Back"
        type="button"
        style={{ flexShrink: 0 }}
      >
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
            stroke={isDark || darkBackButton ? "#f0e6cf" : "#171222"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    ) : null}
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
        className={`font-display text-3xl font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] md:text-4xl ${isDark ? "text-parchment-150" : "text-motara-950"}`}
      >
        {useSubtitleAsTitle && subtitle ? subtitle : book.title}
      </h1>
      <div
        className={`mt-1 text-base font-medium capitalize drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)] md:text-2xl ${
          isDark ? "text-parchment-250" : "text-motara-700"
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
