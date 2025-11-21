import React from "react";
import SplitColorButton from "../common/SplitColorButton";
import ProgressBar from "../common/ProgressBar";
import { PlayIcon } from "../common/icons/PlayIcon";
import { Book } from "../sections/LibrarySection";
import { getBookSectionType } from "../../utils/bookUtils";
// No longer importing BookCard as we're using a custom layout for each book

const SESSION_SECONDS = 15 * 60;

const ActiveBadge: React.FC<{ elapsedSeconds: number }> = ({
  elapsedSeconds,
}) => {
  const remaining = Math.max(SESSION_SECONDS - Math.max(0, elapsedSeconds), 0);
  const minutes = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(remaining % 60)
    .toString()
    .padStart(2, "0");

  return (
    <div className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
      <span className="h-2 w-2 rounded-full bg-green-500" />
      Time left {minutes}:{seconds}
    </div>
  );
};

type CurrentBookSectionProps = {
  books: Book[]; // Remains an array of books
  chapter?: number;
  onContinue?: (book: Book, chapter: number) => void; // Passes the specific book being interacted with
  activeConversations?: Record<string, number>;
};

const CurrentBookSection: React.FC<CurrentBookSectionProps> = ({
  books,
  chapter,
  onContinue,
  activeConversations = {},
}) => (
  <section className="py-6 mb-6 px-4">
    {/* This is the carousel container */}
    <div className="flex overflow-x-auto gap-4 pb-4">
      {books.map((book) => {
        const effectiveChapter =
          typeof chapter === "number"
            ? chapter
            : Math.max(book.progress ?? 1, 1);
        const progressSplit =
          book.chapters > 0
            ? Math.max(0, (((book.progress ?? 1) - 1) / book.chapters) * 100)
            : 0;

        return (
          // Each book item in the carousel
          // className="flex-shrink-0 w-100"
          <div key={book.id}>
            {/* Fixed width and no shrinking for carousel item */}
            <div className="px-4 py-4 border-black border-2 rounded-xl h-full flex flex-col">
              {/* Added h-full and flex-col for internal layout */}
              <div className="flex items-stretch gap-4">
                <div
                  className="flex-shrink-0 w-1/4"
                  data-id="current-book-cover"
                >
                  <div className="h-full w-full bg-gray-200 rounded overflow-hidden">
                    <img
                      src={book.thumbnailUrl}
                      alt={`${book.title} cover`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                </div>
                <div
                  className="flex flex-col justify-between w-3/4"
                  data-id="current-book-info"
                >
                  <div>
                    <div className="text-xl font-bold">{book.title}</div>
                    <div className="text-gray-500">by {book.author}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold capitalize">
                      {getBookSectionType(book.section_type)} {effectiveChapter}
                    </div>
                    {typeof activeConversations[book.id] === "number" && (
                      <ActiveBadge elapsedSeconds={activeConversations[book.id]} />
                    )}
                  </div>

                  <button
                    className="bg-black text-white font-bold py-2 px-4 rounded-lg w-full mt-2"
                    onClick={() =>
                      onContinue && onContinue(book, effectiveChapter)
                    }
                  >
                    Continue talking
                  </button>
                  <ProgressBar
                    leftColor="#000" // Using the same left color as SplitColorButton for consistency
                    rightColor="#E0E0E0" // A light gray for the "unfilled" part of the bar
                    split={progressSplit}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </section>
);

export default CurrentBookSection;
