import React from "react";
import SplitColorButton from "../common/SplitColorButton";
import { PlayIcon } from "../common/icons/PlayIcon";
import { Book } from "../sections/LibrarySection";

type CurrentBookSectionProps = {
  book: Book;
  onContinue?: () => void;
};

const CurrentBookSection: React.FC<CurrentBookSectionProps> = ({
  book,
  onContinue,
}) => (
  <section className="py-6 mb-6  px-4">
    <h2 className="text-3xl font-semibold mb-4">
      Continue chatting with Miotomo
    </h2>
    <div className="px-4 py-4 border-black border rounded-xl bg-white bg-opacity-0">
      <div className="flex items-stretch gap-4">
        <div className="flex-shrink-0 w-1/4" data-id="current-book-cover">
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
          <SplitColorButton
            text="Continue talking"
            rightColor="#000"
            leftColor="#F78AD7"
            split={book.progress}
            onClick={onContinue}
            icon={<PlayIcon />}
          />
        </div>
      </div>
    </div>
  </section>
);

export default CurrentBookSection;
